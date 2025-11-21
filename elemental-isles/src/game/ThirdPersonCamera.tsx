import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'

interface ThirdPersonCameraProps {
    target: THREE.Vector3
}

export function ThirdPersonCamera({ target }: ThirdPersonCameraProps) {
    const { camera, gl } = useThree()

    // Camera rotation angles
    const rotationX = useRef(0) // Horizontal rotation (yaw)
    const rotationY = useRef(0.3) // Vertical rotation (pitch) - start slightly looking down
    const distance = useRef(10) // Distance from target

    const currentPosition = useRef(new THREE.Vector3())
    const currentLookAt = useRef(new THREE.Vector3())

    useEffect(() => {
        const canvas = gl.domElement

        const handleClick = () => {
            canvas.requestPointerLock()
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (document.pointerLockElement === canvas) {
                // Adjust rotation based on mouse movement
                const sensitivity = 0.002
                rotationX.current -= e.movementX * sensitivity
                rotationY.current += e.movementY * sensitivity // Inverted Y-axis

                // Clamp vertical rotation to prevent flipping
                rotationY.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotationY.current))
            }
        }

        const handleContextMenu = (e: Event) => {
            e.preventDefault() // Prevent right-click menu
        }

        canvas.addEventListener('click', handleClick)
        canvas.addEventListener('mousemove', handleMouseMove)
        canvas.addEventListener('contextmenu', handleContextMenu)

        return () => {
            canvas.removeEventListener('click', handleClick)
            canvas.removeEventListener('mousemove', handleMouseMove)
            canvas.removeEventListener('contextmenu', handleContextMenu)
        }
    }, [gl])

    useFrame((_, delta) => {
        // Calculate camera position based on rotation angles
        const offsetX = Math.sin(rotationX.current) * Math.cos(rotationY.current) * distance.current
        const offsetY = Math.sin(rotationY.current) * distance.current + 2 // Reduced base height offset
        const offsetZ = Math.cos(rotationX.current) * Math.cos(rotationY.current) * distance.current

        const idealPosition = target.clone().add(new THREE.Vector3(offsetX, offsetY, offsetZ))

        // Frame-rate independent smoothing
        const dampFactor = 1 - Math.exp(-10 * delta)

        currentPosition.current.lerp(idealPosition, dampFactor)
        camera.position.copy(currentPosition.current)

        // Look slightly above the target to position player lower in frame
        const lookAtTarget = target.clone().add(new THREE.Vector3(0, 1.5, 0))
        currentLookAt.current.lerp(lookAtTarget, dampFactor)
        camera.lookAt(currentLookAt.current)
    })

    return null
}
