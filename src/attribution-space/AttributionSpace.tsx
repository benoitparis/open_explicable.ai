import React, {useEffect, useState} from 'react';
import {Canvas} from '@react-three/fiber';
import CameraController from "./CameraController";
import DataPoints from "./DataPoints";
import {Vector3} from "three";
import {
    DataConfiguration,
    DataDescription,
    DataTour,
    DataSet,
    DataPoint,
    getDataConfiguration,
    getDataDescription,
    getDataTour,
    getPoints,
    getDataValues,
    getAttributionValues,
    getTree,
    getRuleDefinitions,
    getBinaryParticipations,
} from "./DataManagement";
import AttributionPlot from "./AttributionPlot";
import DataTourMenu from "./DataTourMenu";

function AttributionSpace(props:{displayed:boolean, display:() => void}) {

    const [center, setCenter] = useState<Vector3>(new Vector3());
    const [selected, setSelected] = useState<number|null>(null);
    const [cameraFollows, setCameraFollows] = useState<boolean>(true);
    const [showWaterfall, setShowWaterfall] = useState<boolean>(true);

    const [configuration, setConfiguration] = useState<DataConfiguration|null>(null);
    const [dataDescription, setDataDescription] = useState<DataDescription|null>(null);
    const [dataTour, setDataTour] = useState<DataTour|null>(null);
    const [points, setPoints] = useState<DataSet<DataPoint>|null>(null);
    const [dataValues, setDataValues] = useState<DataSet<any>|null>(null);
    const [attributionValues, setAttributionValues] = useState<DataSet<any>|null>(null);
    const [tree, setTree] = useState<DataSet<any>|null>(null);
    // const [ruleDefinitions, setRuleDefinitions] = useState<DataSet<any>|null>(null);
    // const [binaryParticipations, setBinaryParticipations] = useState<DataSet<any>|null>(null);

    const getSet = <T,> (get:() => Promise<T>, set:(it:T) => void) => {
        return Promise.resolve().then(get).then(set).catch(console.error);
    }

    useEffect(() => {
        Promise.resolve()
            .then(() => Promise.all([
                getSet(getDataConfiguration, setConfiguration),
                getSet(getDataTour, setDataTour),
                getSet(getPoints, setPoints),
            ]))
            .then(() => Promise.all([
                getSet(getDataValues, setDataValues),
                getSet(getDataDescription, setDataDescription),
                getSet(getAttributionValues, setAttributionValues),
                // [getTree, setTree],
                // [getRuleDefinitions, setRuleDefinitions],
                // [getBinaryParticipations, setBinaryParticipations],
            ]))
    }, []);

    return (
        <>
            {props.displayed && selected && showWaterfall?
                <AttributionPlot
                    selected={selected}
                    configuration={configuration}
                    dataDescription={dataDescription}
                    dataValues={dataValues}
                    attributionValues={attributionValues}
                    points={points}
                />
                :""
            }
            <DataTourMenu
                dataTour={dataTour}
                setSelected={setSelected}
                setShowWaterfall={setShowWaterfall}
                display={props.display}
                setCameraFollows={setCameraFollows}
            />
            <div style={{
                position:"absolute",
                top:0,
                width: "100%",
                height: "100%",
                overflow: "hidden"
            }}>
                <Canvas onClick={props.display}>
                    <CameraController isBackground={!props.displayed} center={center} cameraFollows={cameraFollows}/>
                    <ambientLight/>
                    <pointLight position={[0, 0, 0]}/>
                    <DataPoints
                        setCenter={setCenter}
                        selected={selected}
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