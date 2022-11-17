import * as THREE from 'three'
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {ThreeElements, ThreeEvent, useFrame} from '@react-three/fiber'
import {Color} from "three/src/math/Color";
import {Vector3} from "three";
import {DataConfiguration, DataPoint, DataSet} from "./DataManagement";
import {ShaderMaterial} from "three/src/materials/ShaderMaterial";
import {usePrevious} from "./Utils";

const vertexShader = `
    attribute float size;
    
    varying vec3 toFragmentPosition;
    
    attribute vec3 customColor;
    varying vec3 toFragmentColor;
    attribute float customHovered;
    varying float toFragmentHovered;
    attribute float customSelected;
    varying float toFragmentSelected;
    
    void main() {
      toFragmentPosition = position;
      toFragmentColor = customColor;
      toFragmentHovered = customHovered;
      toFragmentSelected = customSelected;
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      gl_PointSize = size * ( 300.0 / -mvPosition.z );
      gl_Position = projectionMatrix * mvPosition;
    }`
const fragmentShader = `
    uniform float time;
    
    varying vec3 toFragmentPosition;

    varying vec3 toFragmentColor;
    varying float toFragmentHovered;
    varying float toFragmentSelected;
    
    const float BORDER_HIGH = 1.0;
    const float BORDER_LOW = 0.8;
    
    const float TIME_REPEAT = 5.0;
    const float ANIM_TIME_CONVERSION = 50.0;
    
    void main() {       
    
        float dist = pow(dot((gl_PointCoord * 2.0 - 1.0), (gl_PointCoord * 2.0 - 1.0)), 0.5);
        if (dist > BORDER_HIGH)
            discard;
            
        float dim = pow(1.0 - dist, 0.05);
        gl_FragColor = vec4(toFragmentColor, 1.0) * dim;
        
        if ((toFragmentHovered == 1.0) && dist > BORDER_LOW) {
            float mean = (BORDER_HIGH + BORDER_LOW) / 2.0;
            float distanceToMean = 0.05 / abs(dist - mean);
            gl_FragColor = vec4(distanceToMean);
        } else if (toFragmentSelected == 1.0 && dist > BORDER_LOW) {
            float mean = (BORDER_HIGH + BORDER_LOW) / 2.0;
            float distanceToMean = 0.05 / abs(dist - mean);
            float remainder = mod(((gl_PointCoord.x + gl_PointCoord.y) * 10.0), 1.0);
            if (remainder > 0.5) {
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            } else {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            }
        }
    
        // float distFromCenter = pow(dot(toFragmentPosition, toFragmentPosition), 0.5);
        // float timeRepeat = mod(-time + distFromCenter / ANIM_TIME_CONVERSION, TIME_REPEAT) * 2.0;
        // float timeAnim = exp(-pow(timeRepeat, 2.0));
        // if (timeAnim > 0.995) {
        //     gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        // }
        
    }`

// TODO essayer de changer les array dynamiquement au loading, sinon on peut faire max 50k points
const MAX_POINTS = 50000;
const positionsArray = new Float32Array(MAX_POINTS * 3);
const colorsArray = new Float32Array(MAX_POINTS * 3);
const sizesArray = new Float32Array(MAX_POINTS);
const hoveredArray = new Float32Array(MAX_POINTS);
const selectedArray = new Float32Array(MAX_POINTS);
const positionsAtt = new THREE.BufferAttribute(positionsArray, 3);
const colorsAtt = new THREE.BufferAttribute(colorsArray, 3);
const sizesAtt = new THREE.BufferAttribute(sizesArray, 1);
const hoveredAtt = new THREE.BufferAttribute(hoveredArray, 1);
const selectedAtt = new THREE.BufferAttribute(selectedArray, 1);

const PARTICLE_SIZE = 0.6 * (window.devicePixelRatio**2);
let drawCount = 0;

let singletonHadLoaded:boolean = false; // no dataset change for now, TODO better functional style

