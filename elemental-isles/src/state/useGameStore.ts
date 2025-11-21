import { create } from 'zustand'
import * as THREE from 'three'

export type EnemyType = 'melee' | 'ranged'
export type EnemyAIState = 'idle' | 'chasing' | 'windup' | 'attack' | 'recover'

export interface EnemyState {
    id: string
    position: THREE.Vector3
    health: number
    maxHealth: number
    isDead: boolean
    type: EnemyType
    aiState: EnemyAIState
    stateStartTime: number
    aggroRange: number
    attackRange: number
    spawnPosition: THREE.Vector3
}

interface GameState {
    isPaused: boolean
    enemies: EnemyState[]

    togglePause: () => void
    initializeEnemies: () => void
    spawnEnemy: (position: THREE.Vector3) => void
    damageEnemy: (id: string, amount: number) => void
    removeEnemy: (id: string) => void
}

export const useGameStore = create<GameState>((set) => ({
    isPaused: false,
    enemies: [],

    togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

    initializeEnemies: () => set(() => {
        // Spawn 5 enemies at different positions around the island
        const enemyData = [
            { pos: new THREE.Vector3(10, 1, 10), type: 'ranged' as EnemyType },   // Northeast - ranged
            { pos: new THREE.Vector3(-10, 1, 10), type: 'melee' as EnemyType },   // Northwest - melee
            { pos: new THREE.Vector3(10, 1, -10), type: 'ranged' as EnemyType },  // Southeast - ranged
            { pos: new THREE.Vector3(-10, 1, -10), type: 'melee' as EnemyType },  // Southwest - melee
            { pos: new THREE.Vector3(0, 1, 15), type: 'melee' as EnemyType }      // North center - melee
        ]

        return {
            enemies: enemyData.map((data, index) => ({
                id: `enemy-${index}-${Date.now()}`,
                position: data.pos.clone(),
                health: 100,
                maxHealth: 100,
                isDead: false,
                type: data.type,
                aiState: 'idle' as EnemyAIState,
                stateStartTime: Date.now(),
                aggroRange: 15,
                attackRange: data.type === 'melee' ? 3 : 8,
                spawnPosition: data.pos.clone()
            }))
        }
    }),

    spawnEnemy: (position) => set((state) => ({
        enemies: [
            ...state.enemies,
            {
                id: Math.random().toString(36).substr(2, 9),
                position: position.clone(),
                health: 100,
                maxHealth: 100,
                isDead: false,
                type: Math.random() > 0.5 ? 'melee' : 'ranged',
                aiState: 'idle' as EnemyAIState,
                stateStartTime: Date.now(),
                aggroRange: 15,
                attackRange: 5,
                spawnPosition: position.clone()
            }
        ]
    })),

    damageEnemy: (id, amount) => set((state) => ({
        enemies: state.enemies.map(enemy =>
            enemy.id === id
                ? { ...enemy, health: Math.max(0, enemy.health - amount), isDead: enemy.health - amount <= 0 }
                : enemy
        )
    })),

    removeEnemy: (id) => set((state) => ({
        enemies: state.enemies.filter(enemy => enemy.id !== id)
    }))
}))
