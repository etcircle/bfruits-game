import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Stars } from '@react-three/drei'

const GameCanvas = () => {
    return (
        <Canvas
            shadows
            camera={{ position: [0, 5, 10], fov: 50 }}
            className="w-full h-full bg-slate-900"
        >
            <Sky sunPosition={[100, 20, 100]} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />

            <mesh position={[0, -0.5, 0]} receiveShadow>
                <boxGeometry args={[100, 1, 100]} />
                <meshStandardMaterial color="#4ade80" />
            </mesh>

            <mesh position={[0, 1, 0]} castShadow>
                <boxGeometry args={[1, 2, 1]} />
                <meshStandardMaterial color="hotpink" />
            </mesh>

            <OrbitControls />
        </Canvas>
    )
}

export default GameCanvas
