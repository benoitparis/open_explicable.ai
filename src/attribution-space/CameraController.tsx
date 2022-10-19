import {useEffect} from "react";
import {useFrame, useThree} from "@react-three/fiber";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

let controls:OrbitControls|null = null;

const CameraController = (props:{isBackground:boolean}) => {
    const {camera, gl} = useThree();
    useFrame(() => {
        if (controls) {
            controls.enableZoom = !props.isBackground;
            controls.autoRotate = props.isBackground;
            controls.update();
        }
    })
    useEffect(
        () => {
            controls = new OrbitControls(camera, gl.domElement);
            controls.minDistance = 1;
            controls.maxDistance = 40;
            controls.autoRotateSpeed = 0.5;
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;

            const factor = 4;
            camera.position.x *= factor;
            camera.position.y *= factor;
            camera.position.z *= factor;

            return () => {
                if (controls) {
                    controls.dispose();
                }
            };
        },
        [camera, gl]
    );
    return null;
};
export default CameraController