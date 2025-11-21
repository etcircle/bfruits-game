import { create } from 'zustand'
import * as THREE from 'three'
import { type EnemyState } from '../state/useGameStore'
import { findNearestInCone } from '../utils/HitboxSystem'
import { type ProjectileData } from '../state/useProjectileStore'

/**
 * Context provided to an ability when it is executed.
 * Contains all necessary game state and helper functions for the ability to function.
 */
export interface AbilityContext {
    playerPosition: THREE.Vector3
    cameraDirection: THREE.Vector3
    enemies: EnemyState[]
    spawnProjectile: (data: Omit<ProjectileData, 'id' | 'spawnTime' | 'startPosition'>) => void
    camera: THREE.Camera
    // Optional helpers that might be provided by the Player component
    dashPlayer?: (distance: number, direction: THREE.Vector3) => void
    damageEnemiesInArc?: (origin: THREE.Vector3, direction: THREE.Vector3, arc: number, range: number, damage: number) => void
}

export type AbilityId = 'flame_core' | 'shadow_orb' | 'thunder_seed'

/**
 * Definition of a player ability.
 * Includes metadata (name, cooldown) and the execution logic.
 */
export interface Ability {
    id: AbilityId
    name: string
    cooldown: number // ms
    damage: number
    color: string
    /**
     * Main execution function for the ability.
     * @param context The runtime context providing access to game state
     */
    execute: (context: AbilityContext) => void
}

// Constants
const AUTO_AIM_CONE_ANGLE = Math.PI / 12 // 15 degrees
const AUTO_AIM_MAX_RANGE = 15
const FLAME_SPEED = 20
const FLAME_RANGE = 25
const THUNDER_SPEED = 12
const THUNDER_RANGE = 30

/**
 * Flame Core ability
 * - Fast projectile with soft auto-aim
 * - Small AoE explosion on hit
 */
const flameAbility: Ability = {
    id: 'flame_core',
    name: 'Flame Core',
    cooldown: 3000,
    damage: 50,
    color: '#ff4400',
    execute: (context) => {
        const { playerPosition, cameraDirection, enemies, spawnProjectile } = context

        // Auto-aim: find nearest enemy in cone
        const aliveEnemies = enemies.filter(e => !e.isDead)
        const targetEnemy = findNearestInCone(
            playerPosition,
            cameraDirection,
            aliveEnemies,
            AUTO_AIM_CONE_ANGLE,
            AUTO_AIM_MAX_RANGE
        )

        // Calculate direction with soft aim assist
        let direction = cameraDirection.clone()
        if (targetEnemy) {
            const toTarget = targetEnemy.position.clone().sub(playerPosition).normalize()
            // Blend 70% camera direction with 30% toward target
            direction.lerp(toTarget, 0.3).normalize()
        }

        // Spawn projectile
        spawnProjectile({
            owner: 'player',
            position: playerPosition.clone().add(new THREE.Vector3(0, 0.5, 0)),
            velocity: direction.multiplyScalar(FLAME_SPEED),
            damage: 50,
            type: 'flame',
            maxDistance: FLAME_RANGE,
            visualSize: 0.8,
            color: '#ff5500'
        })
    }
}

/**
 * Shadow Orb ability
 * - Short dash forward
 * - Arc slash that hits all enemies in front
 */
const shadowAbility: Ability = {
    id: 'shadow_orb',
    name: 'Shadow Orb',
    cooldown: 5000,
    damage: 75,
    color: '#4a0080',
    execute: (context) => {
        const { playerPosition, cameraDirection, dashPlayer, damageEnemiesInArc } = context

        // Dash player forward 5 units
        if (dashPlayer) {
            dashPlayer(5, cameraDirection)
        }

        // Damage enemies in arc after dash
        if (damageEnemiesInArc) {
            setTimeout(() => {
                damageEnemiesInArc(
                    playerPosition,
                    cameraDirection,
                    Math.PI / 2, // 90 degree arc
                    3, // 3 unit range
                    75 // damage
                )
            }, 100) // Small delay after dash
        }
    }
}

/**
 * Thunder Seed ability
 * - Slow, high-damage projectile
 * - Lightning effect at impact
 */
const thunderAbility: Ability = {
    id: 'thunder_seed',
    name: 'Thunder Seed',
    cooldown: 8000,
    damage: 100,
    color: '#ffdd00',
    execute: (context) => {
        const { playerPosition, cameraDirection, spawnProjectile } = context

        // Spawn slow, powerful projectile
        spawnProjectile({
            owner: 'player',
            position: playerPosition.clone().add(new THREE.Vector3(0, 0.5, 0)),
            velocity: cameraDirection.clone().multiplyScalar(THUNDER_SPEED),
            damage: 100,
            type: 'thunder',
            maxDistance: THUNDER_RANGE,
            visualSize: 0.6,
            color: '#ffdd00'
        })
    }
}

export const ABILITIES: Record<AbilityId, Ability> = {
    'flame_core': flameAbility,
    'shadow_orb': shadowAbility,
    'thunder_seed': thunderAbility
}

// Store for tracking cooldowns
interface AbilityState {
    cooldowns: Record<string, number> // abilityId -> timestamp when ready
    isExecuting: boolean

    canUseAbility: (abilityId: AbilityId) => boolean
    executeAbility: (abilityId: AbilityId, context: AbilityContext) => void
}

export const useAbilityStore = create<AbilityState>((set, get) => ({
    cooldowns: {},
    isExecuting: false,

    canUseAbility: (abilityId) => {
        const now = Date.now()
        const state = get()
        const ability = ABILITIES[abilityId]

        if (!ability) return false
        if (state.isExecuting) return false
        if (state.cooldowns[abilityId] && state.cooldowns[abilityId] > now) return false

        return true
    },

    executeAbility: (abilityId, context) => {
        const state = get()
        const ability = ABILITIES[abilityId]

        if (!state.canUseAbility(abilityId)) return

        // Set cooldown
        const now = Date.now()
        set({
            cooldowns: {
                ...state.cooldowns,
                [abilityId]: now + ability.cooldown
            },
            isExecuting: true
        })

        // Execute ability
        ability.execute(context)

        // Reset execution flag after brief delay
        setTimeout(() => {
            set({ isExecuting: false })
        }, 200)
    }
}))

