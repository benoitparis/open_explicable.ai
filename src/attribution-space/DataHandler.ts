import parquets, {ParquetReader} from "@dsnp/parquetjs/dist/browser/parquet.esm";

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
type DataPoint = {
    x:number,
    y:number,
    z:number,
    __prediction:number
}

const readParquet = async <T> (reader: ParquetReader):Promise<Array<T>> => {
    let cursor = reader.getCursor();
    let points:Array<T> = [];
    let record = null;
    while (record = await cursor.next()) {
        points.push(record as T)
    }
    return points;
}

// TODO rename dataprovider
class DataHandler {

    private path:string;
    private configuration:DataConfiguration|null = null;
    private points:Array<DataPoint>|null = null;

    public constructor(path:string) {
        console.log('constructor');
        this.path = path;
    }

    // TODO this
    // console.log((await this.configuration)['datapoint_number'] + 1)
    // console.log(reader.metadata?.num_rows)
    // console.log(reader)
    //
    // props.setSchema(reader.schema);

    // public configuration:Promise<DataConfiguration> = this
    //     .path
    //     .then((it) => {console.log('path'); return it})
    //     .then(fetch)
    //     .then((it) => {console.log('fetchpath'); return it})
    //     .then(res => res.json() as unknown as DataConfiguration)

    public getConfiguration = async () => {
        if (!this.configuration) {
            console.log('configuration');
            this.configuration = await fetch(this.path)
                .then(res => res.json() as unknown as DataConfiguration)
        }
        return this.configuration as DataConfiguration
    }

    public getPoints = async () => {
        await this.getConfiguration();

        if (!this.points) {
            console.log('points');
            this.points = await parquets.ParquetReader.openUrl("data/data-points.parquet")
                .then(readParquet<DataPoint>)
        }
        return this.points as Array<DataPoint>
    }

    // public points:Promise<Array<DataPoint>> = this
    //     .configuration
    //     .then((it) => {console.log('configuration'); return it})
    //     .then(() => 'data/data-points.parquet')// TODO get from conf
    //     .then((it) => {console.log('openUrl before'); return it})
    //     .then((it) => parquets.ParquetReader.openUrl(it))
    //     .then((it) => {console.log('openUrl after'); return it})
    //     .then(readParquet<DataPoint>)

    // public dataSet:Promise<Array<Object>> = this
    //     .configuration
    //     .then(() => 'data/data-cleaned-file.parquet')
    //     .then((it) => parquets.ParquetReader.openUrl(it))
    //     .then(readParquet<Object>)
    //
    // // const fields = reader.schema.fieldList
    // // fields.forEach(field => console.log(record[field.name]))
    // public shapValues:Promise<Array<Object>> = this
    //     .configuration
    //     .then(() => 'data/data-shap-values.parquet')
    //     .then((it) => parquets.ParquetReader.openUrl(it))
    //     .then(readParquet<Object>)
    //
    // public tree:Promise<Array<Object>> = this
    //     .configuration
    //     .then(() => 'data/data-tree.parquet')
    //     .then((it) => parquets.ParquetReader.openUrl(it))
    //     .then(readParquet<Object>)
    //
    // public ruleDefinitions:Promise<Array<Object>> = this
    //     .configuration
    //     .then(() => 'data/data-rule-definitions.parquet')
    //     .then((it) => parquets.ParquetReader.openUrl(it))
    //     .then(readParquet<Object>)
    //
    // public binaryParticipations:Promise<Array<Object>> = this
    //     .configuration
    //     .then(() => 'data/data-binary-participations.parquet')
    //     .then((it) => parquets.ParquetReader.openUrl(it))
    //     .then(readParquet<Object>)

}


export default DataHandler;
