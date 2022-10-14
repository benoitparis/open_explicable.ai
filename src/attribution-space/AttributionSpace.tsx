import React from 'react'
import {Canvas} from '@react-three/fiber'
import Box from "./Box";
import CameraController from "./CameraController";
import DataPointList from "./DataPointList";

function AttributionSpace() {
    return (
        <Canvas>
            <CameraController />
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <DataPointList/>
            {/*<Box position={[-1.2, 0, 0]} />*/}
            {/*<Box position={[1.2, 0, 0]} />*/}
        </Canvas>
    );
}

export default AttributionSpace;