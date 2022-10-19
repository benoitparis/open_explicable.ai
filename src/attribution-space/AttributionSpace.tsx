import React from 'react';
import {Canvas} from '@react-three/fiber';
import CameraController from "./CameraController";
import DataPoints from "./DataPoints";

function AttributionSpace(props:{showSpace: ()=> void}) {
    return (
        <div style={{width:"100%", height:"100%"}}>
            <Canvas onClick={props.showSpace}>
                <CameraController />
                <ambientLight />
                <pointLight position={[10, 10, 10]} />
                <DataPoints position={[0, 1, 0]}/>
                {/*<Box position={[-1.2, 0, 0]} />*/}
                {/*<Box position={[1.2, 0, 0]} />*/}
            </Canvas>
        </div>
    );
}

export default AttributionSpace;