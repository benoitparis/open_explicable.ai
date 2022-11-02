import {ParquetReader} from "@dsnp/parquetjs/dist/browser/parquet.esm";
import {FileMetaDataExt} from "@dsnp/parquetjs/dist/lib/declare";

export type DataConfiguration = {
    "binary-participations": string,
    "data-prediction-embedding-cluster": string,
    "datapoint_number": number,
    "features": Array<string>,
    "label_mapping": object,
    "mean": number,
    "predicted_variables": Array<string>,
    "rule-definitions": string,
    "rule_number": number,
    "std": number
}
export type DataPoint = {
    x:number,
    y:number,
    z:number,
    __prediction:number
}

export type DataSet<T> = {
    metadata: FileMetaDataExt,
    data: Array<T>,
}

export const readFull = async<T> (reader: ParquetReader) => {
    let cursor = reader.getCursor();
    let data:Array<T> = [];
    let record = null;
    while (record = await cursor.next()) {
        data.push(record as T)
    }
    return {
        data: data,
        metadata: reader.metadata
    } as DataSet<T>;
}

export const getConfiguration =
    () => fetch("data/conf.json")
        .then(res => res.json() as unknown as DataConfiguration)

const readParquet = <T> (url:string) =>
    () => ParquetReader
        .openUrl(url)
        .then(readFull<T>);

export const getPoints = readParquet<DataPoint>("data/data-points.parquet");
export const getDataset = readParquet<any>("data/data-cleaned-file.parquet");
export const getShapValues = readParquet<any>("data/data-shap-values.parquet");
export const getTree = readParquet<any>("data/data-tree.parquet");
export const getRuleDefinitions = readParquet<any>("data/data-rule-definitions.parquet");
export const getBinaryParticipations = readParquet<any>("data/data-binary-participations.parquet");
