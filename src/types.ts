export interface CarModel {
  id: string;
  name: string;
  price: number;
  description: string;
  baseSpeed: number; // km/h multiplier factor
  handling: number; // lateral steer multiplier
  nitroCapacity: number; // Max nitro %
  ammoCapacity: number; // Max ammo capacity
  bodyType: 'sport' | 'muscle' | 'cyber' | 'hyper' | 'tank';
  defaultColor: string;
  accentColor: string;
}

export interface CustomizationSettings {
  selectedCarId: string;
  primaryColor: string;
  neonUnderglow: string; // hex color or 'none'
  spoilerStyle: 'standard' | 'gt_wing' | 'cyber_fin' | 'none';
  purchasedCars: string[];
  engineLevel: number; // 0 - 3
  nitroLevel: number; // 0 - 3
  ammoLevel: number; // 0 - 3
  wallet: number; // total accumulated coins / money
}

export interface CoinItem {
  id: number;
  x: number;
  y: number;
  value: number;
  rotation: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  age: number;
  lifetime: number;
}

export const CAR_CATALOG: CarModel[] = [
  {
    id: 'apex_runner',
    name: 'Apex Runner ST',
    price: 0,
    description: 'Deportivo equilibrado y confiable. El compañero perfecto para iniciarse en la autopista.',
    baseSpeed: 7.0,
    handling: 7.5,
    nitroCapacity: 100,
    ammoCapacity: 8,
    bodyType: 'sport',
    defaultColor: '#0284c7',
    accentColor: '#1e293b'
  },
  {
    id: 'muscle_gt',
    name: 'V8 Thunder Muscle',
    price: 350,
    description: 'Fuerza bruta americana con supercargador en el capó y chasis de acero reforzado.',
    baseSpeed: 8.2,
    handling: 7.8,
    nitroCapacity: 125,
    ammoCapacity: 10,
    bodyType: 'muscle',
    defaultColor: '#e11d48',
    accentColor: '#47141f'
  },
  {
    id: 'cyber_phantom',
    name: 'Cyber Phantom 2099',
    price: 800,
    description: 'Aeronave terrestre con aerodinámica cuántica, alerones de carbono y doble turbina.',
    baseSpeed: 9.6,
    handling: 9.0,
    nitroCapacity: 150,
    ammoCapacity: 12,
    bodyType: 'cyber',
    defaultColor: '#8b5cf6',
    accentColor: '#06b6d4'
  },
  {
    id: 'veloce_hypercar',
    name: 'Veloce F-Proto',
    price: 1500,
    description: 'Bólido prototipo de resistencia extrema. Aceleración vertiginosa y chasis ultraligero.',
    baseSpeed: 11.2,
    handling: 10.2,
    nitroCapacity: 180,
    ammoCapacity: 14,
    bodyType: 'hyper',
    defaultColor: '#10b981',
    accentColor: '#042f2e'
  },
  {
    id: 'titan_enforcer',
    name: 'Titan Juggernaut EX',
    price: 2400,
    description: 'Coloso acorazado de asalto. Dispone de torretas cuádruples y tanque de nitro masivo.',
    baseSpeed: 9.2,
    handling: 8.2,
    nitroCapacity: 220,
    ammoCapacity: 20,
    bodyType: 'tank',
    defaultColor: '#f59e0b',
    accentColor: '#1c1917'
  }
];

export const COLOR_OPTIONS = [
  { name: 'Azul Neón', hex: '#0284c7' },
  { name: 'Rojo Carmesí', hex: '#ef4444' },
  { name: 'Púrpura Cyber', hex: '#8b5cf6' },
  { name: 'Verde Esmeralda', hex: '#10b981' },
  { name: 'Ámbar Fuego', hex: '#f59e0b' },
  { name: 'Rosa Neón', hex: '#f43f5e' },
  { name: 'Negro Fantasma', hex: '#18181b' },
  { name: 'Blanco Perla', hex: '#f8fafc' },
  { name: 'Dorado Metálico', hex: '#eab308' },
  { name: 'Turquesa Aqua', hex: '#06b6d4' },
];

export const NEON_OPTIONS = [
  { name: 'Apagado', hex: 'none' },
  { name: 'Cyan Brillante', hex: '#00f0ff' },
  { name: 'Magenta Eléctrico', hex: '#ff007f' },
  { name: 'Verde Radiactivo', hex: '#39ff14' },
  { name: 'Dorado Solar', hex: '#ffe600' },
  { name: 'Púrpura UV', hex: '#bc13fe' },
];
