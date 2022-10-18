import React from 'react';
import {Canvas} from '@react-three/fiber';
import CameraController from "./CameraController";
import DataPoints from "./DataPoints";

function AttributionSpace(props:{showSpace: ()=> void}) {
    return (
        <Canvas onClick={props.showSpace}>
            <CameraController />
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <DataPoints position={[0, 1, 0]}/>
            {/*<Box position={[-1.2, 0, 0]} />*/}
            {/*<Box position={[1.2, 0, 0]} />*/}
        </Canvas>
    );
}

export default AttributionSpace;