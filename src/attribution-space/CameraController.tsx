import {useEffect} from "react";
import {useThree} from "@react-three/fiber";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'


const CameraController = () => {
    const {camera, gl} = useThree();
    useEffect(
        () => {
            const controls = new OrbitControls(camera, gl.domElement);
            controls.minDistance = 1;
            controls.maxDistance = 40;

            const factor = 5;
            camera.position.x *= factor;
            camera.position.y *= factor;
            camera.position.z *= factor;
            controls.update();

            return () => {
                controls.dispose();
            };
        },
        [camera, gl]
    );
    return null;
};
export default CameraController