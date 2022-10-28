# TODO run it
# TODO librarize
# TODO XGBoost

## Global interpretation - Separation space
# We project the leaf node participations into a 3D space, and package representations to visualize it.

#### Cleaning
from cleaning import Cleaning
df, labelMapping = Cleaning.from_path("AmesHousing.csv")

X, y = df.iloc[:,:-1], df.iloc[:, -1] # Last one by convention
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
rules_df = pd.DataFrame({'Rule' : rf.rule_ensemble.rules})
rules_df.to_csv('rule-definitions.csv', index=False)

prediction = rf.predict(X_mat)
prediction_df = pd.DataFrame({'__prediction' : prediction})

#### Shap values
import shap
                
explainer = shap.TreeExplainer(rf.tree_generator)
shap_values = explainer.shap_values(X)
shap_values_df = pd.DataFrame(shap_values, columns=list(map(lambda x: "attribution_" + x, features.values)))
shap_values_df.to_csv('data-shap-values.csv', index=False)


import numpy as np

# par opposition à rf.X_rules, qui est weighed. Bon ici on weigh pas. Mais si on veut mix les deux il faudra faire attention
binaryParticipations = rf.rule_ensemble.transform(X_mat, weigh_rules = False)
# ou bien on la fait robuste
binaryParticipations = (binaryParticipations > 0.0000001)

np.savetxt("binary-participations.csv", binaryParticipations, delimiter=",", fmt="%i")
dfBinaryParticipations = pd.DataFrame(binaryParticipations)
dfBinaryParticipations.rename(columns=lambda x: "{}".format(x), inplace=True)
dfBinaryParticipations.to_parquet('binary-participations.parquet')



#### Embedding

# UMAP
import umap
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# https://stats.stackexchange.com/questions/235882/pca-in-numpy-and-sklearn-produces-different-results
x_std = StandardScaler().fit_transform(rf.X_rules)
embedding_data = PCA(n_components=50).fit_transform(x_std)
embedding = umap.UMAP(n_components=3).fit_transform(embedding_data)
embedding = embedding - embedding.mean(axis=0) # faudra care au predict a partir du umap à mettre ça aussi
embedding_df = pd.DataFrame({'x' : embedding[:,0], 'y' : embedding[:,1], 'z' : embedding[:,2]})


points_df = pd.concat([embedding_df, prediction_df], axis=1)
points_df.to_csv('data-points.csv', index=False)

#### Cluster structure

import hdbscan

clusterer = hdbscan.HDBSCAN(min_cluster_size=5, gen_min_span_tree=True)
clusterer.fit(embedding_df)
tree_df = clusterer.condensed_tree_.to_pandas()
tree_df.to_csv('data-tree.csv', index=False)

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
# output.to_csv('data-prediction-embedding-cluster.csv', index=False)
# output.to_parquet('data-prediction-embedding-cluster.parquet', index=False)


#### Evaluation of this 3D space as a map of the different behaviors
# TODO Faudra évaluer, et comparer au RF plus haut?"




#### Conf
import json

conf = {}
conf['features'] = features.to_list()
conf['predicted_variables'] = [y.name]
conf['mean'] = y.mean()
conf['std'] = y.std()
conf['label_mapping'] = labelMapping
conf['datapoint_number'] = df.shape[0]
conf['rule_number'] = len(rf.rule_ensemble.rules)
conf['binary-participations'] = 'binary-participations.csv'
conf['rule-definitions'] = 'rule-definitions.csv'
conf['data-prediction-embedding-cluster'] = 'data-prediction-embedding-cluster.csv'

conf['data-points'] = 'data-points.csv'
conf['data-shap-values'] = 'data-shap-values.csv'
conf['data-tree'] = 'data-tree.csv'

with open('conf.json', 'w') as outfile:
    json.dump(conf, outfile, indent=4, sort_keys=True)
