# TODO run it
# TODO librarize
# TODO XGBoost

## Global interpretation - Separation space
# We project the leaf node participations into a 3D space, and package representations to visualize it.







input_filename = "AmesHousing.csv"

#### Cleaning
from cleaning import Cleaning
df, labelMapping = Cleaning.from_path(input_filename)
df.to_parquet('data-cleaned-file.parquet', engine='fastparquet', compression='gzip')

X, y = df.iloc[:,:-1], df.iloc[:, -1] # Last one by convention
mean = y.mean()
std = y.std()

#from sklearn.model_selection import train_test_split
#X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=1)


#### Training

import pandas as pd
from rulefitcustom import RuleFitCustom
from sklearn import manifold

features = X.columns
X_mat = X.values

# max_rules empricirally chosen so as to maximize the graphical representation's AUC (at the end of this notebook)
# 400 c'est beau
rf = RuleFitCustom(max_rules=400, model_type='r')
rf.fit(X_mat, y, feature_names=features)
rules_df = pd.DataFrame({'Rule' : rf.rule_ensemble.rules}).astype("str")
rules_df.to_parquet('data-rule-definitions.parquet', engine='fastparquet', compression='gzip')

prediction = rf.predict(X_mat)
prediction_df = pd.DataFrame({'__prediction' : prediction})


#### Shap values
import shap
# TODO et partir de XGBoost ça marche pas mieux?
explainer = shap.TreeExplainer(rf.tree_generator)
shap_values = explainer.shap_values(X)
shap_values_df = pd.DataFrame(shap_values, columns=list(features.values))


import xgboost
xg_reg = xgboost.XGBRegressor()
xg_reg.fit(X_mat, y)
xg_prediction = xg_reg.predict(X_mat)
xg_prediction_df = pd.DataFrame({'__prediction' : xg_prediction})

xg_explainer = shap.TreeExplainer(xg_reg)
xg_shap_values = xg_explainer.shap_values(X)
xg_shap_values_df = pd.DataFrame(xg_shap_values, columns=list(features.values))



xg_shap_std = xg_shap_values_df.stack().std()

color_attenuation_factor = 3

import math
def highlight_cells(val):
    # must correspond with points color scheme, but different base color
    scaled_val = abs(max(-1, min(1, val / xg_shap_std / color_attenuation_factor)))
    if val > 0:
        r = int(255)
        g = int(255 - scaled_val * 255)
        b = int(255 - scaled_val * 255)
    else:
        r = int(255 - scaled_val * 255)
        g = int(255 - scaled_val * 255)
        b = int(255)
    # scaled_val = max(-127, min(128, val * 128 / xg_shap_std)) + 127
    # r = int(scaled_val)
    # g = int(255 * 0.2)
    # b = int(255 - scaled_val)
    hex_val = "#%0.6X" % ((((r << 8) + g) << 8) + b)
    return 'background-color: {}'.format(hex_val)

excel_data_predicted_df = pd.concat([df, xg_prediction_df], axis=1)
# excel_data_predicted_df = excel_data_predicted_df.style.applymap(highlight_cells)

excel_data_predicted_df = excel_data_predicted_df.style.apply(
    lambda x: xg_shap_values_df.applymap(highlight_cells),
    subset=excel_data_predicted_df.columns[:-2], # all but last 2: target, prediction
    axis=None)
excel_attributions_df = pd.concat([xg_shap_values_df, xg_prediction_df], axis=1)

with pd.ExcelWriter("Report_" + input_filename.replace(".csv", ".xlsx")) as writer:
    excel_data_predicted_df.to_excel(writer, sheet_name='Cleaned Data and Prediction', index=False)
    excel_attributions_df.to_excel(writer, sheet_name='Attributions', index=False)

import numpy as np

# par opposition à rf.X_rules, qui est weighed. Bon ici on weigh pas. Mais si on veut mix les deux il faudra faire attention
binaryParticipations = rf.rule_ensemble.transform(X_mat, weigh_rules = False)
# ou bien on la fait robuste
binaryParticipations = (binaryParticipations > 0.0000001)

dfBinaryParticipations = pd.DataFrame(binaryParticipations)
dfBinaryParticipations.rename(columns=lambda x: "_{}".format(x), inplace=True)
dfBinaryParticipations.to_parquet('data-binary-participations.parquet', engine='fastparquet', compression='gzip')

# TODO debordelize: only saving now because we need the colnames to match for building the excel
shap_values_df = shap_values_df.add_prefix('attribution_')
shap_values_df.to_parquet('data-attribution-values.parquet', engine='fastparquet', compression='gzip')
xg_shap_values_df = xg_shap_values_df.add_prefix('attribution_')
xg_shap_values_df.to_parquet('data-xg-attribution-values.parquet', engine='fastparquet', compression='gzip')


#### Embedding

