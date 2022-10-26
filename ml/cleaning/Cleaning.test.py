import Cleaning
import glob



# df = Cleaning.from_path('test.csv')


for expectedPath in glob.glob("*.expected.csv"):
    inputPath = expectedPath.replace(".expected", "")
    actualPath = expectedPath.replace(".expected", ".actual")

    Cleaning.to_path(Cleaning.from_path(inputPath), actualPath)

    expectedContent = open(expectedPath, 'r').read()
    actualContent = open(actualPath, 'r').read()

    if expectedContent == actualContent:
        print(f"{inputPath} is ok")
    else:
        print(f"A difference was found in {inputPath}:")
        print(f"{expectedContent}#EOF")
        print(f"vs")
        print(f"{actualContent}#EOF")




# print(f"dtype ok: {'float64' == df.dtypes['col_num_float']}")
# print(f"dtype ok: {'float64' == df.dtypes['col_num_float_missing']}")
# print(f"dtype ok: {'int64'   == df.dtypes['col_num_int']}")
# print(f"dtype ok: {'int64'   == df.dtypes['col_num_int_missing']}")
# print(f"dtype ok: {'float64' == df.dtypes['col_categ']}")
# print(f"dtype ok: {'float64' == df.dtypes['col_categ_missing']}")
# print(f"dtype ok: {'float64' == df.dtypes['col_nobegin']}")
# print(f"dtype ok: {'float64' == df.dtypes['col_misleading_1']}")
# print(f"dtype ok: {'float64' == df.dtypes['col_misleading_2']}")


# col_num_float,col_num_float_missing,col_num_int,col_num_int_missing,col_categ,col_categ_missing,col_nobegin,col_misleading_1,col_misleading_2
# df.dtypes["col_num"]

# ,col_num_missing,col_categ,col_categ_missing,col_nobegin,col_misleading_1,col_misleading_2


# print(f"From class Cleaning: {object1.get_path()}")
