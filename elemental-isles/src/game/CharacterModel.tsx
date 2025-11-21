import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { type CharacterStyle, DEFAULT_STYLE } from './characterStyles'

interface CharacterModelProps {
    isAttacking: boolean
    isMoving: boolean
    style?: CharacterStyle
}

export function CharacterModel({ isAttacking, isMoving, style = DEFAULT_STYLE }: CharacterModelProps) {
    const group = useRef<THREE.Group>(null)
    const leftArm = useRef<THREE.Mesh>(null)
    const rightArm = useRef<THREE.Mesh>(null)
    const leftLeg = useRef<THREE.Mesh>(null)
    const rightLeg = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (!group.current) return

        const time = state.clock.getElapsedTime()

        // Idle animation (breathing)
        group.current.position.y = Math.sin(time * 2) * 0.02

        // Running animation
        if (isMoving) {
            const speed = 15
            if (leftLeg.current) leftLeg.current.rotation.x = Math.sin(time * speed) * 0.5
            if (rightLeg.current) rightLeg.current.rotation.x = Math.sin(time * speed + Math.PI) * 0.5
            if (leftArm.current) leftArm.current.rotation.x = Math.sin(time * speed + Math.PI) * 0.5
            if (rightArm.current) rightArm.current.rotation.x = Math.sin(time * speed) * 0.5
        } else {
            // Reset limbs when not moving
            if (leftLeg.current) leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, 0, 0.1)
            if (rightLeg.current) rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, 0, 0.1)
            if (leftArm.current) leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, 0, 0.1)
            if (rightArm.current) rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, 0, 0.1)
        }

        // Attack animation override
        if (isAttacking && rightArm.current) {
            rightArm.current.rotation.x = -Math.PI / 2 + Math.sin(time * 20) * 0.5
        }
    })

    const { colors, accessory } = style

    return (
        <group ref={group} dispose={null}>
            {/* Head */}
            <mesh position={[0, 1.4, 0]} castShadow>
                <boxGeometry args={[0.4, 0.4, 0.4]} />
                <meshStandardMaterial color={colors.skin} />

                {/* Face Details */}
                <group position={[0, 0, 0.21]}>
                    {/* Eyes */}
                    <mesh position={[-0.1, 0.05, 0]}>
                        <planeGeometry args={[0.08, 0.08]} />
                        <meshStandardMaterial color="black" />
                    </mesh>
                    <mesh position={[0.1, 0.05, 0]}>
                        <planeGeometry args={[0.08, 0.08]} />
                        <meshStandardMaterial color="black" />
                    </mesh>
                    {/* Mouth */}
                    <mesh position={[0, -0.1, 0]}>
                        <planeGeometry args={[0.15, 0.05]} />
                        <meshStandardMaterial color="#552222" />
                    </mesh>
                </group>
            </mesh>

            {/* Hair */}
            <mesh position={[0, 1.62, 0]} castShadow>
                <boxGeometry args={[0.45, 0.15, 0.45]} />
                <meshStandardMaterial color={colors.hair} />
            </mesh>
            {/* Hair Sideburns/Back */}
            <mesh position={[0, 1.4, -0.15]} castShadow>
                <boxGeometry args={[0.42, 0.4, 0.15]} />
                <meshStandardMaterial color={colors.hair} />
            </mesh>

            {/* Accessories */}
            {accessory === 'straw_hat' && (
                <group position={[0, 1.65, 0]}>
                    <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.6, 0.6, 0.05, 32]} />
                        <meshStandardMaterial color="#eebb55" />
                    </mesh>
                    <mesh position={[0, 0.1, 0]}>
                        <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
                        <meshStandardMaterial color="#eebb55" />
                    </mesh>
                    <mesh position={[0, 0.05, 0]}>
                        <cylinderGeometry args={[0.31, 0.31, 0.05, 32]} />
                        <meshStandardMaterial color="#cc0000" />
                    </mesh>
                </group>
            )}

            {accessory === 'bandana' && (
                <group position={[0, 1.55, 0]}>
                    <mesh>
                        <cylinderGeometry args={[0.22, 0.22, 0.1, 32]} />
                        <meshStandardMaterial color="#333333" />
                    </mesh>
                </group>
            )}

            {accessory === 'cape' && (
                <group position={[0, 1.0, -0.2]} rotation={[0.1, 0, 0]}>
                    <mesh castShadow>
                        <boxGeometry args={[0.6, 1.2, 0.05]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                    {/* Justice Kanji placeholder */}
                    <mesh position={[0, 0.2, 0.03]}>
                        <planeGeometry args={[0.3, 0.3]} />
                        <meshStandardMaterial color="black" />
                    </mesh>
                </group>
            )}

            {/* Torso */}
            <mesh position={[0, 0.8, 0]} castShadow>
                <boxGeometry args={[0.5, 0.8, 0.3]} />
                <meshStandardMaterial color={colors.shirt} />
            </mesh>

            {/* Left Arm */}
            <group position={[-0.35, 1.1, 0]}>
                <mesh ref={leftArm} position={[0, -0.3, 0]} castShadow>
                    <boxGeometry args={[0.2, 0.7, 0.2]} />
                    <meshStandardMaterial color={colors.skin} />
                    {/* Sleeve */}
                    <mesh position={[0, 0.2, 0]}>
                        <boxGeometry args={[0.22, 0.3, 0.22]} />
                        <meshStandardMaterial color={colors.shirt} />
                    </mesh>
                </mesh>
            </group>

            {/* Right Arm */}
            <group position={[0.35, 1.1, 0]}>
                <mesh ref={rightArm} position={[0, -0.3, 0]} castShadow>
                    <boxGeometry args={[0.2, 0.7, 0.2]} />
                    <meshStandardMaterial color={colors.skin} />
                    {/* Sleeve */}
                    <mesh position={[0, 0.2, 0]}>
                        <boxGeometry args={[0.22, 0.3, 0.22]} />
                        <meshStandardMaterial color={colors.shirt} />
                    </mesh>
                </mesh>
            </group>

            {/* Left Leg */}
            <group position={[-0.15, 0.4, 0]}>
                <mesh ref={leftLeg} position={[0, -0.4, 0]} castShadow>
                    <boxGeometry args={[0.22, 0.8, 0.22]} />
                    <meshStandardMaterial color={colors.pants} />
                    {/* Shoe */}
                    <mesh position={[0, -0.35, 0.05]}>
                        <boxGeometry args={[0.24, 0.15, 0.3]} />
                        <meshStandardMaterial color={colors.shoes} />
                    </mesh>
                </mesh>
            </group>

            {/* Right Leg */}
            <group position={[0.15, 0.4, 0]}>
                <mesh ref={rightLeg} position={[0, -0.4, 0]} castShadow>
                    <boxGeometry args={[0.22, 0.8, 0.22]} />
                    <meshStandardMaterial color={colors.pants} />
                    {/* Shoe */}
                    <mesh position={[0, -0.35, 0.05]}>
                        <boxGeometry args={[0.24, 0.15, 0.3]} />
                        <meshStandardMaterial color={colors.shoes} />
                    </mesh>
                </mesh>
            </group>
        </group>
    )
}
