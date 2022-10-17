import * as THREE from 'three'
import React, { useRef, useState } from 'react'
import {useFrame, ThreeElements, useLoader} from '@react-three/fiber'
import {TextureLoader} from "three/src/loaders/TextureLoader";

function Box(props: ThreeElements['mesh']) {
    const discTexture = useLoader(TextureLoader, 'sprites/disc.png');

    const ref = useRef<THREE.Mesh>(null!)
    const [hovered, hover] = useState(false)
    const [clicked, click] = useState(false)
    useFrame((state, delta) => (ref.current.rotation.x += 0.01))
    return (
        <mesh
            {...props}
            ref={ref}
            scale={clicked ? 1.5 : 1}
            onClick={(event) => {click(!clicked)}}
            onPointerOver={(event) => hover(true)}
            onPointerOut={(event) => hover(false)}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} bumpMap={discTexture}/>
        </mesh>
    )
}

export default Box;