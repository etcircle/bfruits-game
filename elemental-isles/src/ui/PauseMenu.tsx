import { useState, useEffect } from 'react'
import { saveGame, loadGame, resetGame } from '../utils/saveLoad'

interface PauseMenuProps {
    isOpen: boolean
    onClose: () => void
}

export function PauseMenu({ isOpen, onClose }: PauseMenuProps) {
    const [showResetConfirm, setShowResetConfirm] = useState(false)
    const [notification, setNotification] = useState<string | null>(null)

    // Close menu with ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !showResetConfirm) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, showResetConfirm, onClose])

    const handleSave = () => {
        const success = saveGame()
        setNotification(success ? 'Game saved successfully!' : 'Failed to save game')
        setTimeout(() => setNotification(null), 2000)
    }

    const handleLoad = () => {
        const success = loadGame()
        setNotification(success ? 'Game loaded successfully!' : 'No save data found')
        setTimeout(() => setNotification(null), 2000)
    }

    const handleReset = () => {
        const success = resetGame()
        if (success) {
            setNotification('Game reset successfully!')
            setShowResetConfirm(false)
            setTimeout(() => {
                setNotification(null)
                onClose()
            }, 1500)
        } else {
            setNotification('Failed to reset game')
            setTimeout(() => setNotification(null), 2000)
        }
    }

    if (!isOpen) return null

    return (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-white/20 rounded-2xl p-8 w-96 shadow-2xl">
                {/* Header */}
                <h2 className="text-3xl font-bold text-white text-center mb-6 drop-shadow-lg">
                    {showResetConfirm ? 'Confirm Reset' : 'Game Paused'}
                </h2>

                {/* Notification */}
                {notification && (
                    <div className="mb-4 p-3 bg-blue-600/80 text-white text-center rounded-lg font-semibold animate-pulse">
                        {notification}
                    </div>
                )}

                {/* Reset Confirmation */}
                {showResetConfirm ? (
                    <div className="space-y-4">
                        <p className="text-white text-center mb-4">
                            Are you sure you want to reset all progress? This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={handleReset}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-bold transition-colors shadow-lg"
                            >
                                Yes, Reset
                            </button>
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-bold transition-colors shadow-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Resume Button */}
                        <button
                            onClick={onClose}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-bold transition-colors shadow-lg"
                        >
                            Resume Game
                        </button>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-bold transition-colors shadow-lg"
                        >
                            Save Game
                        </button>

                        {/* Load Button */}
                        <button
                            onClick={handleLoad}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-bold transition-colors shadow-lg"
                        >
                            Load Game
                        </button>

                        {/* Reset Button */}
                        <button
                            onClick={() => setShowResetConfirm(true)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-bold transition-colors shadow-lg"
                        >
                            Reset Progress
                        </button>

                        {/* Controls Info */}
                        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-white/10">
                            <h3 className="text-white font-bold mb-2">Controls:</h3>
                            <ul className="text-gray-300 text-sm space-y-1">
                                <li><span className="font-mono bg-gray-700 px-2 py-0.5 rounded">WASD</span> - Move</li>
                                <li><span className="font-mono bg-gray-700 px-2 py-0.5 rounded">Right Click + Drag</span> - Rotate Camera</li>
                                <li><span className="font-mono bg-gray-700 px-2 py-0.5 rounded">Space</span> - Jump</li>
                                <li><span className="font-mono bg-gray-700 px-2 py-0.5 rounded">Shift</span> - Sprint</li>
                                <li><span className="font-mono bg-gray-700 px-2 py-0.5 rounded">Left Click</span> - Attack</li>
                                <li><span className="font-mono bg-gray-700 px-2 py-0.5 rounded">1/2/3</span> - Use Abilities</li>
                                <li><span className="font-mono bg-gray-700 px-2 py-0.5 rounded">ESC</span> - Pause Menu</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
