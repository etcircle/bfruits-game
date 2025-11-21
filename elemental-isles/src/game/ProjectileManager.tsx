import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useProjectileStore, type ProjectileData } from '../state/useProjectileStore'
import { useGameStore } from '../state/useGameStore'
import { usePlayerStore } from '../state/usePlayerStore'
import { useDamageNumberStore } from '../ui/DamageNumbers'
import { checkSphereIntersection } from '../utils/HitboxSystem'

const PROJECTILE_TIMEOUT = 3000 // ms
const PLAYER_HITBOX_RADIUS = 0.6
const ENEMY_HITBOX_RADIUS = 0.7

/**
 * ProjectileManager handles all active projectiles in the game
 * - Updates positions based on velocity each frame
 * - Checks collisions with enemies and player
 * - Removes projectiles that hit, timeout, or exceed max distance
 */
export function ProjectileManager({ playerPositionRef }: { playerPositionRef: React.MutableRefObject<THREE.Vector3> }) {
    const projectiles = useProjectileStore(state => state.projectiles)
    const removeProjectile = useProjectileStore(state => state.removeProjectile)
    const updateProjectile = useProjectileStore(state => state.updateProjectile)

    const enemies = useGameStore(state => state.enemies)
    const damageEnemy = useGameStore(state => state.damageEnemy)
    const damagePlayer = usePlayerStore(state => state.takeDamage)
    const gainXp = usePlayerStore(state => state.gainXp)
    const addDamageNumber = useDamageNumberStore(state => state.addDamageNumber)

    // Use the passed ref instead of a local one

    useFrame((_, delta) => {
        const now = Date.now()

        projectiles.forEach(projectile => {
            const newPosition = projectile.position.clone().add(
                projectile.velocity.clone().multiplyScalar(delta)
            )

            // Check for timeout
            if (now - projectile.spawnTime > PROJECTILE_TIMEOUT) {
                removeProjectile(projectile.id)
                return
            }

            // Check for max distance
            const distanceTraveled = newPosition.distanceTo(projectile.startPosition)
            if (distanceTraveled > projectile.maxDistance) {
                removeProjectile(projectile.id)
                return
            }

            // Check for ground collision (simple)
            if (newPosition.y < 0.5) {
                removeProjectile(projectile.id)
                return
            }

            // Collision detection
            let hit = false

            if (projectile.owner === 'player') {
                // Player projectile hitting enemies
                for (const enemy of enemies) {
                    if (enemy.isDead) continue

                    if (checkSphereIntersection(
                        newPosition,
                        projectile.visualSize,
                        enemy.position,
                        ENEMY_HITBOX_RADIUS
                    )) {
                        damageEnemy(enemy.id, projectile.damage)

                        // Spawn damage number
                        addDamageNumber(enemy.position, projectile.damage, 'player')

                        // XP reward if enemy dies
                        if (enemy.health - projectile.damage <= 0) {
                            gainXp(50)
                        }

                        hit = true
                        break
                    }
                }
            } else {
                // Enemy projectile hitting player
                if (checkSphereIntersection(
                    newPosition,
                    projectile.visualSize,
                    playerPositionRef.current,
                    PLAYER_HITBOX_RADIUS
                )) {
                    damagePlayer(projectile.damage)

                    // Spawn damage number
                    addDamageNumber(playerPositionRef.current, projectile.damage, 'enemy')

                    hit = true
                }
            }

            if (hit) {
                removeProjectile(projectile.id)
                return
            }

            // Update position
            updateProjectile(projectile.id, newPosition)
        })
    })

    return (
        <group>
            {projectiles.map(projectile => (
                <Projectile key={projectile.id} data={projectile} />
            ))}
        </group>
    )
}

/**
 * Individual projectile visual component
 */
function Projectile({ data }: { data: ProjectileData }) {
    const meshRef = useRef<THREE.Mesh>(null)

    // Visual variations based on type
    const getProjectileVisual = () => {
        switch (data.type) {
            case 'flame':
                return (
                    <mesh ref={meshRef} position={data.position}>
                        <sphereGeometry args={[data.visualSize, 16, 16]} />
                        <meshStandardMaterial
                            color={data.color}
                            emissive={data.color}
                            emissiveIntensity={2}
                        />
                    </mesh>
                )
            case 'thunder':
                return (
                    <mesh ref={meshRef} position={data.position}>
                        <sphereGeometry args={[data.visualSize, 12, 12]} />
                        <meshStandardMaterial
                            color={data.color}
                            emissive={data.color}
                            emissiveIntensity={3}
                        />
                        {/* Lightning bolt effect */}
                        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
                            <boxGeometry args={[0.1, data.visualSize * 3, 0.1]} />
                            <meshStandardMaterial
                                color="#ffff00"
                                emissive="#ffff00"
                                emissiveIntensity={2}
                            />
                        </mesh>
                    </mesh>
                )
            case 'enemy_shot':
                return (
                    <mesh ref={meshRef} position={data.position}>
                        <sphereGeometry args={[data.visualSize, 8, 8]} />
                        <meshStandardMaterial
                            color={data.color}
                            emissive={data.color}
                            emissiveIntensity={1.5}
                        />
                    </mesh>
                )
            default:
                return null
        }
    }

    return <>{getProjectileVisual()}</>
}
