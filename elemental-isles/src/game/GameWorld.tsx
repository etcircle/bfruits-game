import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Sky, Environment } from '@react-three/drei';
import { Island } from './Island';
import { Ocean } from './Ocean';
import { CameraController } from './CameraController';

export function GameWorld() {
    return (
        <div className="w-full h-screen bg-blue-200">
            <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
                {/* Lighting & Environment */}
                <Sky sunPosition={[100, 20, 100]} />
                <ambientLight intensity={0.3} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />
                <Environment preset="sunset" />

                {/* Physics World */}
                <Physics debug={false}>
                    <Island />
                    <Ocean />
                </Physics>

                {/* Camera */}
                <CameraController />
            </Canvas>
        </div>
    );
}
