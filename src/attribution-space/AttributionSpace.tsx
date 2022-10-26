import React, {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import CameraController from "./CameraController";
import DataPoints from "./DataPoints";
import {Vector3} from "three";
import AttributionPlot from "./AttributionPlot";

function AttributionSpace(props:{displayed:boolean, display: () => void}) {

    const [center, setCenter] = useState(new Vector3());
    const [selectedData, setSelectedData] = useState<number|null>(null);

    return (

        <>
            <AttributionPlot/>
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
                        // pointsProps={{position: new Vector3( 0, 0, 0 )}}
                    />
                    {/*{process.env.NODE_ENV !== "production" ?<Stats/>:""}*/}
                </Canvas>
            </div>
        </>
    );
}

export default AttributionSpace;