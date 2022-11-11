import React, {useEffect, useState} from 'react';
import {Canvas} from '@react-three/fiber';
import CameraController from "./CameraController";
import DataPoints from "./DataPoints";
import {Vector3} from "three";
import {
    DataConfiguration,
    DataPoint,
    getConfiguration,
    getDataset,
    getPoints,
    getShapValues,
    getTree,
    getRuleDefinitions,
    getBinaryParticipations,
    DataSet,
} from "./DataManagement";
import AttributionPlot from "./AttributionPlot";


function AttributionSpace(props:{displayed:boolean, display: () => void}) {

    const [center, setCenter] = useState<Vector3>(new Vector3());
    const [selected, setSelected] = useState<number|null>(null);

    const [configuration, setConfiguration] = useState<DataConfiguration|null>(null);
    const [points, setPoints] = useState<DataSet<DataPoint>|null>(null);
    const [dataset, setDataset] = useState<DataSet<any>|null>(null);
    const [shapValues, setShapValues] = useState<DataSet<any>|null>(null);
    const [tree, setTree] = useState<DataSet<any>|null>(null);
    // const [ruleDefinitions, setRuleDefinitions] = useState<DataSet<any>|null>(null);
    // const [binaryParticipations, setBinaryParticipations] = useState<DataSet<any>|null>(null);

    useEffect(() => {
        Promise.resolve()
            .then(getConfiguration)
            .then(setConfiguration)
            .then(getPoints)
            .then(setPoints)
            .then(() => Promise.all([
                Promise.resolve().then(getDataset).then(setDataset),
                Promise.resolve().then(getShapValues).then(setShapValues),
                Promise.resolve().then(getTree).then(setTree),
                // Promise.resolve().then(getRuleDefinitions).then(setRuleDefinitions),
                // Promise.resolve().then(getBinaryParticipations).then(setBinaryParticipations),
            ]))
    }, []);

    return (

        <>
            {props.displayed && selected?
                <AttributionPlot
                    selected={selected}
                    configuration={configuration}
                    dataset={dataset}
                    shapValues={shapValues}
                    points={points}
                />
                :""
            }
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
                        setSelected={setSelected}
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