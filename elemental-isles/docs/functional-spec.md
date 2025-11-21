# Functional Specification

## 1. Player Movement

### Controls Overview

| Action | Key Binding | Condition | Description |
|--------|-------------|-----------|-------------|
| **Move** | `W`, `A`, `S`, `D` | Ground/Air | Basic character movement relative to camera. |
| **Jump** | `Space` | Ground | Initial jump. |
| **Double Jump** | `Space` (in air) | Air | Second jump for extra height. |
| **Sprint** | `Shift` (hold) | Ground | Increases movement speed. |
| **Ground Dash** | `Q` | Ground | Quick forward burst of speed. |
| **Air Dash** | `E` | Air | Mid-air dash for horizontal distance. |
| **Slide** | `Ctrl` (hold) | Ground + Moving | Slide along the ground, preserving momentum. |
| **Glide** | `Space` (hold) | Air + Falling | Slow fall with horizontal control. |

### Feature Details

#### Double Jump
- **Activation**: Press `Space` while in the air after a first jump.
- **Limit**: Once per airborne sequence. Resets upon landing.
- **Visuals**: Blue particle explosion at the jump point.

#### Ground Dash
- **Activation**: Press `Q` while on the ground.
- **Effect**: Rapidly moves the player 8 units in the movement direction (or forward).
- **Cost**: 20 Energy.
- **Cooldown**: 1.5 seconds.
- **Visuals**: Cyan energy ring and glow.

#### Air Dash
- **Activation**: Press `E` while in the air.
- **Effect**: Rapidly moves the player 6 units in the movement direction.
- **Cost**: 25 Energy.
- **Cooldown**: 2.0 seconds.
- **Visuals**: Orange/Amber energy ring.
- **Note**: Can only be used once per jump (resets on landing).

#### Sliding
- **Activation**: Hold `Ctrl` while moving on the ground.
- **Effect**: Player slides in the current direction.
- **Physics**: Speed starts high (15 units/s) and decays over 1.5 seconds.
- **Cost**: 15 Energy.
- **Cooldown**: 1.0 second.
- **Visuals**: Purple particle trail and ground friction sparks.
- **Combo**: Can jump out of a slide to preserve momentum.

#### Gliding
- **Activation**: Hold `Space` while falling (velocity < 0).
- **Effect**: Reduces fall speed significantly (to 3 units/s) and allows horizontal movement (8 units/s).
- **Cost**: 5 Energy per second.
- **Duration**: Until energy runs out or `Space` is released.
- **Visuals**: Cyan/White energy wings.

## 2. Combat System

### Mechanics
- **Attacking**: Left-click to perform a basic attack.
- **Cooldown**: Attacks have a 0.5s cooldown (500ms).
- **Hit Detection**: Cone-based hit detection (Range: 3 units, Angle: 60 degrees).
- **Damage**: Basic attacks deal damage to enemies within range and angle.

## 3. Enemies

### Types
- **Melee**: Chases the player and attacks at close range (Range: 3 units).
- **Ranged**: Maintains distance and shoots projectiles at the player.

### AI Behavior
- **Idle**: Patrols in a circle around their spawn point.
- **Chasing**: Moves towards the player when within Aggro Range.
- **Windup**: Telegraphs an attack before striking (Yellow visual indicator).
- **Attack**: Executes the attack (Orange visual indicator).
- **Recover**: Pauses briefly after attacking before resuming behavior.

### Visuals
- **Health Bar**: Displays above the enemy, changing color based on health (Red -> Yellow).
- **Indicators**:
    - **Melee**: Red body.
    - **Ranged**: Darker red body with a floating orb above.
    - **Dead**: Grey body, fades out.

## 4. World

### City
- **Layout**: Central plaza with a fountain.
- **Buildings**:
    - **Temple**: Large structure with pillars.
    - **Tower**: Tall structure with stacked windows.
    - **House**: Standard residential building.
    - **Shop**: Commercial building.
- **Environment**: Trees scattered randomly around the world.
