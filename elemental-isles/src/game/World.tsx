import { useMemo } from 'react'

export function World() {
    const trees = useMemo(() => {
        return new Array(20).fill(0).map(() => ({
            position: [
                (Math.random() - 0.5) * 80,
                0,
                (Math.random() - 0.5) * 80
            ] as [number, number, number],
            scale: 0.5 + Math.random() * 0.5
        }))
    }, [])

    return (
        <group>
            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#4ade80" />
            </mesh>

            {/* Trees */}
            {trees.map((tree, i) => (
                <group key={i} position={tree.position} scale={[tree.scale, tree.scale, tree.scale]}>
                    {/* Trunk */}
                    <mesh position={[0, 1, 0]} castShadow receiveShadow>
                        <cylinderGeometry args={[0.2, 0.4, 2]} />
                        <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    {/* Leaves */}
                    <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                        <coneGeometry args={[1.5, 3, 8]} />
                        <meshStandardMaterial color="#228B22" />
                    </mesh>
                </group>
            ))}
        </group>
    )
}
