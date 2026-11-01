export const C = {
  blue: '#2B3CE0', blueDark: '#1E2BB5', blueLight: '#7B88FF', yellow: '#FFB52E',
  bg: '#17181B', card: '#25262B', card2: '#303137', text: '#F4F5F7', mute: '#9A9DA6',
  green: '#2ECC71', amber: '#F5A623', red: '#FF6B6B', line: '#2F3036',
} as const;

export const TILES = [
  { bg: '#1B2350', fg: '#7B88FF' },
  { bg: '#17332A', fg: '#2ECC71' },
  { bg: '#3A2418', fg: '#FF8A4C' },
  { bg: '#2A1F4A', fg: '#B18CFF' },
  { bg: '#3A1A2C', fg: '#FF6FA8' },
  { bg: '#143339', fg: '#3DD6E0' },
] as const;
export const tileAt = (i: number) => TILES[i % TILES.length];
