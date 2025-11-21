# Bugs & Issues

## Known Issues

### Visuals
- [ ] **Enemy Health Bars**: Health bars may not track enemy position perfectly during fast movement.
- [ ] **Z-Fighting**: Potential flickering on overlapping geometry in the city.

### Gameplay
- [ ] **Collision**: Player can sometimes clip through building corners at high speeds.
- [ ] **AI Pathfinding**: Enemies move in straight lines and can get stuck on obstacles (no A* pathfinding yet).

### Performance
- [ ] **Tree Rendering**: High object count might impact performance on lower-end devices (needs instancing).

## Resolved Issues
- [x] **Double Jump Particles**: Fixed issue where particles triggered on the first jump.
