import { RigidBody } from '@react-three/rapier';

export function Island() {
    return (
        <group>
            {/* Main Ground */}
            <RigidBody type="fixed" colliders="hull">
                <mesh position={[0, -2, 0]} receiveShadow>
                    <cylinderGeometry args={[30, 30, 4, 32]} />
                    <meshStandardMaterial color="#2d5a27" />
                </mesh>
            </RigidBody>

            {/* Sand/Beach Layer */}
            <RigidBody type="fixed" colliders="hull">
                <mesh position={[0, -2.5, 0]} receiveShadow>
                    <cylinderGeometry args={[35, 35, 4, 32]} />
                    <meshStandardMaterial color="#e6c288" />
                </mesh>
            </RigidBody>

            {/* Some random obstacles/rocks */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[5, 1, 5]} castShadow receiveShadow>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshStandardMaterial color="#808080" />
                </mesh>
            </RigidBody>

            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[-8, 1, -3]} castShadow receiveShadow>
                    <boxGeometry args={[3, 4, 3]} />
                    <meshStandardMaterial color="#696969" />
                </mesh>
            </RigidBody>
        </group>
    );
}
