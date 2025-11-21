import { Building } from './Building';

export function City() {
    // City layout: Central plaza with buildings arranged around it
    const buildings = [
        // North side
        { type: 'temple' as const, position: [0, 0, -18] as [number, number, number], rotation: 0 },
        { type: 'house' as const, position: [-8, 0, -15] as [number, number, number], rotation: 0.3 },
        { type: 'shop' as const, position: [8, 0, -15] as [number, number, number], rotation: -0.3 },

        // East side
        { type: 'tower' as const, position: [18, 0, -8] as [number, number, number], rotation: 0 },
        { type: 'house' as const, position: [15, 0, 0] as [number, number, number], rotation: -1.57 },
        { type: 'shop' as const, position: [18, 0, 8] as [number, number, number], rotation: -1.57 },

        // South side
        { type: 'house' as const, position: [8, 0, 18] as [number, number, number], rotation: 3.14 },
        { type: 'shop' as const, position: [0, 0, 20] as [number, number, number], rotation: 3.14 },
        { type: 'house' as const, position: [-8, 0, 18] as [number, number, number], rotation: 3.14 },

        // West side
        { type: 'tower' as const, position: [-18, 0, 8] as [number, number, number], rotation: 0 },
        { type: 'house' as const, position: [-15, 0, 0] as [number, number, number], rotation: 1.57 },
        { type: 'shop' as const, position: [-18, 0, -8] as [number, number, number], rotation: 1.57 },
    ];

    return (
        <group>
            {buildings.map((building, index) => (
                <Building
                    key={index}
                    type={building.type}
                    position={building.position}
                    rotation={building.rotation}
                />
            ))}

            {/* Central plaza decoration - fountain base */}
            <group position={[0, 0, 0]}>
                <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
                    <cylinderGeometry args={[2, 2.5, 1, 8]} />
                    <meshStandardMaterial color="#cccccc" />
                </mesh>
                {/* Fountain center */}
                <mesh castShadow position={[0, 1.5, 0]}>
                    <cylinderGeometry args={[0.5, 0.5, 2]} />
                    <meshStandardMaterial color="#aaaaaa" />
                </mesh>
                {/* Water effect */}
                <mesh position={[0, 1, 0]}>
                    <cylinderGeometry args={[1.8, 1.8, 0.2]} />
                    <meshStandardMaterial
                        color="#4db8ff"
                        emissive="#0088cc"
                        emissiveIntensity={0.3}
                        transparent
                        opacity={0.7}
                    />
                </mesh>
            </group>
        </group>
    );
}
