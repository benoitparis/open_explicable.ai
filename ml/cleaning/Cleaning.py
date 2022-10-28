import pandas as pd
from tableschema import Table


def from_path(path):
    # TODO detect header
    # TODO excel files
    # TODO limit number of categories?
    # TODO one-hot?
    # TODO other missing data
    # TODO vraiment pick out la dernière colonne (ou bien celle choisie) et la renvoyer

    table = Table(path)
    table.infer()
    # print(table.schema.descriptor)

    df = pd.read_csv(path, dtype='object', header=0)

    output_columns = []
    labels_mapping = {}

    for column in df:
        nullness = df.isnull().any().get(column)
        table_type = table.schema.get_field(column).type
        pandas_type = {
            'integer': 'int64',
            'number': 'float64',
            'string': 'str',
        }[table_type]
        fillna_value = {
            'integer': '-1',
            'number': '-1',
            'string': '___missing_data___',
        }[table_type]

        if nullness:
            # df = pd.concat([df1, df2], axis=1)
            df[column + "_missing"] = df[column].isnull().astype(int)
            df[column] = df[column].fillna(fillna_value)

        df[column] = df[column].astype(pandas_type)

        if 'str' == pandas_type:
            values = df[column].astype(str).unique()
            values.sort()
            mappings = {}
            for i, value in enumerate(values):
                mappings[value] = i
            df[column] = df[column].map(mappings)
            labels_mapping[column] = mappings

        output_columns.append(df[column])
        if nullness:
            output_columns.append(df[column + "_missing"])

    return pd.concat(output_columns, axis=1), labels_mapping
