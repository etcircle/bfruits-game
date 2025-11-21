import { OrbitControls } from '@react-three/drei';

export function CameraController() {
    return (
        <OrbitControls
            makeDefault
            minDistance={5}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2 - 0.1} // Prevent going under the ground
        />
    );
}
