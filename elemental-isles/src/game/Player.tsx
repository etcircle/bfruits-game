import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useCombatStore, checkHit } from './CombatSystem'
import { useGameStore } from '../state/useGameStore'
import { usePlayerStore } from '../state/usePlayerStore'
import { useAbilityStore } from './AbilitiesSystem'
import { useProjectileStore } from '../state/useProjectileStore'
import { checkArcHitbox } from '../utils/HitboxSystem'
import { CharacterModel } from './CharacterModel'
import { CHARACTER_STYLES } from './characterStyles'

interface PlayerProps {
    positionRef?: React.MutableRefObject<THREE.Vector3>
}

export function Player({ positionRef }: PlayerProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false, space: false, shift: false, q: false, e: false, ctrl: false })
    const { camera } = useThree()

    const {
        characterStyleId,
        gainXp,
        isDashing,
        dashCooldown,
        airDashCooldown,
        slideCooldown,
        setDashing,
        updateDashCooldown,
        updateAirDashCooldown,
        updateSlideCooldown,
        consumeEnergy,
        regenerateEnergy
    } = usePlayerStore()

    const characterStyle = CHARACTER_STYLES.find(s => s.id === characterStyleId) || CHARACTER_STYLES[0]

    // Physics state
    const velocity = useRef(new THREE.Vector3())
    const jumpCount = useRef(0) // 0 = on ground, 1 = first jump, 2 = double jump used

    // Dash state
    const dashVelocity = useRef(new THREE.Vector3())
    const dashTimeRemaining = useRef(0)
    const DASH_DISTANCE = 8
    const DASH_DURATION = 0.15 // 150ms for quick dash
    const DASH_COOLDOWN = 1.5 // 1.5 seconds
    const DASH_ENERGY_COST = 20

    // Jump parameters
    const FIRST_JUMP_FORCE = 10
    const SECOND_JUMP_FORCE = 8

    // State for double jump visual effect
    const [showDoubleJumpEffect, setShowDoubleJumpEffect] = useState(false)

    // Air dash state
    const airDashVelocity = useRef(new THREE.Vector3())
    const airDashTimeRemaining = useRef(0)
    const airDashAvailable = useRef(true)
    const [isAirDashing, setIsAirDashing] = useState(false)
    const AIR_DASH_DISTANCE = 6
    const AIR_DASH_DURATION = 0.2 // 200ms
    const AIR_DASH_COOLDOWN = 2.0 // 2 seconds
    const AIR_DASH_ENERGY_COST = 25

    // Track previous key state to detect key presses (not just held)
    const prevKeys = useRef({ space: false, q: false, e: false, ctrl: false })

    // Sliding state
    const [isSliding, setIsSliding] = useState(false)
    const slideTimeRemaining = useRef(0)
    const slideDirection = useRef(new THREE.Vector3())
    const SLIDE_SPEED = 15
    const SLIDE_DURATION = 1.5 // 1.5 seconds
    const SLIDE_COOLDOWN = 1.0 // 1 second
    const SLIDE_ENERGY_COST = 15

    // Gliding state
    const [isGliding, setIsGliding] = useState(false)
    const GLIDE_FALL_SPEED = 3 // Slow fall speed
    const GLIDE_HORIZONTAL_SPEED = 8
    const GLIDE_ENERGY_DRAIN = 5 // Energy per second

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase()
            if (key === 'w') setKeys(k => ({ ...k, w: true }))
            if (key === 'a') setKeys(k => ({ ...k, a: true }))
            if (key === 's') setKeys(k => ({ ...k, s: true }))
            if (key === 'd') setKeys(k => ({ ...k, d: true }))
            if (key === ' ') setKeys(k => ({ ...k, space: true }))
            if (key === 'q') setKeys(k => ({ ...k, q: true }))
            if (key === 'e') setKeys(k => ({ ...k, e: true }))
            if (key === 'control') setKeys(k => ({ ...k, ctrl: true }))
            if (e.shiftKey) setKeys(k => ({ ...k, shift: true }))
        }
        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase()
            if (key === 'w') setKeys(k => ({ ...k, w: false }))
            if (key === 'a') setKeys(k => ({ ...k, a: false }))
            if (key === 's') setKeys(k => ({ ...k, s: false }))
            if (key === 'd') setKeys(k => ({ ...k, d: false }))
            if (key === ' ') setKeys(k => ({ ...k, space: false }))
            if (key === 'q') setKeys(k => ({ ...k, q: false }))
            if (key === 'e') setKeys(k => ({ ...k, e: false }))
            if (key === 'control') setKeys(k => ({ ...k, ctrl: false }))
            if (!e.shiftKey) setKeys(k => ({ ...k, shift: false }))
        }
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    useFrame((_state, delta) => {
        if (!meshRef.current) return

        // Update dash cooldown
        if (dashCooldown > 0) {
            updateDashCooldown(dashCooldown - delta)
        }

        // Regenerate energy over time
        regenerateEnergy(delta * 10) // 10 energy per second

        // Handle dash activation
        const qJustPressed = keys.q && !prevKeys.current.q
        if (qJustPressed && !isDashing && dashCooldown <= 0 && dashTimeRemaining.current <= 0) {
            if (consumeEnergy(DASH_ENERGY_COST)) {
                // Calculate dash direction
                const dashDir = new THREE.Vector3()

                // If moving, dash in movement direction
                if (keys.w || keys.s || keys.a || keys.d) {
                    if (keys.w) dashDir.z -= 1
                    if (keys.s) dashDir.z += 1
                    if (keys.a) dashDir.x -= 1
                    if (keys.d) dashDir.x += 1
                    dashDir.normalize()

                    // Apply camera-relative direction
                    const cameraDirection = new THREE.Vector3()
                    camera.getWorldDirection(cameraDirection)
                    cameraDirection.y = 0
                    cameraDirection.normalize()

                    const cameraRight = new THREE.Vector3()
                    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0))

                    const finalDashDir = new THREE.Vector3()
                    finalDashDir.addScaledVector(cameraRight, dashDir.x)
                    finalDashDir.addScaledVector(cameraDirection, -dashDir.z)
                    finalDashDir.normalize()

                    dashVelocity.current.copy(finalDashDir).multiplyScalar(DASH_DISTANCE / DASH_DURATION)
                } else {
                    // If standing still, dash forward (camera direction)
                    const cameraDirection = new THREE.Vector3()
                    camera.getWorldDirection(cameraDirection)
                    cameraDirection.y = 0
                    cameraDirection.normalize()
                    dashVelocity.current.copy(cameraDirection).multiplyScalar(DASH_DISTANCE / DASH_DURATION)
                }

                dashTimeRemaining.current = DASH_DURATION
                setDashing(true)
                updateDashCooldown(DASH_COOLDOWN)
            }
        }

        // Update previous q key state
        prevKeys.current.q = keys.q

        // Apply dash movement
        if (dashTimeRemaining.current > 0) {
            const dashDelta = Math.min(delta, dashTimeRemaining.current)
            const dashMove = dashVelocity.current.clone().multiplyScalar(dashDelta)
            meshRef.current.position.add(dashMove)

            // Rotate player to face dash direction
            if (dashVelocity.current.length() > 0) {
                const targetRotation = Math.atan2(dashVelocity.current.x, dashVelocity.current.z)
                meshRef.current.rotation.y = targetRotation
            }

            dashTimeRemaining.current -= delta

            if (dashTimeRemaining.current <= 0) {
                setDashing(false)
                dashVelocity.current.set(0, 0, 0)
            }
        }

        // Update air dash cooldown
        if (airDashCooldown > 0) {
            updateAirDashCooldown(airDashCooldown - delta)
        }

        // Handle air dash activation
        const eJustPressed = keys.e && !prevKeys.current.e
        if (eJustPressed && jumpCount.current > 0 && airDashAvailable.current && airDashCooldown <= 0 && airDashTimeRemaining.current <= 0) {
            if (consumeEnergy(AIR_DASH_ENERGY_COST)) {
                // Calculate air dash direction
                const airDashDir = new THREE.Vector3()

                // If moving, dash in movement direction
                if (keys.w || keys.s || keys.a || keys.d) {
                    if (keys.w) airDashDir.z -= 1
                    if (keys.s) airDashDir.z += 1
                    if (keys.a) airDashDir.x -= 1
                    if (keys.d) airDashDir.x += 1
                    airDashDir.normalize()

                    // Apply camera-relative direction
                    const cameraDirection = new THREE.Vector3()
                    camera.getWorldDirection(cameraDirection)
                    cameraDirection.y = 0
                    cameraDirection.normalize()

                    const cameraRight = new THREE.Vector3()
                    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0))

                    const finalAirDashDir = new THREE.Vector3()
                    finalAirDashDir.addScaledVector(cameraRight, airDashDir.x)
                    finalAirDashDir.addScaledVector(cameraDirection, -airDashDir.z)
                    finalAirDashDir.normalize()

                    airDashVelocity.current.copy(finalAirDashDir).multiplyScalar(AIR_DASH_DISTANCE / AIR_DASH_DURATION)
                } else {
                    // If standing still, dash forward (camera direction)
                    const cameraDirection = new THREE.Vector3()
                    camera.getWorldDirection(cameraDirection)
                    cameraDirection.y = 0
                    cameraDirection.normalize()
                    airDashVelocity.current.copy(cameraDirection).multiplyScalar(AIR_DASH_DISTANCE / AIR_DASH_DURATION)
                }

                airDashTimeRemaining.current = AIR_DASH_DURATION
                airDashAvailable.current = false // Can only air dash once per jump
                setIsAirDashing(true)
                setIsGliding(false) // Stop gliding if air dashing
                updateAirDashCooldown(AIR_DASH_COOLDOWN)
            }
        }

        // Update previous e key state
        prevKeys.current.e = keys.e

        // Apply air dash movement
        if (airDashTimeRemaining.current > 0) {
            const airDashDelta = Math.min(delta, airDashTimeRemaining.current)
            const airDashMove = airDashVelocity.current.clone().multiplyScalar(airDashDelta)
            meshRef.current.position.add(airDashMove)

            // Rotate player to face air dash direction
            if (airDashVelocity.current.length() > 0) {
                const targetRotation = Math.atan2(airDashVelocity.current.x, airDashVelocity.current.z)
                meshRef.current.rotation.y = targetRotation
            }

            airDashTimeRemaining.current -= delta

            if (airDashTimeRemaining.current <= 0) {
                setIsAirDashing(false)
                airDashVelocity.current.set(0, 0, 0)
            }
        }

        // Update slide cooldown
        if (slideCooldown > 0) {
            updateSlideCooldown(slideCooldown - delta)
        }

        // Handle sliding activation
        const ctrlJustPressed = keys.ctrl && !prevKeys.current.ctrl
        const isMoving = keys.w || keys.s || keys.a || keys.d
        const isGrounded = meshRef.current.position.y <= 1.01 // Slightly above ground level

        if (ctrlJustPressed && isMoving && isGrounded && slideCooldown <= 0 && slideTimeRemaining.current <= 0) {
            if (consumeEnergy(SLIDE_ENERGY_COST)) {
                // Capture current movement direction
                const slideDir = new THREE.Vector3()
                if (keys.w) slideDir.z -= 1
                if (keys.s) slideDir.z += 1
                if (keys.a) slideDir.x -= 1
                if (keys.d) slideDir.x += 1
                slideDir.normalize()

                // Apply camera-relative direction
                const cameraDirection = new THREE.Vector3()
                camera.getWorldDirection(cameraDirection)
                cameraDirection.y = 0
                cameraDirection.normalize()

                const cameraRight = new THREE.Vector3()
                cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0))

                const finalSlideDir = new THREE.Vector3()
                finalSlideDir.addScaledVector(cameraRight, slideDir.x)
                finalSlideDir.addScaledVector(cameraDirection, -slideDir.z)
                finalSlideDir.normalize()

                slideDirection.current.copy(finalSlideDir)
                slideTimeRemaining.current = SLIDE_DURATION
                setIsSliding(true)
            }
        }

        // Stop sliding if ctrl is released
        if (!keys.ctrl && slideTimeRemaining.current > 0) {
            slideTimeRemaining.current = 0
            setIsSliding(false)
            updateSlideCooldown(SLIDE_COOLDOWN)
        }

        // Update previous ctrl key state
        prevKeys.current.ctrl = keys.ctrl

        // Apply slide movement
        if (slideTimeRemaining.current > 0) {
            // Decay slide speed over time (starts fast, slows down)
            const slideProgress = 1 - (slideTimeRemaining.current / SLIDE_DURATION)
            const decayFactor = 1 - (slideProgress * 0.5) // Decays to 50% speed
            const currentSlideSpeed = SLIDE_SPEED * decayFactor

            const slideMove = slideDirection.current.clone().multiplyScalar(currentSlideSpeed * delta)
            meshRef.current.position.add(slideMove)

            // Rotate player to face slide direction
            if (slideDirection.current.length() > 0) {
                const targetRotation = Math.atan2(slideDirection.current.x, slideDirection.current.z)
                meshRef.current.rotation.y = targetRotation
            }

            slideTimeRemaining.current -= delta

            if (slideTimeRemaining.current <= 0) {
                setIsSliding(false)
                updateSlideCooldown(SLIDE_COOLDOWN)
            }
        }

        const baseSpeed = 10
        const sprintMultiplier = 1.8
        const speed = keys.shift ? baseSpeed * sprintMultiplier : baseSpeed

        const direction = new THREE.Vector3()

        // Camera-relative movement
        if (keys.w) direction.z -= 1
        if (keys.s) direction.z += 1
        if (keys.a) direction.x -= 1
        if (keys.d) direction.x += 1

        // Apply horizontal movement relative to camera direction (only when not dashing and not sliding)
        if (direction.length() > 0 && !isDashing && slideTimeRemaining.current <= 0) {
            direction.normalize()

            // Get camera's forward and right directions (ignoring Y axis)
            const cameraDirection = new THREE.Vector3()
            camera.getWorldDirection(cameraDirection)
            cameraDirection.y = 0
            cameraDirection.normalize()

            const cameraRight = new THREE.Vector3()
            cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0))

            // Calculate movement direction based on camera orientation
            const moveDirection = new THREE.Vector3()
            moveDirection.addScaledVector(cameraRight, direction.x)
            moveDirection.addScaledVector(cameraDirection, -direction.z)
            moveDirection.normalize().multiplyScalar(speed * delta)

            meshRef.current.position.add(moveDirection)

            // Rotate player to face movement direction
            if (moveDirection.length() > 0) {
                const targetRotation = Math.atan2(moveDirection.x, moveDirection.z)
                meshRef.current.rotation.y = targetRotation
            }
        }

        // Jump & Gravity (with double jump)
        // Check if space key was just pressed (not held)
        const spaceJustPressed = keys.space && !prevKeys.current.space

        if (spaceJustPressed && jumpCount.current < 2) {
            // First jump
            if (jumpCount.current === 0) {
                velocity.current.y = FIRST_JUMP_FORCE
                jumpCount.current = 1
            }
            // Double jump
            else if (jumpCount.current === 1) {
                velocity.current.y = SECOND_JUMP_FORCE
                jumpCount.current = 2
                // Show double jump visual effect
                setShowDoubleJumpEffect(true)
                setTimeout(() => setShowDoubleJumpEffect(false), 300)
            }
        }

        // Update previous key state
        prevKeys.current.space = keys.space

        // Gliding Logic
        const isFalling = velocity.current.y < 0
        const canGlide = jumpCount.current > 0 && isFalling && keys.space

        if (canGlide && consumeEnergy(GLIDE_ENERGY_DRAIN * delta)) {
            if (!isGliding) setIsGliding(true)

            // Apply slow fall speed
            velocity.current.y = -GLIDE_FALL_SPEED

            // Apply horizontal gliding movement
            const glideDir = new THREE.Vector3()
            if (keys.w) glideDir.z -= 1
            if (keys.s) glideDir.z += 1
            if (keys.a) glideDir.x -= 1
            if (keys.d) glideDir.x += 1

            if (glideDir.length() > 0) {
                glideDir.normalize()

                // Apply camera-relative direction
                const cameraDirection = new THREE.Vector3()
                camera.getWorldDirection(cameraDirection)
                cameraDirection.y = 0
                cameraDirection.normalize()

                const cameraRight = new THREE.Vector3()
                cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0))

                const finalGlideDir = new THREE.Vector3()
                finalGlideDir.addScaledVector(cameraRight, glideDir.x)
                finalGlideDir.addScaledVector(cameraDirection, -glideDir.z)
                finalGlideDir.normalize()

                // Move player horizontally while gliding
                meshRef.current.position.add(finalGlideDir.multiplyScalar(GLIDE_HORIZONTAL_SPEED * delta))

                // Rotate player to face glide direction
                const targetRotation = Math.atan2(finalGlideDir.x, finalGlideDir.z)
                meshRef.current.rotation.y = targetRotation
            }
        } else {
            if (isGliding) setIsGliding(false)
            velocity.current.y -= 25 * delta // Normal Gravity
        }

        meshRef.current.position.y += velocity.current.y * delta

        // Ground collision
        if (meshRef.current.position.y < 1) {
            meshRef.current.position.y = 1
            velocity.current.y = 0
            jumpCount.current = 0 // Reset jump count when landing
            airDashAvailable.current = true // Reset air dash availability when landing
            if (isGliding) setIsGliding(false) // Reset gliding when landing
        }

        // Update position reference for camera
        if (positionRef) {
            positionRef.current.copy(meshRef.current.position)
        }
    })

    // Combat integration
    const performAttack = useCombatStore(state => state.performAttack)
    const isAttacking = useCombatStore(state => state.isAttacking)
    const enemies = useGameStore(state => state.enemies)
    const damageEnemy = useGameStore(state => state.damageEnemy)
    const executeAbility = useAbilityStore(state => state.executeAbility)
    const canUseAbility = useAbilityStore(state => state.canUseAbility)

    // Import projectile store
    const spawnProjectile = useProjectileStore.getState().spawnProjectile

    // Helper functions for abilities
    const dashPlayer = (distance: number, direction: THREE.Vector3) => {
        if (!meshRef.current) return
        const dashVector = direction.clone().multiplyScalar(distance)
        dashVector.y = 0 // Keep on ground
        meshRef.current.position.add(dashVector)
    }

    const damageEnemiesInArc = (
        origin: THREE.Vector3,
        direction: THREE.Vector3,
        arc: number,
        range: number,
        damage: number
    ) => {
        enemies.forEach(enemy => {
            if (!enemy.isDead && checkArcHitbox(origin, direction, arc, range, enemy.position)) {
                damageEnemy(enemy.id, damage)
                if (enemy.health - damage <= 0) {
                    gainXp(50)
                }
            }
        })
    }

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (!meshRef.current) return

            // Left click: Melee attack
            if (e.button === 0) {
                performAttack()

                // Hit detection
                const playerPos = meshRef.current.position
                const attackDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
                attackDir.y = 0
                attackDir.normalize()

                enemies.forEach(enemy => {
                    if (!enemy.isDead && checkHit(playerPos, attackDir, enemy.position)) {
                        damageEnemy(enemy.id, 35) // 35 damage per hit
                        if (enemy.health - 35 <= 0) {
                            gainXp(50) // 50 XP per kill
                        }
                    }
                })
            }

            // Right click: Primary fruit ability (Flame)
            if (e.button === 2) {
                e.preventDefault()
                const unlockedAbilities = usePlayerStore.getState().unlockedAbilities

                if (unlockedAbilities.includes('flame_core') && canUseAbility('flame_core')) {
                    const playerPos = meshRef.current.position
                    const cameraDir = new THREE.Vector3()
                    camera.getWorldDirection(cameraDir)
                    cameraDir.y = 0
                    cameraDir.normalize()

                    executeAbility('flame_core', {
                        playerPosition: playerPos,
                        cameraDirection: cameraDir,
                        enemies,
                        spawnProjectile,
                        camera
                    })
                }
            }
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!meshRef.current) return

            const playerPos = meshRef.current.position
            const cameraDir = new THREE.Vector3()
            camera.getWorldDirection(cameraDir)
            cameraDir.y = 0
            cameraDir.normalize()

            const unlockedAbilities = usePlayerStore.getState().unlockedAbilities

            // Ability keys 1, 2, 3
            if (e.key === '1' && unlockedAbilities.includes('flame_core') && canUseAbility('flame_core')) {
                executeAbility('flame_core', {
                    playerPosition: playerPos,
                    cameraDirection: cameraDir,
                    enemies,
                    spawnProjectile,
                    camera
                })
            }
            if (e.key === '2' && unlockedAbilities.includes('shadow_orb') && canUseAbility('shadow_orb')) {
                executeAbility('shadow_orb', {
                    playerPosition: playerPos,
                    cameraDirection: cameraDir,
                    enemies,
                    spawnProjectile,
                    camera,
                    dashPlayer,
                    damageEnemiesInArc
                })
            }
            if (e.key === '3' && unlockedAbilities.includes('thunder_seed') && canUseAbility('thunder_seed')) {
                executeAbility('thunder_seed', {
                    playerPosition: playerPos,
                    cameraDirection: cameraDir,
                    enemies,
                    spawnProjectile,
                    camera
                })
            }
        }

        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('keydown', handleKeyDown)
        // Prevent right-click context menu
        window.addEventListener('contextmenu', (e) => e.preventDefault())

        return () => {
            window.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('contextmenu', (e) => e.preventDefault())
        }
    }, [performAttack, enemies, damageEnemy, gainXp, camera, executeAbility, canUseAbility])

    const isMoving = keys.w || keys.a || keys.s || keys.d

    return (
        <group ref={meshRef as any} position={[0, 1, 0]} castShadow>
            <CharacterModel
                isAttacking={isAttacking}
                isMoving={isMoving}
                style={characterStyle}
            />

            {/* Attack indicator - sword/weapon (optional, maybe remove if CharacterModel has one, but keeping for now as visual aid) */}
            {isAttacking && (
                <mesh position={[0.5, 0.5, -0.8]} rotation={[0, 0, Math.PI / 4]}>
                    <boxGeometry args={[0.1, 1.5, 0.1]} />
                    <meshStandardMaterial color="#ffaa00" emissive="#ff8800" emissiveIntensity={0.5} />
                </mesh>
            )}

            {/* Dash visual effect */}
            {isDashing && (
                <>
                    {/* Speed lines effect */}
                    <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.8, 1.2, 16]} />
                        <meshStandardMaterial
                            color="#00ffff"
                            emissive="#00ffff"
                            emissiveIntensity={1.5}
                            transparent
                            opacity={0.6}
                        />
                    </mesh>
                    {/* Glow effect */}
                    <pointLight position={[0, 0.5, 0]} color="#00ffff" intensity={2} distance={3} />
                </>
            )}

            {/* Double jump visual effect */}
            {showDoubleJumpEffect && (
                <>
                    {/* Particle burst effect */}
                    {[...Array(8)].map((_, i) => {
                        const angle = (i / 8) * Math.PI * 2
                        const radius = 0.5
                        return (
                            <mesh
                                key={i}
                                position={[
                                    Math.cos(angle) * radius,
                                    0.3,
                                    Math.sin(angle) * radius
                                ]}
                            >
                                <sphereGeometry args={[0.1, 8, 8]} />
                                <meshStandardMaterial
                                    color="#00ddff"
                                    emissive="#00ddff"
                                    emissiveIntensity={2}
                                    transparent
                                    opacity={0.8}
                                />
                            </mesh>
                        )
                    })}
                    {/* Central glow */}
                    <pointLight position={[0, 0.3, 0]} color="#00ddff" intensity={3} distance={2} />
                </>
            )}

            {/* Air dash visual effect */}
            {isAirDashing && (
                <>
                    {/* Horizontal speed rings */}
                    <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                        <ringGeometry args={[0.6, 1.0, 16]} />
                        <meshStandardMaterial
                            color="#ff8800"
                            emissive="#ff6600"
                            emissiveIntensity={1.8}
                            transparent
                            opacity={0.7}
                        />
                    </mesh>
                    {/* Orange glow effect */}
                    <pointLight position={[0, 0.5, 0]} color="#ff8800" intensity={2.5} distance={3.5} />
                </>
            )}

            {/* Sliding visual effect */}
            {isSliding && (
                <>
                    {/* Purple particle trail */}
                    {[...Array(6)].map((_, i) => {
                        const offset = -i * 0.3 // Trail behind player
                        return (
                            <mesh
                                key={i}
                                position={[0, 0.1, offset]}
                            >
                                <sphereGeometry args={[0.08, 8, 8]} />
                                <meshStandardMaterial
                                    color="#cc00ff"
                                    emissive="#aa00dd"
                                    emissiveIntensity={2}
                                    transparent
                                    opacity={0.9 - (i * 0.15)}
                                />
                            </mesh>
                        )
                    })}
                    {/* Ground friction ring */}
                    <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.5, 0.9, 20]} />
                        <meshStandardMaterial
                            color="#cc00ff"
                            emissive="#aa00dd"
                            emissiveIntensity={1.5}
                            transparent
                            opacity={0.6}
                        />
                    </mesh>
                    {/* Purple glow effect */}
                    <pointLight position={[0, 0.3, 0]} color="#cc00ff" intensity={2} distance={2.5} />
                </>
            )}

            {/* Gliding visual effect */}
            {isGliding && (
                <>
                    {/* Left Wing */}
                    <mesh position={[-0.5, 0.5, -0.2]} rotation={[0, 0, Math.PI / 6]}>
                        <boxGeometry args={[0.8, 0.1, 0.3]} />
                        <meshStandardMaterial
                            color="#e0ffff"
                            emissive="#00ffff"
                            emissiveIntensity={1}
                            transparent
                            opacity={0.6}
                        />
                    </mesh>
                    {/* Right Wing */}
                    <mesh position={[0.5, 0.5, -0.2]} rotation={[0, 0, -Math.PI / 6]}>
                        <boxGeometry args={[0.8, 0.1, 0.3]} />
                        <meshStandardMaterial
                            color="#e0ffff"
                            emissive="#00ffff"
                            emissiveIntensity={1}
                            transparent
                            opacity={0.6}
                        />
                    </mesh>
                    {/* Gliding Glow */}
                    <pointLight position={[0, 1, 0]} color="#00ffff" intensity={1.5} distance={3} />
                </>
            )}
        </group>
    )
}
