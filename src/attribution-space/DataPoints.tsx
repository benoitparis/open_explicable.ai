import * as THREE from 'three'
import React, {useEffect, useRef, useState} from 'react'
import {useFrame, ThreeElements, ThreeEvent, useLoader} from '@react-three/fiber'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import {Color} from "three/src/math/Color";
import {Vector3} from "three";

// TODO essayer de changer les array dynamiquement au loading, sinon on peut faire max 50k points
const MAX_POINTS = 10000;
const positionsArray = new Float32Array(MAX_POINTS * 3);
const colorsArray = new Float32Array(MAX_POINTS * 3);
const sizesArray = new Float32Array(MAX_POINTS);
const hoveredArray = new Float32Array(MAX_POINTS);
const positionsAtt = new THREE.BufferAttribute(positionsArray, 3);
const colorsAtt = new THREE.BufferAttribute(colorsArray, 3);
const sizesAtt = new THREE.BufferAttribute(sizesArray, 1);
const hoveredAtt = new THREE.BufferAttribute(hoveredArray, 1);

const vertexShader = `
    attribute float size;
    
    attribute vec3 customColor;
    varying vec3 toFragmentColor;
    attribute float customHovered;
    varying float toFragmentHovered;
    
    void main() {
      toFragmentColor = customColor;
      toFragmentHovered = customHovered;
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      gl_PointSize = size * ( 300.0 / -mvPosition.z );
      gl_Position = projectionMatrix * mvPosition;
    }`
const fragmentShader = `
    uniform vec3 baseColor;
    uniform sampler2D pointTexture;
    
    varying vec3 toFragmentColor;
    varying float toFragmentHovered;
    
    const float BORDER_UP = 0.5;
    const float BORDER_LOW = 0.1;
    
    void main() {
    
        float dist = dot((gl_PointCoord - 0.5), (gl_PointCoord - 0.5));
        
        gl_FragColor = vec4(baseColor * toFragmentColor, 1.0) * (1.0 - 2.0 * dist);
        // gl_FragColor = vec4(baseColor * toFragmentColor, 1.0) * texture2D(pointTexture, gl_PointCoord);
        if (gl_FragColor.a < BORDER_LOW) 
            discard;
        if (toFragmentHovered == 1.0 && gl_FragColor.a < BORDER_UP) {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    }`

const PARTICLE_SIZE = 1.5;
let drawCount = 0;
var originalColors = new Float32Array( MAX_POINTS * 3 );

