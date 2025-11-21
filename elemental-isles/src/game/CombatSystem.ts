import { create } from 'zustand'
import * as THREE from 'three'

interface CombatState {
    isAttacking: boolean
    lastAttackTime: number
    attackCooldown: number
    performAttack: () => void
}

export const useCombatStore = create<CombatState>((set, get) => ({
    isAttacking: false,
    lastAttackTime: 0,
    attackCooldown: 500, // ms
    performAttack: () => {
        const now = Date.now()
        const state = get()
        if (now - state.lastAttackTime > state.attackCooldown) {
            set({ isAttacking: true, lastAttackTime: now })
            setTimeout(() => set({ isAttacking: false }), 200) // Attack duration
        }
    }
}))

// Helper for hit detection
export function checkHit(attackerPos: THREE.Vector3, attackerDir: THREE.Vector3, targetPos: THREE.Vector3, range: number = 3, angle: number = Math.PI / 3) {
    const toTarget = targetPos.clone().sub(attackerPos)
    const dist = toTarget.length()
    if (dist > range) return false

    toTarget.normalize()
    const dot = attackerDir.dot(toTarget)
    return Math.acos(dot) < angle
}
