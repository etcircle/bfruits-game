import { RigidBody } from '@react-three/rapier';

interface BuildingProps {
    type: 'house' | 'shop' | 'tower' | 'temple'
    position: [number, number, number]
    rotation?: number
}

export function Building({ type, position, rotation = 0 }: BuildingProps) {
    // Building styles based on type
    const getBuildingConfig = () => {
        switch (type) {
            case 'house':
                return {
                    width: 3,
                    height: 4,
                    depth: 3,
                    color: '#c4a57b',
                    roofColor: '#8b4513'
                }
            case 'shop':
                return {
                    width: 4,
                    height: 3.5,
                    depth: 3,
                    color: '#b8956f',
                    roofColor: '#654321'
                }
            case 'tower':
                return {
                    width: 2,
                    height: 8,
                    depth: 2,
                    color: '#9d9d9d',
                    roofColor: '#5a5a5a'
                }
            case 'temple':
                return {
                    width: 5,
                    height: 6,
                    depth: 5,
                    color: '#d4af37',
                    roofColor: '#b8860b'
                }
        }
    }

    const config = getBuildingConfig()

    return (
        <group position={position} rotation={[0, rotation, 0]}>
            {/* Main building body */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh castShadow receiveShadow position={[0, config.height / 2, 0]}>
                    <boxGeometry args={[config.width, config.height, config.depth]} />
                    <meshStandardMaterial color={config.color} />
                </mesh>
            </RigidBody>

            {/* Roof */}
            <mesh castShadow position={[0, config.height + 0.5, 0]}>
                <coneGeometry args={[config.width * 0.8, 2, 4]} />
                <meshStandardMaterial color={config.roofColor} />
            </mesh>

            {/* Door (for houses and shops) */}
            {(type === 'house' || type === 'shop') && (
                <mesh position={[0, 1, config.depth / 2 + 0.01]}>
                    <boxGeometry args={[0.8, 1.8, 0.1]} />
                    <meshStandardMaterial color="#664422" />
                </mesh>
            )}

            {/* Windows */}
            {type !== 'tower' && (
                <>
                    <mesh position={[config.width / 3, 2.5, config.depth / 2 + 0.01]}>
                        <boxGeometry args={[0.6, 0.6, 0.05]} />
                        <meshStandardMaterial color="#87ceeb" emissive="#4682b4" emissiveIntensity={0.3} />
                    </mesh>
                    <mesh position={[-config.width / 3, 2.5, config.depth / 2 + 0.01]}>
                        <boxGeometry args={[0.6, 0.6, 0.05]} />
                        <meshStandardMaterial color="#87ceeb" emissive="#4682b4" emissiveIntensity={0.3} />
                    </mesh>
                </>
            )}

            {/* Temple pillars */}
            {type === 'temple' && (
                <>
                    {[-2, 2].map((x, i) => (
                        <mesh key={i} position={[x, 3, 2]} castShadow>
                            <cylinderGeometry args={[0.3, 0.3, 6]} />
                            <meshStandardMaterial color="#daa520" />
                        </mesh>
                    ))}
                </>
            )}

            {/* Tower windows (stacked) */}
            {type === 'tower' && (
                <>
                    {[2, 4, 6].map((y, i) => (
                        <mesh key={i} position={[0, y, config.depth / 2 + 0.01]}>
                            <boxGeometry args={[0.5, 0.5, 0.05]} />
                            <meshStandardMaterial color="#ffff99" emissive="#ffcc00" emissiveIntensity={0.4} />
                        </mesh>
                    ))}
                </>
            )}
        </group>
    );
}
