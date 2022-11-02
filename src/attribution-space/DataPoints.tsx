import * as THREE from 'three'
import React, {useEffect, useRef, useState} from 'react'
import {ThreeElements, ThreeEvent} from '@react-three/fiber'
import {Color} from "three/src/math/Color";
import {Vector3} from "three";
import {DataConfiguration, DataPoint, DataSet} from "./DataManagement";

const vertexShader = `
    attribute float size;
    
    attribute vec3 customColor;
    varying vec3 toFragmentColor;
    attribute float customHovered;
    varying float toFragmentHovered;
    attribute float customSelected;
    varying float toFragmentSelected;
    
    void main() {
      toFragmentColor = customColor;
      toFragmentHovered = customHovered;
      toFragmentSelected = customSelected;
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      gl_PointSize = size * ( 300.0 / -mvPosition.z );
      gl_Position = projectionMatrix * mvPosition;
    }`
const fragmentShader = `
    uniform vec3 baseColor;
    
    varying vec3 toFragmentColor;
    varying float toFragmentHovered;
    varying float toFragmentSelected;
    
    const float BORDER_UP = 1.0;
    const float BORDER_LOW = 0.8;
    
    void main() {
    
        float dist = pow(dot((gl_PointCoord * 2.0 - 1.0), (gl_PointCoord * 2.0 - 1.0)), 0.5);
        if (dist > BORDER_UP)
            discard;
            
        float dim = pow(1.0 - dist, 0.05);
        gl_FragColor = vec4(baseColor * toFragmentColor, 1.0) * dim;
        
        if (toFragmentHovered == 1.0 && dist > BORDER_LOW) {
            float mean = (BORDER_UP + BORDER_LOW) / 2.0;
            float distanceToMean = 0.05 / abs(dist - mean);
            gl_FragColor = vec4(distanceToMean);
        } else if (toFragmentSelected == 1.0 && dist > BORDER_LOW) {
            float mean = (BORDER_UP + BORDER_LOW) / 2.0;
            float distanceToMean = 0.05 / abs(dist - mean);
            float remainder = mod(((gl_PointCoord.x + gl_PointCoord.y) * 10.0), 1.0);
            if (remainder > 0.5) {
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            } else {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            }
        }
        
    }`

// TODO essayer de changer les array dynamiquement au loading, sinon on peut faire max 50k points
const MAX_POINTS = 50000;
const positionsArray = new Float32Array(MAX_POINTS * 3);
const colorsArray = new Float32Array(MAX_POINTS * 3);
const sizesArray = new Float32Array(MAX_POINTS);
const hoveredArray = new Float32Array(MAX_POINTS);
const selectedArray = new Float32Array(MAX_POINTS);
let selected:number|null = null;
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
            setSelected:(index:number|null) => void,
            configuration:DataConfiguration|null,
            points:DataSet<DataPoint>|null,
        }) => {

    const registerPoints = (configuration:any, points:Array<DataPoint>) => {
        points.forEach(dataPoint => {
            const point = new THREE.Vector3(dataPoint.x, dataPoint.y, dataPoint.z);
            const color = new THREE.Color();
            const scaledPrediction = Math.max(0, Math.min(1,(dataPoint.__prediction - configuration['mean']) / 2 / configuration['std']));
            color.setRGB(scaledPrediction, 0.2, 1 - scaledPrediction);
            addParticle(point, color, PARTICLE_SIZE * 0.5);
        })
    }

    const addParticle = (vertex:Vector3, color:Color, size:number) => {
        const geometry = ref.current.geometry;
        const attributes = geometry.attributes;
        const positions = attributes.position.array;
        const colors = attributes.customColor.array;
        const sizes = attributes.size.array;
        vertex.toArray(positions, drawCount * 3);
        color.toArray(colors, drawCount * 3);
        // @ts-ignore
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

    const baseColor = new THREE.Color( 0xffffff );
    const materialUniforms = {
        baseColor: { value: baseColor }
    }

    const ref = useRef<THREE.Points>(null!);
    const [hovered, hover] = useState(false);
    const [clicked, click] = useState(false);

    useEffect(() => {
        document.body.style.cursor = hovered ? 'pointer' : 'auto'
    }, [hovered]);

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

    const pickSelected = (index:number) => {
        console.log(drawCount);
        console.log(index);

        if (selected) {
            sizesArray[selected] = PARTICLE_SIZE;
            selectedArray[selected] = 0.0;
            props.setSelected(null);
        }
        selected = index;
        sizesArray[selected] = PARTICLE_SIZE * 2;
        selectedArray[selected] = 1.0;
        props.setCenter(new Vector3(
            positionsArray[3*selected    ],
            positionsArray[3*selected + 1],
            positionsArray[3*selected + 2]
        ));
        props.setSelected(selected);
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
            pickSelected(closest.index);
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
            <shaderMaterial uniforms={materialUniforms} vertexShader={vertexShader} fragmentShader={fragmentShader}/>
        </points>
    )
}

export default DataPoints;