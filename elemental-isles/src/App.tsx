import { useState } from 'react'
import { GameCanvas } from './game/GameCanvas'
import { Hud } from './ui/Hud'
import { CharacterSelection } from './ui/CharacterSelection'
import { ErrorBoundary } from './ui/ErrorBoundary'

function App() {
    const [hasSelectedCharacter, setHasSelectedCharacter] = useState(false)

    return (
        <ErrorBoundary>
            <div className="w-full h-screen bg-black relative overflow-hidden">
                {!hasSelectedCharacter ? (
                    <CharacterSelection onSelect={() => setHasSelectedCharacter(true)} />
                ) : (
                    <>
                        <GameCanvas />
                        <Hud />
                    </>
                )}
            </div>
        </ErrorBoundary>
    )
}

export default App
