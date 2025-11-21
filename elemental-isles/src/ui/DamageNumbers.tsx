import { useState, useEffect } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { create } from 'zustand'

export interface DamageNumber {
    id: string
    position: THREE.Vector3
    damage: number
    timestamp: number
    type: 'player' | 'enemy' // who dealt the damage
}

interface DamageNumberStore {
    damageNumbers: DamageNumber[]
    addDamageNumber: (position: THREE.Vector3, damage: number, type: 'player' | 'enemy') => void
    removeDamageNumber: (id: string) => void
}

export const useDamageNumberStore = create<DamageNumberStore>((set) => ({
    damageNumbers: [],

    addDamageNumber: (position, damage, type) => {
        const newDamageNumber: DamageNumber = {
            id: `dmg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            position: position.clone(),
            damage: Math.round(damage),
            timestamp: Date.now(),
            type
        }

        set((state) => ({
            damageNumbers: [...state.damageNumbers, newDamageNumber]
        }))
    },

    removeDamageNumber: (id) => {
        set((state) => ({
            damageNumbers: state.damageNumbers.filter(d => d.id !== id)
        }))
    }
}))

/**
 * DamageNumbers component - renders floating damage text
 */
export function DamageNumbers() {
    const damageNumbers = useDamageNumberStore(state => state.damageNumbers)

    return (
        <group>
            {damageNumbers.map(dmgNum => (
                <DamageNumberDisplay key={dmgNum.id} data={dmgNum} />
            ))}
        </group>
    )
}

/**
 * Individual floating damage number
 */
function DamageNumberDisplay({ data }: { data: DamageNumber }) {
    const [position, setPosition] = useState(data.position.clone())
    const [opacity, setOpacity] = useState(1)
    const removeDamageNumber = useDamageNumberStore(state => state.removeDamageNumber)

    useEffect(() => {
        const duration = 800 // ms
        const startTime = Date.now()

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = elapsed / duration

            if (progress >= 1) {
                removeDamageNumber(data.id)
                return
            }

            // Float upward
            const newY = data.position.y + progress * 2
            setPosition(new THREE.Vector3(
                data.position.x,
                newY,
                data.position.z
            ))

            // Fade out
            setOpacity(1 - progress)

            requestAnimationFrame(animate)
        }

        animate()
    }, [data.id, data.position, removeDamageNumber])

    // Color based on who dealt the damage
    const color = data.type === 'player' ? '#ff8800' : '#ff0000'

    return (
        <Html position={position} center>
            <div
                style={{
                    color,
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    opacity,
                    pointerEvents: 'none',
                    fontFamily: 'Arial, sans-serif'
                }}
            >
                {data.damage}
            </div>
        </Html>
    )
}
