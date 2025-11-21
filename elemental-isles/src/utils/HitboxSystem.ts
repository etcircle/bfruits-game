import * as THREE from 'three'

/**
 * Check if two spheres intersect
 * Used for projectile collision detection
 */
export function checkSphereIntersection(
    pos1: THREE.Vector3,
    radius1: number,
    pos2: THREE.Vector3,
    radius2: number
): boolean {
    const distance = pos1.distanceTo(pos2)
    return distance < (radius1 + radius2)
}

/**
 * Check if a target is within an arc/cone hitbox
 * Used for melee attacks and dash abilities
 */
export function checkArcHitbox(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    arcAngle: number, // in radians
    range: number,
    targetPos: THREE.Vector3
): boolean {
    const toTarget = targetPos.clone().sub(origin)
    const distance = toTarget.length()

    if (distance > range) return false
    if (distance < 0.1) return true // Very close, always hit

    toTarget.normalize()
    const dot = direction.dot(toTarget)
    const angle = Math.acos(Math.max(-1, Math.min(1, dot))) // Clamp to avoid NaN

    return angle < arcAngle / 2
}

/**
 * Find the nearest target within a cone (for auto-aim)
 * Returns the closest target or null if none found
 */
export function findNearestInCone<T extends { position: THREE.Vector3 }>(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    targets: T[],
    coneAngle: number, // in radians
    maxRange: number
): T | null {
    let nearest: T | null = null
    let nearestDistance = Infinity

    for (const target of targets) {
        if (checkArcHitbox(origin, direction, coneAngle, maxRange, target.position)) {
            const distance = origin.distanceTo(target.position)
            if (distance < nearestDistance) {
                nearest = target
                nearestDistance = distance
            }
        }
    }

    return nearest
}

/**
 * Predict future position of a target moving with velocity
 * Used for enemy projectile aiming
 */
export function predictPosition(
    currentPos: THREE.Vector3,
    velocity: THREE.Vector3,
    timeAhead: number
): THREE.Vector3 {
    return currentPos.clone().add(velocity.clone().multiplyScalar(timeAhead))
}
