import pandas as pd


def from_path(path):
    df = pd.read_csv(path, dtype='object')

    for index, value in df.isnull().any().items():
        if value:
            df[index + "_missing"] = df[index].isnull().astype(int)
            df[index] = df[index].fillna(-1)

    for column in df:
        df[column] = df[column].convert_dtypes()
        print(df[column].dtype)
# TODO tester les dtypes
# object
# object
# int64
# vs
# string
# object
# Int64

    return df


def to_path(df, path):
    df.to_csv(path, index=False)
