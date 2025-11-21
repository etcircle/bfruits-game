# Technical Specification

## 1. Architecture

The game is built using:
- **React Three Fiber (R3F)**: For the 3D environment and rendering.
- **Rapier**: For physics simulation (rigid bodies, colliders).
- **Zustand**: For global state management.

### Key Files
- `src/game/Player.tsx`: Core player logic, physics loop, and input handling.
- `src/state/usePlayerStore.ts`: Global state for player stats (energy, cooldowns).
- `src/game/CombatSystem.ts`: Combat logic and state.
- `src/game/Enemy.tsx`: Enemy AI and rendering.
- `src/game/City.tsx`: World generation logic.

## 2. State Management

### Player Store (`usePlayerStore.ts`)
- **Energy**: `energy` (current), `maxEnergy` (default 100).
- **Cooldowns**: `dashCooldown`, `airDashCooldown`, `slideCooldown`.
- **Actions**: `consumeEnergy`, `regenerateEnergy`.

### Combat Store (`useCombatStore.ts`)
- **State**: `isAttacking`, `lastAttackTime`.
- **Config**: `attackCooldown` (500ms).
- **Actions**: `performAttack`.

## 3. Physics & Logic

### Player Movement (`Player.tsx`)
- **Input**: Tracks keys via `useEffect` and `useRef`.
- **Loop**: `useFrame` handles physics updates per frame.
    - **Gravity**: Applied manually (`25 * delta`).
    - **Abilities**: Overrides velocity/position based on active ability.
    - **Collision**: Simple floor check (`y < 1`) and Rapier colliders.

### Combat (`CombatSystem.ts`)
- **Hit Detection**: `checkHit(attackerPos, attackerDir, targetPos, range, angle)`.
    - Uses dot product to determine if target is within the attack cone.
    - Checks distance for range.

### Enemy AI (`Enemy.tsx`)
- **State Machine**:
    1.  `idle`: Patrols in a circle (`PATROL_RADIUS = 5`).
    2.  `chasing`: Moves towards player (`toPlayer.normalize()`).
    3.  `windup`: Waits `WINDUP_DURATION` (800ms), visual cue (scale pulse).
    4.  `attack`: Spawns projectile (Ranged) or checks distance (Melee).
    5.  `recover`: Waits `RECOVER_DURATION` (500ms).
- **Projectile Prediction**: Ranged enemies use linear prediction to aim at moving players.

## 4. World Generation

### City (`City.tsx`)
- **Static Layout**: Hardcoded array of building positions and types.
- **Components**:
    - `Building`: Renders specific building types based on props.
    - `World`: Renders ground plane and random trees.

## 5. Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `FIRST_JUMP_FORCE` | 10 | Upward velocity for first jump. |
| `DASH_SPEED` | 20 | Speed multiplier during dash. |
| `SLIDE_SPEED` | 15 | Initial slide speed. |
| `WINDUP_DURATION` | 800ms | Enemy attack telegraph time. |
| `ATTACK_DURATION` | 300ms | Enemy attack active time. |
