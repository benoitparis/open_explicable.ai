import {ParquetReader} from "@dsnp/parquetjs/dist/browser/parquet.esm";
import {FileMetaDataExt} from "@dsnp/parquetjs/dist/lib/declare";
import {Buffer} from 'buffer';

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

const readParquet = <T> (url:string):() => Promise<DataSet<T>> =>
    () => fetch(url)
        .then(res => res.blob())
        .then(blob => blob.arrayBuffer())
        .then(Buffer.from)
        .then(buff => ParquetReader.openBuffer(buff))
        .then(readFull<T>)
        // .catch(console.error)
;

export const getJson = <T> (url:string):() => Promise<T> =>
    () => fetch(url)
        .then(res => res.json())
;

export const getDataConfiguration = getJson<DataConfiguration>("data/conf.json");
export const getDataDescription = getJson<DataDescription>("data/data-description.json");
export const getDataTour = getJson<DataTour>("data/data-tour.json");

// export const getPoints = readParquet<DataPoint>("data/data-points.parquet");
export const getPoints = readParquet<DataPoint>("data/data-xg-shap-points.parquet");
export const getDataValues = readParquet<any>("data/data-cleaned-file.parquet");
// export const getAttributionValues = readParquet<any>("data/data-attribution-values.parquet");
export const getAttributionValues = readParquet<any>("data/data-xg-attribution-values.parquet");
export const getTree = readParquet<any>("data/data-tree.parquet");
export const getRuleDefinitions = readParquet<any>("data/data-rule-definitions.parquet");
export const getBinaryParticipations = readParquet<any>("data/data-binary-participations.parquet");
