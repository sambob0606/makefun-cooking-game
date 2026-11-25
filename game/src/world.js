// The kitchen itself: orders, grill, plate, timer, score.
// One file, one job: the rules of a shift, with no drawing and no input code.
import {
  GRILL_BURN_SECONDS,
  GRILL_COOK_SECONDS,
  GRILL_SLOTS,
  INGREDIENTS,
  LAYOUT,
  MAX_ORDERS,
  MENU,
  ORDER_PATIENCE,
  ORDER_SPAWN_EVERY,
  SHIFT_SECONDS,
  COMBO_WINDOW,
} from './config.js';
import { dishForPlate, matchingOrder } from './recipes.js';

export const EVENT_SERVED = 1;
export const EVENT_FAILED = 2;
export const EVENT_OVER = 4;
export const EVENT_BURNT = 8;
export const EVENT_NEW_ORDER = 16;

const COUNTER_SLOT_W = 168;
const COUNTER_SLOT_GAP = 6;

function counterSlot(index) {
  const area = LAYOUT.counter;
  return {
    x: area.x + 14 + index * (COUNTER_SLOT_W + COUNTER_SLOT_GAP),
    y: area.y + 52,
    w: COUNTER_SLOT_W,
    h: 86,
  };
}

function grillSlot(index) {
  const area = LAYOUT.grill;
  const w = (area.w - 32) / GRILL_SLOTS;
  return { x: area.x + 16 + index * w, y: area.y + 62, w: w - 10, h: 104 };
}

function inside(point, rect) {
  return point && point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
}

export function createWorld(random) {
  let nextOrder = 1;

  function freshState() {
    return {
      timeLeft: SHIFT_SECONDS,
      score: 0,
      served: 0,
      failed: 0,
      streak: 0,
      comboLeft: 0,
      spawnIn: 2,
      plate: [],
      grill: Array.from({ length: GRILL_SLOTS }, () => ({ state: 'empty', t: 0 })),
      orders: [],
      lastServe: null,
      message: '',
      messageT: 0,
    };
  }

  const state = freshState();

  function spawnOrder() {
    let dish = random.pick(MENU);
    if (state.orders.some((o) => o.dishId === dish.id)) dish = random.pick(MENU);
    state.orders.push({
      id: nextOrder,
      dishId: dish.id,
      name: dish.name,
      needs: [...dish.needs],
      price: dish.price,
      patience: ORDER_PATIENCE,
      maxPatience: ORDER_PATIENCE,
      ticket: nextOrder,
    });
    nextOrder += 1;
    return EVENT_NEW_ORDER;
  }

  function servePlate() {
    const order = matchingOrder(state.plate, state.orders);
    if (!order) return 0;
    const dish = dishForPlate(state.plate);
    const patienceBonus = Math.round((order.patience / order.maxPatience) * 5);
    const combo = state.comboLeft > 0 ? 2 : 0;
    const earned = dish.price + patienceBonus + state.streak + combo;
    state.score += earned;
    state.served += 1;
    state.streak += 1;
    state.comboLeft = COMBO_WINDOW;
    state.plate = [];
    state.orders = state.orders.filter((o) => o.id !== order.id);
    state.lastServe = { name: dish.name, earned, tip: patienceBonus };
    state.message = `Served ${dish.name} +$${earned}`;
    state.messageT = 2.5;
    return EVENT_SERVED;
  }

  function handleClick(point) {
    if (!point) return 0;
    // Serve button.
    if (inside(point, LAYOUT.serve)) return servePlate();
    // Trash button clears the plate.
    if (inside(point, LAYOUT.trash)) {
      if (state.plate.length > 0) {
        state.plate = [];
        state.message = 'Plate cleared';
        state.messageT = 1.5;
      }
      return 0;
    }
    // Grill slots: a ready patty goes on the plate, a burnt one is tossed.
    for (let i = 0; i < GRILL_SLOTS; i += 1) {
      if (!inside(point, grillSlot(i))) continue;
      const slot = state.grill[i];
      if (slot.state === 'ready') {
        if (state.plate.length < 6) {
          state.plate.push('patty');
          slot.state = 'empty';
          slot.t = 0;
        }
      } else if (slot.state === 'burnt') {
        slot.state = 'empty';
        slot.t = 0;
        state.message = 'Burnt patty tossed';
        state.messageT = 1.5;
      }
      return 0;
    }
    // Pantry counter: raw patty goes to the grill, everything else to the plate.
    for (let i = 0; i < INGREDIENTS.length; i += 1) {
      if (!inside(point, counterSlot(i))) continue;
      const item = INGREDIENTS[i];
      if (item.id === 'patty') {
        const slot = state.grill.find((s) => s.state === 'empty');
        if (slot) {
          slot.state = 'cooking';
          slot.t = 0;
        } else {
          state.message = 'Grill is full!';
          state.messageT = 1.5;
        }
      } else if (state.plate.length < 6) {
        state.plate.push(item.id);
      }
      return 0;
    }
    return 0;
  }

  function handleKeys(keys) {
    let events = 0;
    for (const key of keys) {
      const item = INGREDIENTS.find((entry) => entry.key === key);
      if (!item) continue;
      if (item.id === 'patty') {
        const slot = state.grill.find((s) => s.state === 'empty');
        if (slot) {
          slot.state = 'cooking';
          slot.t = 0;
        }
      } else if (state.plate.length < 6) {
        state.plate.push(item.id);
      }
    }
    return events;
  }

  return {
    state,
    reset() {
      const fresh = freshState();
      Object.assign(state, fresh);
      nextOrder = 1;
      spawnOrder();
    },
    slots: { counterSlot, grillSlot },
    step(dt, click, keys, paused) {
      let events = 0;
      if (paused) return events;
      if (click) events |= handleClick(click);
      if (keys && keys.length > 0) events |= handleKeys(keys);
      state.timeLeft = Math.max(0, state.timeLeft - dt);
      if (state.comboLeft > 0) state.comboLeft = Math.max(0, state.comboLeft - dt);
      if (state.messageT > 0) state.messageT = Math.max(0, state.messageT - dt);
      // Grill timers.
      for (const slot of state.grill) {
        if (slot.state === 'cooking') {
          slot.t += dt;
          if (slot.t >= GRILL_COOK_SECONDS) {
            slot.state = 'ready';
            slot.t = 0;
          }
        } else if (slot.state === 'ready') {
          slot.t += dt;
          if (slot.t >= GRILL_BURN_SECONDS) {
            slot.state = 'burnt';
            slot.t = 0;
            events |= EVENT_BURNT;
            state.message = 'A patty burnt!';
            state.messageT = 2;
          }
        }
      }
      // Order patience and spawning.
      state.spawnIn -= dt;
      if (state.spawnIn <= 0) {
        if (state.orders.length < MAX_ORDERS) events |= spawnOrder();
        state.spawnIn = ORDER_SPAWN_EVERY;
      }
      for (const order of [...state.orders]) {
        order.patience -= dt;
        if (order.patience <= 0) {
          state.orders = state.orders.filter((o) => o.id !== order.id);
          state.failed += 1;
          state.streak = 0;
          state.message = `Order #${order.ticket} walked out!`;
          state.messageT = 2.5;
          events |= EVENT_FAILED;
        }
      }
      if (state.timeLeft <= 0) events |= EVENT_OVER;
      return events;
    },
  };
}
