import { Physics } from '@react-three/rapier'
import { Environment, Sky, Stars } from '@react-three/drei'
import { World } from './World'
import { Player } from './Player'
import { Enemy } from './Enemy'
import { City } from './City'
import { useGameStore } from '../state/useGameStore'
import { AbilityEffects } from './AbilityEffects'
import { ProjectileManager } from './ProjectileManager'
import { DamageNumbers } from '../ui/DamageNumbers'
import { ThirdPersonCamera } from './ThirdPersonCamera'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export function GameScene() {
    const enemies = useGameStore(state => state.enemies)
    const initializeEnemies = useGameStore(state => state.initializeEnemies)
    const playerPositionRef = useRef(new THREE.Vector3(0, 1, 0))

    // Initialize enemies once when the scene mounts
    useEffect(() => {
        initializeEnemies()
    }, [initializeEnemies])

    return (
        <>
            <ThirdPersonCamera target={playerPositionRef.current} />
            <Environment preset="sunset" />
            <Sky sunPosition={[100, 20, 100]} />
            <Stars />
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />

            <Physics>
                <World />
                <City />
                <Player positionRef={playerPositionRef} />
                {enemies.map(enemy => (
                    <Enemy key={enemy.id} data={enemy} playerPosition={playerPositionRef.current} />
                ))}
                <AbilityEffects />
                <ProjectileManager playerPositionRef={playerPositionRef} />
                <DamageNumbers />
            </Physics>
        </>
    )
}
