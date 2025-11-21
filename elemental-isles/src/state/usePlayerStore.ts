import { create } from 'zustand'

interface PlayerState {
    health: number
    maxHealth: number
    energy: number
    maxEnergy: number
    level: number
    xp: number
    xpToNextLevel: number
    unlockedAbilities: string[]
    levelUpMessage: string | null

    // Character Style
    characterStyleId: string
    setCharacterStyle: (id: string) => void

    // Dash mechanics
    isDashing: boolean
    dashCooldown: number
    airDashCooldown: number
    slideCooldown: number
    setDashing: (dashing: boolean) => void
    updateDashCooldown: (cooldown: number) => void
    updateAirDashCooldown: (cooldown: number) => void
    updateSlideCooldown: (cooldown: number) => void
    consumeEnergy: (amount: number) => boolean
    regenerateEnergy: (amount: number) => void

    takeDamage: (amount: number) => void
    gainXp: (amount: number) => void
    unlockAbility: (abilityName: string) => void
    clearLevelUpMessage: () => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
    health: 100,
    maxHealth: 100,
    energy: 100,
    maxEnergy: 100,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    unlockedAbilities: [],
    levelUpMessage: null,

    // Character Style
    characterStyleId: 'rookie', // Default
    setCharacterStyle: (id) => set({ characterStyleId: id }),

    // Dash mechanics
    isDashing: false,
    dashCooldown: 0,
    airDashCooldown: 0,
    slideCooldown: 0,
    setDashing: (dashing) => set({ isDashing: dashing }),
    updateDashCooldown: (cooldown) => set({ dashCooldown: Math.max(0, cooldown) }),
    updateAirDashCooldown: (cooldown) => set({ airDashCooldown: Math.max(0, cooldown) }),
    updateSlideCooldown: (cooldown) => set({ slideCooldown: Math.max(0, cooldown) }),
    consumeEnergy: (amount) => {
        const state = usePlayerStore.getState()
        if (state.energy >= amount) {
            set({ energy: state.energy - amount })
            return true
        }
        return false
    },
    regenerateEnergy: (amount) => set((state) => ({
        energy: Math.min(state.maxEnergy, state.energy + amount)
    })),

    takeDamage: (amount) => set((state) => ({ health: Math.max(0, state.health - amount) })),

    gainXp: (amount) => set((state) => {
        const newXp = state.xp + amount
        if (newXp >= state.xpToNextLevel) {
            const newLevel = state.level + 1
            const newAbilities = [...state.unlockedAbilities]
            let message = `Level Up! You are now level ${newLevel}!`

            // Unlock abilities at specific levels
            if (newLevel === 2 && !newAbilities.includes('flame_core')) {
                newAbilities.push('flame_core')
                message += ' Unlocked: Flame Core!'
            } else if (newLevel === 4 && !newAbilities.includes('shadow_orb')) {
                newAbilities.push('shadow_orb')
                message += ' Unlocked: Shadow Orb!'
            } else if (newLevel === 6 && !newAbilities.includes('thunder_seed')) {
                newAbilities.push('thunder_seed')
                message += ' Unlocked: Thunder Seed!'
            }

            return {
                level: newLevel,
                xp: newXp - state.xpToNextLevel,
                xpToNextLevel: Math.floor(state.xpToNextLevel * 1.5),
                health: state.maxHealth + 20,
                maxHealth: state.maxHealth + 20,
                unlockedAbilities: newAbilities,
                levelUpMessage: message
            }
        }
        return { xp: newXp }
    }),

    unlockAbility: (abilityName) => set((state) => ({
        unlockedAbilities: [...state.unlockedAbilities, abilityName]
    })),

    clearLevelUpMessage: () => set({ levelUpMessage: null })
}))
