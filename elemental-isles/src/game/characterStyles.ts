export interface CharacterStyle {
  id: string;
  name: string;
  description: string;
  colors: {
    skin: string;
    shirt: string;
    pants: string;
    hair: string;
    shoes: string;
  };
  accessory: 'none' | 'straw_hat' | 'cape' | 'bandana';
}

export const CHARACTER_STYLES: CharacterStyle[] = [
  {
    id: 'rookie',
    name: 'The Rookie',
    description: 'A spirited adventurer with a dream.',
    colors: {
      skin: '#ffdbac',
      shirt: '#ff0000', // Red vest
      pants: '#0066cc', // Blue shorts
      hair: '#1a1a1a',  // Black hair
      shoes: '#f0e68c', // Sandals/Yellowish
    },
    accessory: 'straw_hat',
  },
  {
    id: 'swordsman',
    name: 'The Swordsman',
    description: 'A disciplined warrior seeking strength.',
    colors: {
      skin: '#ffdbac',
      shirt: '#ffffff', // White shirt
      pants: '#1a1a1a', // Black pants
      hair: '#00cc00',  // Green hair
      shoes: '#333333', // Black boots
    },
    accessory: 'bandana',
  },
  {
    id: 'admiral',
    name: 'The Admiral',
    description: 'A powerful enforcer of justice.',
    colors: {
      skin: '#ffdbac',
      shirt: '#ffcc00', // Yellow/Gold suit
      pants: '#ffcc00', // Yellow/Gold pants
      hair: '#333333',  // Dark hair
      shoes: '#ffffff', // White shoes
    },
    accessory: 'cape',
  },
];

export const DEFAULT_STYLE = CHARACTER_STYLES[0];