const DataPoints = (props: {
            pointsProps?: ThreeElements['points'],
            setCenter:(newCenter:Vector3) => void,
            selected:number|null,
            setSelected:(index:number|null) => void,
            configuration:DataConfiguration|null,
            points:DataSet<DataPoint>|null,
        }) => {

    const registerPoints = (configuration:DataConfiguration, points:Array<DataPoint>) => {
        points.forEach(dataPoint => {
            const point = new THREE.Vector3(dataPoint.x, dataPoint.y, dataPoint.z);
            const color = new THREE.Color();
            const scaledPrediction = Math.max(0, Math.min(1,(dataPoint.__prediction - configuration.mean) / 2 / configuration.std));
            color.setRGB(scaledPrediction, 0.2, 1 - scaledPrediction);
            addParticle(point, color, PARTICLE_SIZE * 0.5);
        })
    }

    const addParticle = (vertex:Vector3, color:Color, size:number) => {
        const geometry = ref.current.geometry;
        const attributes = geometry.attributes;
        const positions = attributes.position.array;
        const colors = attributes.customColor.array;
        const sizes = attributes.size.array as Array<number>;
        vertex.toArray(positions, drawCount * 3);
        color.toArray(colors, drawCount * 3);
        sizes[drawCount] = size;
        hoveredArray[drawCount] = 0;
        drawCount++;
        geometry.setDrawRange(0, drawCount);
    }

    useEffect(() => {
        if (props.configuration && props.points && !singletonHadLoaded) {
            registerPoints(props.configuration, props.points.data);
            updateAttributes();
            updateBoundingSphere();
            singletonHadLoaded = true;
        }
    },[props.configuration, props.points]);

    const updateAttributes = () => {
        const geometry = ref.current.geometry;
        const attributes = geometry.attributes;
        attributes.position.needsUpdate = true;
        attributes.size.needsUpdate = true;
        attributes.customColor.needsUpdate = true;
        attributes.customHovered.needsUpdate = true;
        attributes.customSelected.needsUpdate = true;
    }
    const updateBoundingSphere = () => {
        ref.current.geometry.computeBoundingSphere();
    }

    const uniforms = useMemo(() => {
        return {
            time: {type: 'f', value: 0.0},
        }
    }, []);


    useFrame((state) => {
        const material = ref.current.material as ShaderMaterial;
        material.uniforms["time"].value = state.clock.elapsedTime;
        material.uniformsNeedUpdate = true;
    })

    const ref = useRef<THREE.Points>(null!);
    const [hovered, hover] = useState(false);
    const [clicked, click] = useState(false);

    useEffect(() => {
        document.body.style.cursor = hovered ? 'pointer' : 'auto'
    }, [hovered]);


    const previousSelected = usePrevious(props.selected);
    useEffect(() => {
        updateSelected(props.selected);
    }, [props.selected]);

    const updateSelected = (index:number|null) => {
        if (previousSelected) {
            sizesArray[previousSelected] = PARTICLE_SIZE;
            selectedArray[previousSelected] = 0.0;
        }
        if (index) {
            console.log(index);
            sizesArray[index] = PARTICLE_SIZE * 2;
            selectedArray[index] = 1.0;
            props.setCenter(new Vector3(
                positionsArray[3*index    ],
                positionsArray[3*index + 1],
                positionsArray[3*index + 2]
            ));
        }
        updateAttributes();
    }

    const onClick = (event:ThreeEvent<MouseEvent>) => {
        click(!clicked);
        const closest = event.intersections.reduce((acc, val) =>
            !acc.distanceToRay ? val :
            !val.distanceToRay ? val :
            acc.distanceToRay < val.distanceToRay? acc : val
        )
        if (closest.index != null) {
            updateSelected(closest.index);
            props.setSelected(closest.index);
        }
        event.stopPropagation();
    }
    const onPointerOver = (event:ThreeEvent<PointerEvent>) => {
        hover(true);
        if (event.index != null) {
            hoveredArray[event.index] = 1;
            updateAttributes();
        }
    }
    const onPointerOut = (event:ThreeEvent<PointerEvent>) => {
        hover(false);
        if (event.index != null) {
            hoveredArray[event.index] = 0;
            updateAttributes();
        }
    }

    return (
        <points
            {...props.pointsProps}
            ref={ref}
            onClick={onClick}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
        >
            <bufferGeometry attributes={{
                position:positionsAtt,
                size:sizesAtt,
                customColor:colorsAtt,
                customHovered:hoveredAtt,
                customSelected:selectedAtt
            }}/>
            <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader}/>
        </points>
    )
}

export default DataPoints;