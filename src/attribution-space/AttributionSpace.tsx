import React, {useEffect, useState} from 'react';
import {Canvas} from '@react-three/fiber';
import CameraController from "./CameraController";
import DataPoints from "./DataPoints";
import {Vector3} from "three";
import AttributionPlot from "./AttributionPlot";
import DataHandler from "./DataHandler";
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

function AttributionSpace(props:{displayed:boolean, display: () => void}) {

    const [center, setCenter] = useState(new Vector3());

    const [configuration, setConfiguration] = useState<DataConfiguration|null>(null);
    const [points, setPoints] = useState<Array<DataPoint>|null>(null);

    const readPoints = async (configuration:any, reader: ParquetReader) => {
        // console.log(configuration['datapoint_number'] + 1)
        // console.log(reader.metadata?.num_rows)
        // console.log(reader)
        let cursor = reader.getCursor();
        let points:Array<DataPoint> = [];
        let record = null;
        while (record = await cursor.next()) {
            points.push(record as DataPoint)
        }
        return points;
    }
    // TODO abstract data management in handler class (ie not in display)
    // TODO load data only if in the app? nah, on load juste après, comme ça c'est prêt (en plus on doit être pret à montrer shap et values)

    useEffect(() => {
        fetch("data/conf.json")
            .then(res => res.json())
            .then(setConfiguration)
            .then(() => parquets.ParquetReader.openUrl('data/data-points.parquet'))
            .then((reader) => readPoints(configuration, reader))
            .then(setPoints)
    }, []);

    return (

        <>
            {/*<AttributionPlot/>*/}
            <div style={{
                position:"absolute",
                top:0,
                width: "100%",
                height: "100%",
                overflow: "hidden"
            }}>
                <Canvas onClick={props.display}>
                    <CameraController isBackground={!props.displayed} center={center}/>
                    <ambientLight />
                    <pointLight position={[0, 0, 0]}  />
                    <DataPoints
                        setCenter={setCenter}
                        configuration={configuration}
                        points={points}
                        // pointsProps={{position: new Vector3( 0, 0, 0 )}}
                    />
                    {/*{process.env.NODE_ENV !== "production" ?<Stats/>:""}*/}
                </Canvas>
            </div>
        </>
    );
}

export default AttributionSpace;