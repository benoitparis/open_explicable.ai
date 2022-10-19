import React from 'react';
import {Canvas} from '@react-three/fiber';
import CameraController from "./CameraController";
import DataPoints from "./DataPoints";

function AttributionSpace(props:{displayed:boolean, display: () => void}) {
    return (
        <Canvas onClick={props.display}>
            <CameraController isBackground={!props.displayed}/>
            <ambientLight />
            <pointLight position={[0, 0, 0]}  />
            <DataPoints/>
        </Canvas>
    );
}

export default AttributionSpace;