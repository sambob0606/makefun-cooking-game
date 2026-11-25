// The screenshot scenes behind ?shot=cover|assembly|serve|end.
// Each one plays the real rules forward from a fresh world with a scripted cook, so the
// frame is what a real shift looks like and the same seed always gives the same frame.
import { INGREDIENTS, LAYOUT, STEP } from './config.js';
import { EVENT_OVER } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

// A scripted cook: a list of {at, click} actions in shift seconds, plus keys.
function scriptedCook(world, seconds, script) {
  let done = 0;
  for (let t = 0; t < seconds; t += STEP) {
    let click = null;
    let keys = [];
    for (const action of script) {
      if (!action.fired && t >= action.at) {
        action.fired = true;
        if (action.click) click = action.click;
        if (action.keys) keys = action.keys;
      }
    }
    if (world.step(STEP, click, keys, false) & EVENT_OVER) break;
    done = t;
  }
  return done;
}

function pantryClick(index) {
  const area = LAYOUT.counter;
  return { x: area.x + 14 + index * 174 + 84, y: area.y + 95 };
}

function grillClick(index) {
  const area = LAYOUT.grill;
  const w = (area.w - 32) / 3;
  return { x: area.x + 16 + index * w + (w - 10) / 2, y: area.y + 114 };
}

function serveClick() {
  const s = LAYOUT.serve;
  return { x: s.x + s.w / 2, y: s.y + s.h / 2 };
}

/**
 * Set `world` to the named scene and return the screen to draw over it.
 * cover: title screen over a kitchen already busy with orders and a cooking patty.
 * assembly: mid-shift, a burger half-built, a patty sizzling, timer running.
 * serve: a finished plate, order matched, serve button glowing, ready to hand over.
 * end: the shift just ended, with the score card up.
 */
export function stageShot(name, world) {
  world.reset();
  if (name === 'assembly') {
    scriptedCook(world, 26, [
      { at: 1, click: pantryClick(1) },
      { at: 2, click: pantryClick(0) },
      { at: 9, click: grillClick(0) },
      { at: 10, click: pantryClick(3) },
      { at: 11, click: pantryClick(1) },
    ]);
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'serve') {
    // Build exactly what the first order asks for, so the plate is complete and
    // the serve button glows: patty to the grill first, the rest to the plate,
    // then the grilled patty on top.
    const needs = [...world.state.orders[0].needs];
    const script = [];
    let t = 1;
    for (const need of needs) {
      const index = INGREDIENTS.findIndex((item) => item.id === need);
      if (need === 'patty') {
        script.push({ at: t, click: pantryClick(index) });
        script.push({ at: t + 8, click: grillClick(0) });
        t += 1;
      } else {
        script.push({ at: t, click: pantryClick(index) });
        t += 1;
      }
    }
    scriptedCook(world, 40, script);
    return { screen: SCREEN_PLAY, best: 42 };
  }
  if (name === 'end') {
    const state = world.state;
    state.timeLeft = 0;
    state.score = 128;
    state.served = 9;
    state.failed = 2;
    state.streak = 4;
    state.plate = ['bun', 'patty', 'cheese'];
    return { screen: SCREEN_OVER, best: 128 };
  }
  // cover (default): a busy kitchen behind the title card.
  scriptedCook(world, 12, [
    { at: 1, click: pantryClick(1) },
    { at: 2, click: pantryClick(0) },
    { at: 3, click: pantryClick(3) },
  ]);
  return { screen: SCREEN_TITLE, best: 96 };
}
