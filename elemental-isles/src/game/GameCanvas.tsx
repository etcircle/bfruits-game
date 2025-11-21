import { Canvas } from '@react-three/fiber'
import { GameScene } from './GameScene'

export function GameCanvas() {
    return (
        <div className="w-full h-screen bg-black">
            <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
                <GameScene />
            </Canvas>
        </div>
    )
}
