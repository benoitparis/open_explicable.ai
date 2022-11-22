import {ParquetReader} from "@dsnp/parquetjs/dist/browser/parquet.esm";
import {FileMetaDataExt} from "@dsnp/parquetjs/dist/lib/declare";

export type ColumnName = string;
export type DataConfiguration = {
    "datapoint_number": number,
    "features": Array<ColumnName>,
    "label_mapping": {[key in ColumnName] : {[key in string]: number}},
    "mean": number,
    "predicted_variables": Array<ColumnName>,
    "rule_number": number,
    "std": number
}
export type DataDescription =
    {
        [key in ColumnName]: {
            description: string,
            values?: {[key in string]: string}
        }
    }
export type DataTour =
    Array<{
        title: string,
        body: string,
        selected_data_points_ids: Array<number>,
        show_waterfall: boolean
    }>

export type DataPoint = {
    x: number,
    y: number,
    z: number,
    __prediction: number
}

export type DataSet<T> = {
    metadata: FileMetaDataExt,
    data: Array<T>,
}

export const readFull = async<T> (reader: ParquetReader) => {
    // TODO throw error on bad loading

    let cursor = reader.getCursor();
    let data:Array<T> = [];
    let record = null;
    while (record = await cursor.next()) {
        data.push(record as T)
    }
    const metadata = reader.metadata
    await reader.close();
    return {
        data: data,
        metadata: metadata
    } as DataSet<T>;
}
const readParquet = <T> (url:string) =>
    () => Promise.resolve(url)
        .then(fetch)
        .then(response => response.blob())
        .then(URL.createObjectURL) // batch to one external request
        .then((url) => ParquetReader.openUrl(url))
        .then(readFull<T>);

export const getConfiguration =
    () => fetch("data/conf.json")
        .then(res => res.json() as unknown as DataConfiguration);
export const getDataDescription =
    () => fetch("data/data-description.json")
        .then(res => res.json() as unknown as DataDescription);
export const getDataTour =
    () => fetch("data/data-tour.json")
        .then(res => res.json() as unknown as DataTour)

;
// export const getPoints = readParquet<DataPoint>("data/data-points.parquet");
export const getPoints = readParquet<DataPoint>("data/data-xg-shap-points.parquet");
export const getDataValues = readParquet<any>("data/data-cleaned-file.parquet");
// export const getAttributionValues = readParquet<any>("data/data-attribution-values.parquet");
export const getAttributionValues = readParquet<any>("data/data-xg-attribution-values.parquet");
export const getTree = readParquet<any>("data/data-tree.parquet");
export const getRuleDefinitions = readParquet<any>("data/data-rule-definitions.parquet");
export const getBinaryParticipations = readParquet<any>("data/data-binary-participations.parquet");
