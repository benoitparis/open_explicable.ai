import {useEffect} from "react";
import {useFrame, useThree} from "@react-three/fiber";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {Vector3} from "three";

let controls:OrbitControls|null = null;

const DAMPING_FACTOR = 0.05;
const DAMPING_FACTOR_TARGET = 0.10;
const EPSILON = 0.1;
const CAMERA_DISTANCE_INIT = 20;
const CAMERA_DISTANCE_ONCLICK = 10;
const idealCameraPosition:Vector3 = new Vector3(0,0,0);
let reachedTarget:boolean = true;

const CameraController = (props:{isBackground:boolean, center:Vector3, cameraFollows:boolean}) => {
    const {camera, gl} = useThree();

    useFrame(() => {
        if (controls) {
            if (controls.target.distanceTo(props.center) < EPSILON) {
                reachedTarget = true;
            }
            if (!reachedTarget) {
                controls.target.lerp(props.center, DAMPING_FACTOR_TARGET);
                camera.position.lerp(idealCameraPosition, DAMPING_FACTOR_TARGET);
            }
            controls.update();
        }
    });
    useEffect(() => {
        if (controls) {
            controls.enableZoom = !props.isBackground;
            controls.autoRotate = props.isBackground;
        }
    }, [props.isBackground]);
    useEffect(() => {
            controls = new OrbitControls(camera, gl.domElement);
            controls.minDistance = 1;
            controls.maxDistance = 40;
            controls.autoRotateSpeed = 0.5;
            controls.enableDamping = true;
            controls.dampingFactor = DAMPING_FACTOR;
            controls.enableZoom = !props.isBackground;
            controls.autoRotate = props.isBackground;

            camera.position.normalize().multiplyScalar(CAMERA_DISTANCE_INIT);
            idealCameraPosition.copy(camera.position);

            return () => {
                if (controls) {
                    controls.dispose();
                }
            };
        },
        // do not add props.isBackground to the dependency list:
        //   it would re-init the controls as well on props.isBackground change
        [camera, gl]
    );
    useEffect(
        () => {
            const distanceScaling = 1 - CAMERA_DISTANCE_ONCLICK/props.center.distanceTo(camera.position);
            if (props.cameraFollows) {
                idealCameraPosition.copy(
                    camera.position.clone().add(
                        props.center.clone().sub(camera.position)
                            .multiplyScalar(distanceScaling)
                    )
                )
            }
            reachedTarget = false;
        },
        [props.center, camera.position]
    );

    return null;
};

export default CameraController