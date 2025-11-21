import { usePlayerStore } from '../state/usePlayerStore'
import { useEffect } from 'react'

export function LevelUpNotification() {
    const levelUpMessage = usePlayerStore(state => state.levelUpMessage)
    const clearLevelUpMessage = usePlayerStore(state => state.clearLevelUpMessage)

    useEffect(() => {
        if (levelUpMessage) {
            const timer = setTimeout(() => {
                clearLevelUpMessage()
            }, 5000) // Show for 5 seconds
            return () => clearTimeout(timer)
        }
    }, [levelUpMessage, clearLevelUpMessage])

    if (!levelUpMessage) return null

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-lg shadow-2xl border-2 border-yellow-300 animate-bounce">
                <div className="text-2xl font-bold text-center drop-shadow-lg">
                    {levelUpMessage}
                </div>
            </div>
        </div>
    )
}
