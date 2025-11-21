import { create } from 'zustand'
import * as THREE from 'three'

export type ProjectileType = 'flame' | 'thunder' | 'enemy_shot'

export interface ProjectileData {
    id: string
    owner: 'player' | string // 'player' or enemy ID
    position: THREE.Vector3
    velocity: THREE.Vector3
    damage: number
    type: ProjectileType
    spawnTime: number
    maxDistance: number
    startPosition: THREE.Vector3
    visualSize: number
    color: string
}

interface ProjectileStore {
    projectiles: ProjectileData[]
    spawnProjectile: (data: Omit<ProjectileData, 'id' | 'spawnTime' | 'startPosition'>) => void
    removeProjectile: (id: string) => void
    updateProjectile: (id: string, position: THREE.Vector3) => void
    clearProjectiles: () => void
}

export const useProjectileStore = create<ProjectileStore>((set) => ({
    projectiles: [],

    spawnProjectile: (data) => {
        const newProjectile: ProjectileData = {
            ...data,
            id: `projectile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            spawnTime: Date.now(),
            startPosition: data.position.clone(),
            position: data.position.clone(),
            velocity: data.velocity.clone()
        }

        set((state) => ({
            projectiles: [...state.projectiles, newProjectile]
        }))
    },

    removeProjectile: (id) => {
        set((state) => ({
            projectiles: state.projectiles.filter(p => p.id !== id)
        }))
    },

    updateProjectile: (id, position) => {
        set((state) => ({
            projectiles: state.projectiles.map(p =>
                p.id === id ? { ...p, position: position.clone() } : p
            )
        }))
    },

    clearProjectiles: () => {
        set({ projectiles: [] })
    }
}))
