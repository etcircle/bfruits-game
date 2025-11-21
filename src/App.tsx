import GameCanvas from './game/GameCanvas'

function App() {
    return (
        <div className="w-full h-screen bg-black text-white">
            <GameCanvas />

            {/* UI Overlay Placeholder */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="p-4">
                    <h1 className="text-2xl font-bold drop-shadow-md">Elemental Isles</h1>
                    <p className="text-sm opacity-70">Loading...</p>
                </div>
            </div>
        </div>
    )
}

export default App
