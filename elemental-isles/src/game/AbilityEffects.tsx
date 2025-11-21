import { useState } from 'react'
import * as THREE from 'three'

/**
 * AbilityEffects now only renders non-projectile visual effects
 * Projectiles are handled by ProjectileManager
 * 
 * This component handles:
 * - Shadow dash trail effect
 * - Thunder lightning column at impact (future)
 * - AoE explosion rings (future)
 */

interface EffectData {
    id: string
    type: 'shadow_trail' | 'lightning_column' | 'explosion'
    position: THREE.Vector3
    startTime: number
}

export function AbilityEffects() {
    const [effects] = useState<EffectData[]>([])

    // For now, effects are minimal since projectiles handle their own visuals
    // Future: Add shadow trail, lightning columns, etc.

    return (
        <group>
            {effects.map(effect => (
                <EffectMesh key={effect.id} data={effect} />
            ))}
        </group>
    )
}

function EffectMesh({ data }: { data: EffectData }) {
    // Visual effects based on type
    if (data.type === 'shadow_trail') {
        return (
            <mesh position={data.position}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                    color="#4a0080"
                    transparent
                    opacity={0.5}
                    emissive="#4a0080"
                    emissiveIntensity={0.5}
                />
            </mesh>
        )
    }

    if (data.type === 'lightning_column') {
        return (
            <mesh position={data.position}>
                <cylinderGeometry args={[0.5, 0.5, 5, 8]} />
                <meshStandardMaterial
                    color="#ffdd00"
                    transparent
                    opacity={0.7}
                    emissive="#ffdd00"
                    emissiveIntensity={2}
                />
            </mesh>
        )
    }

    return null
}
