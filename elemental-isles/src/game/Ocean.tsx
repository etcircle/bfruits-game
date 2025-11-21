import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Ocean() {
    const ref = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (ref.current) {
            // Simple wave animation or texture offset could go here
            // For now, just a static blue plane
        }
    });

    return (
        <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color="#006994" roughness={0.1} metalness={0.1} />
        </mesh>
    );
}
