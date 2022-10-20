import React, {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import CameraController from "./CameraController";
import DataPoints from "./DataPoints";
import {Vector3} from "three";

function AttributionSpace(props:{displayed:boolean, display: () => void}) {
    const [center, setCenter] = useState(new Vector3());

    return (
        <Canvas onClick={props.display}>
            <CameraController isBackground={!props.displayed} center={center}/>
            <ambientLight />
            <pointLight position={[0, 0, 0]}  />
            <DataPoints
                setCenter={setCenter}
                // pointsProps={{position: new Vector3( 0, 0, 0 )}}
            />
        </Canvas>
    );
}

export default AttributionSpace;