function DataPoints(props: ThreeElements['points']) {



    const loadParticles = (configuration:any) => {
        console.log("loadParticles")

        var loader = new THREE.FileLoader();

        loader.load(
            'data/' + configuration['data-prediction-embedding-cluster'],
            function ( data ) {



                console.log("loader.load")
                // faudrait faire par naming des colonnes csv, limit avec un schema,
                //   [convention d'avoir les predicted_variables en premier avant les features?
                //   un sqlite?
                var lines = (data as string).trim().split('\n');

                let condensedTree = [];

                for (var i = 1; i < lines.length; i++) {

                    var parts = lines[i].split(',');
                    var j = 0;
                    var index = parseInt(parts[j++], 10);
                    var prediction = -1;
                    configuration['predicted_variables'].forEach((item:any) => {
                        // save data..
                        j++;
                    });
                    configuration['features'].forEach((item:any) => {
                        // save data..
                        j++;
                    })
                    configuration['predicted_variables'].forEach((item:any) => {
                        // convention: appended _prediction to name (TODO enforce? dans le schema?)
                        // on suppose qu'il n'y en a qu'une
                        prediction = parseFloat(parts[j++]);
                    });

                    const parent = parseInt(parts[j++], 10);
                    var lambda_val = parseFloat(parts[j++]);
                    var size = parseInt(parts[j++], 10);
                    var x = parseFloat(parts[j++]);
                    var y = parseFloat(parts[j++]);
                    var z = parseFloat(parts[j++]);

                    // faudrait valider que index affine sur i
                    if (index !== i - 1) {
                        console.log("" + index + " vs " + (i-1) );
                        throw "Data file must be sorted by index";
                    }

                    condensedTree[index] = {
                        "identity" : index,
                        "size" : size,
                        "lambda_val": lambda_val,
                        "parent" : parent,
                        "children" : [],
                        "x" : x,
                        "y" : y,
                        "z" : z
                    };

                    var point = new THREE.Vector3(x, y, z);
                    var color = new THREE.Color();
                    var particleSize = 0;

                    var scaledPrediction = Math.max(0, Math.min(1,(prediction - configuration['mean']) / 2 / configuration['std']));

                    if (1 === size) {
                        color.setRGB(scaledPrediction, 0.2, 1 - scaledPrediction);
                        particleSize = PARTICLE_SIZE * 0.5;
                    } else {
                        color.setRGB(0.3, 0.3, 0.3);
                        particleSize = Math.log(size * 10 + 1) * PARTICLE_SIZE / 8;
                        if (4 >= size) {
                            particleSize = 0;
                        }
                    }

                    addParticle(point, color, particleSize);
                }



                // link parents to children
                // for (var k in condensedTree) {
                //     var item = condensedTree[k];
                //     var parent = condensedTree[item["parent"]];
                //     if (parent) {
                //         parent["children"].push(item["identity"]);
                //     } else {
                //
                //     }
                // };

                updateAttributes();
                updateBoundingSphere();

            },
            function(xhr) {},
            function(error) {
                console.log('An error happened');
            }
        );
    }


    useEffect(() => {

        const loader = new THREE.FileLoader();

        loader.load(
            'data/conf.json',
            (data) => {
                const configuration = JSON.parse(data as string);
                console.log(configuration);

                loadParticles(configuration);
                // loadRuleParticipations
                // loadRuleDefinitions
            },
            function(xhr) {},
            function(error) {
                console.log('An error happened loading the configuration: ');
                console.log(error);
            }
        );

    },[])

    // const conf = useLoader(FileLoader, "data/conf.json", () => {});

    const baseColor = new THREE.Color( 0xffffff );
    const pointTexture = useLoader(TextureLoader, 'sprites/disc.png');
    const materialUniforms = {
        baseColor: { value: baseColor },
        pointTexture: { value: pointTexture }
    }

    const ref = useRef<THREE.Points>(null!);
    const [hovered, hover] = useState(false);
    const [clicked, click] = useState(false);
    useFrame((state, delta) => {
        if (!hovered) {
            ref.current.rotation.y += 0.001;
        }
    });

    const addParticle = (vertex:Vector3, color:Color, size:number) => {
        var geometry = ref.current.geometry;
        var attributes = geometry.attributes;
        var positions = attributes.position.array;
        var colors = attributes.customColor.array;
        var sizes = attributes.size.array;
        vertex.toArray( positions, drawCount * 3 );
        color.toArray( colors, drawCount * 3 );
        color.toArray( originalColors, drawCount * 3 );
        // @ts-ignore
        sizes[drawCount] = size;
        hoveredArray[drawCount] = 0;
        drawCount++;
        geometry.setDrawRange( 0, drawCount );

    }

    const updateAttributes = () => {
        const geometry = ref.current.geometry;
        const attributes = geometry.attributes;
        attributes.position.needsUpdate = true;
        attributes.size.needsUpdate = true;
        attributes.customColor.needsUpdate = true;
        attributes.customHovered.needsUpdate = true;
    }
    const updateBoundingSphere = () => {
        ref.current.geometry.computeBoundingSphere();
    }

    const onClick = (event:ThreeEvent<MouseEvent>) => {
        click(!clicked);
        const closest = event.intersections.reduce((acc, val) =>
            !acc.distanceToRay ? val :
            !val.distanceToRay ? val :
            acc.distanceToRay < val.distanceToRay? acc : val
        )
        if (closest.index != null) {
            sizesArray[closest.index] = 10;
        }
        updateAttributes();
        event.stopPropagation();
    }
    const onPointerOver = (event:ThreeEvent<PointerEvent>) => {
        hover(true);
        if (event.index != null) {
            hoveredArray[event.index] = 1;
            // sizesArray[event.index] = sizesArray[event.index] * 2;
            updateAttributes();
        }
    }
    const onPointerOut = (event:ThreeEvent<PointerEvent>) => {
        hover(false);
        if (event.index != null) {
            hoveredArray[event.index] = 0;
            // sizesArray[event.index] = sizesArray[event.index] / 2;
            updateAttributes();
        }
    }

    return (
        <points
            {...props}
            ref={ref}
            // scale={clicked ? 1.2 : 1}
            onClick={onClick}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}>
            <bufferGeometry attributes={{position:positionsAtt, size:sizesAtt, customColor:colorsAtt, customHovered:hoveredAtt}}/>
            <shaderMaterial uniforms={materialUniforms} vertexShader={vertexShader} fragmentShader={fragmentShader}/>
        </points>
    )
}

export default DataPoints;