// Mouse + keyboard input for the kitchen.
// One file, one job: turn raw events into clicks and named actions, nothing else.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_SERVE = 4;
export const ACTION_TRASH = 8;

export function createInput(canvas) {
  let actions = 0;
  let click = null;
  let keys = new Set();
  const queue = [];

  function onKey(event) {
    const key = event.key.toLowerCase();
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) event.preventDefault();
    if (event.repeat) return;
    keys.add(key);
    if (key === ' ' || key === 'enter') actions |= ACTION_CONFIRM;
    if (key === 'p' || key === 'escape') actions |= ACTION_PAUSE;
    if (key === 's') actions |= ACTION_SERVE;
    if (key === 't' || key === 'backspace') actions |= ACTION_TRASH;
    queue.push(key);
  }

  function onClick(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    click = { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY };
  }

  window.addEventListener('keydown', onKey);
  canvas.addEventListener('pointerdown', onClick);

  return {
    // The latest click since the last read (null when none), in canvas pixels.
    takeClick() {
      const c = click;
      click = null;
      return c;
    },
    // Action bits raised since the last read.
    takeActions() {
      const a = actions;
      actions = 0;
      return a;
    },
    // Ingredient keys pressed since the last read ('1'..'7').
    takeKeys() {
      const k = queue.splice(0, queue.length);
      return k;
    },
    isDown(key) {
      return keys.has(key);
    },
  };
}
