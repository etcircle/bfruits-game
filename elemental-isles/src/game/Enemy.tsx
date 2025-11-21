import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { EnemyState } from '../state/useGameStore'
import { useProjectileStore } from '../state/useProjectileStore'
import { usePlayerStore } from '../state/usePlayerStore'
import { predictPosition } from '../utils/HitboxSystem'

interface EnemyProps {
    data: EnemyState
    playerPosition: THREE.Vector3
}

// AI timing constants
const WINDUP_DURATION = 800 // ms
const ATTACK_DURATION = 300 // ms  
const RECOVER_DURATION = 500 // ms
const PATROL_RADIUS = 5

/**
 * Enemy component with full AI state machine
 * States: Idle → Chasing → Windup → Attack → Recover
 */
export function Enemy({ data, playerPosition }: EnemyProps) {
    const groupRef = useRef<THREE.Group>(null)
    const [deathScale, setDeathScale] = useState(1)
    const [opacity, setOpacity] = useState(1)
    const [visualScale, setVisualScale] = useState(1)

    const spawnProjectile = useProjectileStore(state => state.spawnProjectile)
    const damagePlayer = usePlayerStore(state => state.takeDamage)

    useFrame((state, delta) => {
        if (!groupRef.current) return

        // Death animation
        if (data.isDead) {
            setDeathScale(prev => Math.max(0, prev - delta * 2))
            setOpacity(prev => Math.max(0, prev - delta * 2))
            return
        }

        const currentPos = groupRef.current.position
        const now = Date.now()
        const timeSinceStateStart = now - data.stateStartTime

        // Distance to player
        const distanceToPlayer = currentPos.distanceTo(playerPosition)

        // State machine logic
        switch (data.aiState) {
            case 'idle':
                // Patrol in circle around spawn point
                const time = state.clock.getElapsedTime()
                const patrolX = data.spawnPosition.x + Math.sin(time) * PATROL_RADIUS
                const patrolZ = data.spawnPosition.z + Math.cos(time) * PATROL_RADIUS
                const targetPos = new THREE.Vector3(patrolX, 1, patrolZ)

                const direction = targetPos.clone().sub(currentPos).normalize()
                currentPos.add(direction.multiplyScalar(3 * delta))
                groupRef.current.lookAt(targetPos)

                // Check for aggro
                if (distanceToPlayer < data.aggroRange) {
                    data.aiState = 'chasing'
                    data.stateStartTime = now
                }
                break

            case 'chasing':
                // Move toward player
                const toPlayer = playerPosition.clone().sub(currentPos)
                toPlayer.y = 0
                const chaseDirection = toPlayer.normalize()

                // Stop at attack range
                if (distanceToPlayer > data.attackRange) {
                    currentPos.add(chaseDirection.multiplyScalar(4 * delta))
                }

                groupRef.current.lookAt(playerPosition)

                // Check if in attack range
                if (distanceToPlayer <= data.attackRange) {
                    data.aiState = 'windup'
                    data.stateStartTime = now
                }

                // Return to idle if player too far
                if (distanceToPlayer > data.aggroRange * 1.5) {
                    data.aiState = 'idle'
                    data.stateStartTime = now
                }
                break

            case 'windup':
                // Telegraph attack
                const windupProgress = timeSinceStateStart / WINDUP_DURATION
                setVisualScale(1 + Math.sin(windupProgress * Math.PI * 4) * 0.2)

                groupRef.current.lookAt(playerPosition)

                if (timeSinceStateStart >= WINDUP_DURATION) {
                    data.aiState = 'attack'
                    data.stateStartTime = now
                }
                break

            case 'attack':
                // Execute attack
                if (timeSinceStateStart < 50) { // Only attack once at start of state
                    performAttack(currentPos, playerPosition, data.type)
                }

                if (timeSinceStateStart >= ATTACK_DURATION) {
                    data.aiState = 'recover'
                    data.stateStartTime = now
                    setVisualScale(1)
                }
                break

            case 'recover':
                // Brief pause before returning to chase/idle
                if (timeSinceStateStart >= RECOVER_DURATION) {
                    if (distanceToPlayer <= data.aggroRange) {
                        data.aiState = 'chasing'
                    } else {
                        data.aiState = 'idle'
                    }
                    data.stateStartTime = now
                }
                break
        }

        // Update store with new position  
        data.position.copy(currentPos)
    })

    // Enemy attack execution
    const performAttack = (position: THREE.Vector3, target: THREE.Vector3, type: 'melee' | 'ranged') => {
        if (type === 'ranged') {
            // Predict player position
            const playerVelocity = new THREE.Vector3(0, 0, 0) // Simplified - would track actual velocity
            const predictedPos = predictPosition(target, playerVelocity, 0.3)

            // Spawn projectile toward predicted position
            const direction = predictedPos.clone().sub(position).normalize()

            spawnProjectile({
                owner: data.id,
                position: position.clone().add(new THREE.Vector3(0, 0.5, 0)),
                velocity: direction.multiplyScalar(10),
                damage: 15,
                type: 'enemy_shot',
                maxDistance: 20,
                visualSize: 0.4,
                color: '#ff0000'
            })
        } else {
            // Melee attack - damage if close
            const distance = position.distanceTo(target)
            if (distance < 3) {
                damagePlayer(20)
            }
        }
    }

    if (data.isDead && deathScale <= 0) return null

    const healthPercent = (data.health / data.maxHealth) * 100
    const isLowHealth = healthPercent < 30

    // Visual color based on state
    const getEnemyColor = () => {
        if (data.isDead) return "#333333"
        if (data.aiState === 'windup') return "#ffaa00" // Yellow during windup
        if (data.aiState === 'attack') return "#ff6600" // Orange during attack
        if (data.type === 'ranged') return "#aa2222" // Darker red for ranged
        return "#cc2222" // Normal red for melee
    }

    return (
        <group ref={groupRef} position={data.position} scale={deathScale * visualScale}>
            {/* Health Bar */}
            {!data.isDead && (
                <Html position={[0, 2.5, 0]} center>
                    <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden border border-white/20">
                        <div
                            className={`h-full transition-all duration-200 ${isLowHealth ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${healthPercent}%` }}
                        />
                    </div>
                </Html>
            )}

            {/* Body */}
            <mesh castShadow>
                <capsuleGeometry args={[0.5, 1.5, 4, 8]} />
                <meshStandardMaterial
                    color={getEnemyColor()}
                    transparent
                    opacity={opacity}
                    emissive={data.aiState === 'windup' ? "#ffaa00" : "#000000"}
                    emissiveIntensity={data.aiState === 'windup' ? 0.5 : 0}
                />
            </mesh>

            {/* Head/Eye indicator */}
            <mesh position={[0, 1.2, 0.4]} castShadow>
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshStandardMaterial
                    color={data.isDead ? "#111111" : "#ff4444"}
                    emissive={data.isDead ? "#000000" : "#ff0000"}
                    emissiveIntensity={0.3}
                    transparent
                    opacity={opacity}
                />
            </mesh>

            {/* Type indicator - ranged enemies have a small sphere above */}
            {data.type === 'ranged' && !data.isDead && (
                <mesh position={[0, 2.2, 0]}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshStandardMaterial
                        color="#ffaa00"
                        emissive="#ff8800"
                        emissiveIntensity={0.8}
                    />
                </mesh>
            )}
        </group>
    )
}
