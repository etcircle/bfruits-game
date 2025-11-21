import { usePlayerStore } from '../state/usePlayerStore'

const SAVE_KEY = 'elemental_isles_save'

export interface SaveData {
    player: {
        health: number
        maxHealth: number
        energy: number
        maxEnergy: number
        level: number
        xp: number
        xpToNextLevel: number
        unlockedAbilities: string[]
    }
    timestamp: number
}

export function saveGame() {
    const playerState = usePlayerStore.getState()

    const saveData: SaveData = {
        player: {
            health: playerState.health,
            maxHealth: playerState.maxHealth,
            energy: playerState.energy,
            maxEnergy: playerState.maxEnergy,
            level: playerState.level,
            xp: playerState.xp,
            xpToNextLevel: playerState.xpToNextLevel,
            unlockedAbilities: playerState.unlockedAbilities
        },
        timestamp: Date.now()
    }

    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData))
        console.log('Game saved successfully!')
        return true
    } catch (error) {
        console.error('Failed to save game:', error)
        return false
    }
}

export function loadGame() {
    try {
        const savedData = localStorage.getItem(SAVE_KEY)
        if (!savedData) {
            console.log('No save data found')
            return false
        }

        const saveData: SaveData = JSON.parse(savedData)

        // Restore player state
        usePlayerStore.setState({
            health: saveData.player.health,
            maxHealth: saveData.player.maxHealth,
            energy: saveData.player.energy,
            maxEnergy: saveData.player.maxEnergy,
            level: saveData.player.level,
            xp: saveData.player.xp,
            xpToNextLevel: saveData.player.xpToNextLevel,
            unlockedAbilities: saveData.player.unlockedAbilities
        })

        console.log('Game loaded successfully!')
        return true
    } catch (error) {
        console.error('Failed to load game:', error)
        return false
    }
}

export function resetGame() {
    try {
        localStorage.removeItem(SAVE_KEY)

        // Reset to default state
        usePlayerStore.setState({
            health: 100,
            maxHealth: 100,
            energy: 100,
            maxEnergy: 100,
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            unlockedAbilities: [],
            levelUpMessage: null
        })

        console.log('Game reset successfully!')
        return true
    } catch (error) {
        console.error('Failed to reset game:', error)
        return false
    }
}
