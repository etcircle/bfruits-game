import { usePlayerStore } from '../state/usePlayerStore'
import { ABILITIES, useAbilityStore } from '../game/AbilitiesSystem'

export function Hud() {
    const { health, maxHealth, energy, maxEnergy, xp, xpToNextLevel, level } = usePlayerStore()

    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* Top Left: Player Stats */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
                {/* Level Badge */}
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        <span className="text-white font-bold text-lg">{level}</span>
                    </div>
                    <div className="text-white font-bold text-xl drop-shadow-md">Player</div>
                </div>

                {/* Health Bar */}
                <div className="w-64 h-6 bg-gray-900/80 rounded-full overflow-hidden border border-white/20 backdrop-blur-sm">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
                        style={{ width: `${(health / maxHealth) * 100}%` }}
                    />
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs text-white font-bold shadow-black drop-shadow-md">
                        {health} / {maxHealth} HP
                    </div>
                </div>

                {/* Energy Bar */}
                <div className="w-64 h-4 bg-gray-900/80 rounded-full overflow-hidden border border-white/20 backdrop-blur-sm mt-1">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                        style={{ width: `${(energy / maxEnergy) * 100}%` }}
                    />
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-[10px] text-white font-bold shadow-black drop-shadow-md">
                        {Math.floor(energy)} / {maxEnergy} Energy
                    </div>
                </div>

                {/* XP Bar */}
                <div className="w-64 h-4 bg-gray-900/80 rounded-full overflow-hidden border border-white/20 backdrop-blur-sm mt-1">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-300"
                        style={{ width: `${(xp / xpToNextLevel) * 100}%` }}
                    />
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-[10px] text-white font-bold shadow-black drop-shadow-md">
                        {xp} / {xpToNextLevel} XP
                    </div>
                </div>
            </div>

            {/* Bottom Center: Abilities */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                {Object.values(ABILITIES).map((ability) => (
                    <AbilitySlot key={ability.id} ability={ability} />
                ))}
            </div>

            {/* Debug Button (temporary) */}
            <div className="absolute bottom-4 right-4 pointer-events-auto">
                <button
                    onClick={() => usePlayerStore.getState().gainXp(150)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg font-bold"
                >
                    +150 XP (Debug)
                </button>
            </div>
        </div>
    )
}

function AbilitySlot({ ability }: { ability: import('../game/AbilitiesSystem').Ability }) {
    const cooldowns = useAbilityStore(state => state.cooldowns)
    const cooldownEnd = cooldowns[ability.id] || 0
    const now = Date.now()
    const timeLeft = Math.max(0, cooldownEnd - now)
    const isOnCooldown = timeLeft > 0

    // Calculate fill percentage (inverse)
    const progress = isOnCooldown ? (timeLeft / ability.cooldown) * 100 : 0

    return (
        <div className="relative w-16 h-16 bg-gray-900/80 border-2 border-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm overflow-hidden">
            {/* Icon / Text */}
            <span className="text-white font-bold z-10 drop-shadow-md">{ability.name.split(' ')[0]}</span>

            {/* Key Hint */}
            <div className="absolute top-1 left-1 text-[10px] text-gray-400 font-mono">
                {ability.id === 'flame_core' ? '1' : ability.id === 'shadow_orb' ? '2' : '3'}
            </div>

            {/* Cooldown Overlay */}
            {isOnCooldown && (
                <div
                    className="absolute bottom-0 left-0 w-full bg-black/60"
                    style={{ height: `${progress}%` }}
                />
            )}

            {/* Cooldown Text */}
            {isOnCooldown && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <span className="text-white font-bold text-lg drop-shadow-md">{(timeLeft / 1000).toFixed(1)}</span>
                </div>
            )}
        </div>
    )
}
