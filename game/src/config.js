// Sizzle & Serve — tuning constants and the menu.
// One file, one job: every number the kitchen runs on lives here.
export const VIEW = { width: 1280, height: 800 };
export const STEP = 1 / 60;
export const SHIFT_SECONDS = 150;
export const MAX_ORDERS = 3;
export const ORDER_PATIENCE = 55;
export const ORDER_SPAWN_EVERY = 14;
export const GRILL_SLOTS = 3;
export const GRILL_COOK_SECONDS = 6;
export const GRILL_BURN_SECONDS = 14;
export const COMBO_WINDOW = 12;
export const BEST_KEY = 'sizzle-and-serve-best';

// The pantry: every ingredient the cook can reach for, with its key, colour and emoji-free
// drawn shape (render.js draws each one as a little vector picture).
export const INGREDIENTS = [
  { id: 'bun', name: 'Bun', key: '1', color: '#e8a94e' },
  { id: 'patty', name: 'Patty', key: '2', color: '#8a5a2b' },
  { id: 'cheese', name: 'Cheese', key: '3', color: '#ffc93c' },
  { id: 'lettuce', name: 'Lettuce', key: '4', color: '#58b368' },
  { id: 'tomato', name: 'Tomato', key: '5', color: '#e4572e' },
  { id: 'fries', name: 'Fries', key: '6', color: '#f4c95d' },
  { id: 'soda', name: 'Soda', key: '7', color: '#c65d7b' },
];

// The menu: each dish is a list of ingredient ids in build order, a price and a name.
// A patty must be grilled first; a raw patty on the plate never counts.
export const MENU = [
  { id: 'burger', name: 'Sunny Burger', needs: ['bun', 'patty', 'lettuce', 'tomato'], price: 12 },
  { id: 'cheeseburger', name: 'Melty Cheese Burger', needs: ['bun', 'patty', 'cheese', 'lettuce'], price: 15 },
  { id: 'garden', name: 'Garden Stack', needs: ['bun', 'lettuce', 'tomato', 'cheese'], price: 10 },
  { id: 'combo', name: 'Fry-Day Combo', needs: ['bun', 'patty', 'cheese', 'fries', 'soda'], price: 22 },
  { id: 'snack', name: 'Fries & Fizz', needs: ['fries', 'soda'], price: 8 },
];

// Layout rectangles (canvas space) so render and input agree on where things are.
export const LAYOUT = {
  board: { x: 24, y: 24, w: 420, h: 190 },
  grill: { x: 480, y: 24, w: 360, h: 190 },
  plate: { x: 880, y: 24, w: 376, h: 190 },
  counter: { x: 24, y: 560, w: 1232, h: 150 },
  serve: { x: 1080, y: 240, w: 176, h: 64 },
  trash: { x: 24, y: 240, w: 176, h: 64 },
  hud: { x: 24, y: 724, w: 1232, h: 56 },
};
