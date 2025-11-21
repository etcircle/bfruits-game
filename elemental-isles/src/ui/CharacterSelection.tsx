import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { CHARACTER_STYLES, type CharacterStyle } from '../game/characterStyles'
import { CharacterModel } from '../game/CharacterModel'
import { usePlayerStore } from '../state/usePlayerStore'

interface CharacterSelectionProps {
    onSelect: () => void
}

export function CharacterSelection({ onSelect }: CharacterSelectionProps) {
    const setCharacterStyle = usePlayerStore(state => state.setCharacterStyle)

    const handleSelect = (styleId: string) => {
        setCharacterStyle(styleId)
        onSelect()
    }

    return (
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-black flex flex-col items-center justify-center z-50 text-white">
            <h1 className="text-6xl font-bold mb-8 text-yellow-400 drop-shadow-lg tracking-wider">CHOOSE YOUR PATH</h1>

            <div className="flex gap-8 items-center justify-center w-full max-w-6xl px-4">
                {CHARACTER_STYLES.map((style) => (
                    <CharacterCard key={style.id} style={style} onSelect={() => handleSelect(style.id)} />
                ))}
            </div>
        </div>
    )
}

function CharacterCard({ style, onSelect }: { style: CharacterStyle, onSelect: () => void }) {
    return (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 w-80 flex flex-col items-center hover:scale-105 transition-transform duration-300 group">
            <div className="h-64 w-full bg-black/20 rounded-lg mb-4 overflow-hidden relative">
                <Canvas shadows camera={{ position: [0, 1.5, 3], fov: 45 }}>
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[2, 5, 2]} intensity={1} castShadow />
                    <CharacterModel isAttacking={false} isMoving={true} style={style} />
                    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={4} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2} />
                </Canvas>
            </div>

            <h2 className="text-2xl font-bold mb-2 text-yellow-300">{style.name}</h2>
            <p className="text-gray-300 text-center mb-6 text-sm h-10">{style.description}</p>

            <button
                onClick={onSelect}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg uppercase tracking-wide shadow-lg transform transition hover:-translate-y-1 active:translate-y-0"
            >
                Select
            </button>
        </div>
    )
}