# UMAP
import umap
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# TODO tester sur les shap values? les rules ça simplifie trop?
# https://stats.stackexchange.com/questions/235882/pca-in-numpy-and-sklearn-produces-different-results
x_std = StandardScaler().fit_transform(rf.X_rules)
embedding_data = PCA(n_components=50).fit_transform(x_std)
embedding = umap.UMAP(n_components=3).fit_transform(embedding_data)
embedding = embedding - embedding.mean(axis=0) # faudra care au predict a partir du umap à mettre ça aussi
embedding_df = pd.DataFrame({'x': embedding[:,0], 'y': embedding[:,1], 'z': embedding[:,2]})
points_df = pd.concat([embedding_df, prediction_df], axis=1)
points_df.to_parquet('data-points.parquet', engine='fastparquet', compression='gzip')


# xg_shap_embedding = umap.UMAP(n_components=3, n_neighbors=5).fit_transform(xg_shap_values) // good?
xg_shap_embedding = umap.UMAP(n_components=3, n_neighbors=5, min_dist=0.25).fit_transform(xg_shap_values)
xg_shap_embedding = xg_shap_embedding - xg_shap_embedding.mean(axis=0) # faudra care au predict a partir du umap à mettre ça aussi
xg_shap_embedding_df = pd.DataFrame({'x': xg_shap_embedding[:,0], 'y': xg_shap_embedding[:,1], 'z': xg_shap_embedding[:,2]})
xg_shap_points_df = pd.concat([xg_shap_embedding_df, xg_prediction_df], axis=1)
xg_shap_points_df.to_parquet('data-xg-shap-points.parquet', engine='fastparquet', compression='gzip')



#### Cluster structure

import hdbscan

clusterer = hdbscan.HDBSCAN(min_cluster_size=5, gen_min_span_tree=True)
clusterer.fit(embedding_df)
tree_df = clusterer.condensed_tree_.to_pandas()
tree_df.to_parquet('data-tree.parquet', engine='fastparquet', compression='gzip')

#TODO centroide
#TODO mean prediction

#
# # add root if not present
# if (tree_ct_df.loc[tree_ct_df['child'] == df.shape[0]].shape[0] == 0):
#     root = pd.DataFrame([[float('NaN'), df.shape[0], float('NaN'), df.shape[0], float('NaN'), float('NaN'), float('NaN')]], columns=tree_ct_df.columns)
#     tree_ct_df = tree_ct_df.append(root)
#     tree_ct_df = tree_ct_df.reset_index()
#
# gb = tree_ct_df.groupby(tree_ct_df['parent'])
#
# def getAndBuildCentroidValues(index):
#     localDf = tree_ct_df.loc[gb.groups[index]]
#     total = (0, 0, 0)
#     weight = 0
#     for localIndex, row in localDf.iterrows():
#         localTuple = row[['x', 'y', 'z']]
#         if (np.isnan(localTuple[0])):
#             localTuple = getAndBuildCentroidValues(row['child'])
#             print(localIndex)
#             print(localTuple)
#             print(tree_ct_df)
#             tree_ct_df.iloc[localIndex, 5] = localTuple[0]
#             tree_ct_df.iloc[localIndex, 6] = localTuple[1]
#             tree_ct_df.iloc[localIndex, 7] = localTuple[2]
#         total = (total[0] + localTuple[0] * row['child_size'], total[1] + localTuple[1] * row['child_size'], total[2] + localTuple[2] * row['child_size'])
#         weight = weight + row['child_size']
#     result = (total[0] / weight, total[1] / weight, total[2] / weight)
#
#
# rootTuple = getAndBuildCentroidValues(df.shape[0])
#
# tree_ct_df.iloc[-1, 5] = rootTuple[0]
# tree_ct_df.iloc[-1, 6] = rootTuple[1]
# tree_ct_df.iloc[-1, 7] = rootTuple[2]
#
#
# #### Export instance-level info
# # care format
# export_tree_df = tree_ct_df[['child', 'parent', 'lambda_val', 'child_size', 'x', 'y', 'z']].set_index('child')
# output = df.join(prediction_df).join(export_tree_df, how='outer').join(shap_values_df).reset_index().sort_values(by=['index'])
# output.to_parquet('data-prediction-embedding-cluster.parquet', engine='fastparquet', compression='gzip')


#### Evaluation of this 3D space as a map of the different behaviors
# TODO Faudra évaluer, et comparer au RF plus haut?"




#### Conf
import json

conf = {}
conf['features'] = features.to_list()
conf['predicted_variables'] = [y.name]
conf['mean'] = mean
conf['std'] = std
conf['label_mapping'] = labelMapping
conf['datapoint_number'] = df.shape[0]
conf['rule_number'] = len(rf.rule_ensemble.rules)

# TODO still needed ????????/
conf['binary-participations'] = 'binary-participations.csv'
conf['rule-definitions'] = 'rule-definitions.csv'
conf['data-prediction-embedding-cluster'] = 'data-prediction-embedding-cluster.csv'

conf['data-points'] = 'data-points.csv'
conf['data-shap-values'] = 'data-shap-values.csv'
conf['data-tree'] = 'data-tree.csv'
# TODO original data


with open('conf.json', 'w') as outfile:
    json.dump(conf, outfile, indent=4, sort_keys=True)
