import Cleaning
import glob
import json


def print_diff(name, expected, actual):
    expected_content = open(expected, 'r').read()
    actual_content = open(actual, 'r').read()

    if expected_content == actual_content:
        print(f"{name} is ok")
    else:
        print(f"A difference was found in {name}:")
        print(f"   --Expected--")
        print(f"{expected_content}#EOF")
        print(f"vs -- Actual --")
        print(f"{actual_content}#EOF")


def scan_test():
    for sourcePath in glob.glob("*.source.csv"):
        name = sourcePath.replace(".source.csv", "")
        expected_df_path = sourcePath.replace(".source.csv", ".expected-df.csv")
        actual_df_path = sourcePath.replace(".source.csv", ".actual-df.csv")
        expected_labels_path = sourcePath.replace(".source.csv", ".expected-labels.json")
        actual_labels_path = sourcePath.replace(".source.csv", ".actual-labels.json")

        df, labels_mapping = Cleaning.from_path(sourcePath)
        df.to_csv(actual_df_path, index=False)
        open(actual_labels_path, "wt").write(json.dumps(labels_mapping))

        print_diff(f"{name} df", expected_df_path, actual_df_path)
        print_diff(f"{name} labels", expected_labels_path, actual_labels_path)


scan_test()
