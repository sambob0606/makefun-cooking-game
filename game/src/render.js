// Everything the eye sees: the kitchen, the board, the grill, the plate, the pantry.
// One file, one job: paint a world state onto the canvas, nothing else.
import { INGREDIENTS, LAYOUT, MENU, VIEW } from './config.js';
import { dishById, ingredientById, missingFor } from './recipes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'left', weight = '700') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

/** A little vector picture of one ingredient, centred at (x, y) with radius r. */
export function drawIngredient(ctx, id, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  if (id === 'bun') {
    ctx.fillStyle = '#e8a94e';
    ctx.beginPath();
    ctx.arc(0, 2, r, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c98a2e';
    ctx.fillRect(-r, 2, r * 2, r * 0.28);
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.arc(-r * 0.4, -r * 0.35, r * 0.12, 0, Math.PI * 2);
    ctx.arc(r * 0.3, -r * 0.5, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'patty') {
    ctx.fillStyle = '#8a5a2b';
    roundRect(ctx, -r, -r * 0.45, r * 2, r * 0.9, r * 0.4);
    ctx.fill();
    ctx.fillStyle = '#6d4420';
    ctx.fillRect(-r * 0.7, -r * 0.1, r * 1.4, r * 0.18);
  } else if (id === 'cheese') {
    ctx.fillStyle = '#ffc93c';
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.7);
    ctx.lineTo(r, r * 0.7);
    ctx.lineTo(r, -r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e8a91c';
    ctx.beginPath();
    ctx.arc(0, r * 0.2, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'lettuce') {
    ctx.fillStyle = '#58b368';
    ctx.beginPath();
    for (let i = 0; i <= 6; i += 1) {
      const px = -r + (i * 2 * r) / 6;
      const py = i % 2 === 0 ? -r * 0.4 : r * 0.4;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.lineTo(r, r * 0.6);
    ctx.lineTo(-r, r * 0.6);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'tomato') {
    ctx.fillStyle = '#e4572e';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#58b368';
    ctx.beginPath();
    ctx.arc(0, -r * 0.7, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2826a';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.3, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'fries') {
    ctx.fillStyle = '#d23b2e';
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, r * 0.8);
    ctx.lineTo(r * 0.8, r * 0.8);
    ctx.lineTo(r * 0.6, -r * 0.1);
    ctx.lineTo(-r * 0.6, -r * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f4c95d';
    for (let i = -1; i <= 1; i += 1) ctx.fillRect(i * r * 0.5 - r * 0.14, -r, r * 0.28, r * 1.1);
  } else if (id === 'soda') {
    ctx.fillStyle = '#c65d7b';
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, -r * 0.5);
    ctx.lineTo(r * 0.6, -r * 0.5);
    ctx.lineTo(r * 0.45, r * 0.9);
    ctx.lineTo(-r * 0.45, r * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f2e6d8';
    ctx.fillRect(-r * 0.6, -r * 0.75, r * 1.2, r * 0.3);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(r * 0.2, -r * 0.7);
    ctx.lineTo(r * 0.45, -r * 1.3);
    ctx.stroke();
  }
  ctx.restore();
}

function drawKitchen(ctx) {
  // Warm wall, tile backsplash, a window with a sunny street, hanging pans.
  ctx.fillStyle = '#f7e8c9';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#a8d8c8';
  ctx.fillRect(0, 0, VIEW.width, 330);
  ctx.fillStyle = '#8ec9b6';
  for (let x = 0; x < VIEW.width; x += 64) ctx.fillRect(x, 300, 2, 30);
  ctx.fillStyle = '#fdf6e3';
  ctx.fillRect(880, 330, 400, 210);
  // Window.
  ctx.fillStyle = '#7ec8e3';
  roundRect(ctx, 500, 330, 260, 110, 12);
  ctx.fill();
  ctx.fillStyle = '#ffd93d';
  ctx.beginPath();
  ctx.arc(700, 370, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8ec9b6';
  ctx.fillRect(500, 410, 260, 30);
  ctx.strokeStyle = '#5b4a3a';
  ctx.lineWidth = 5;
  ctx.strokeRect(500, 330, 260, 110);
  ctx.beginPath();
  ctx.moveTo(630, 330);
  ctx.lineTo(630, 440);
  ctx.stroke();
  // Shelf with jars.
  ctx.fillStyle = '#8a6a45';
  ctx.fillRect(40, 330, 380, 12);
  const jarColors = ['#e4572e', '#58b368', '#ffc93c', '#c65d7b'];
  jarColors.forEach((color, i) => {
    ctx.fillStyle = color;
    roundRect(ctx, 60 + i * 90, 280, 54, 50, 8);
    ctx.fill();
    ctx.fillStyle = '#fff8e6';
    ctx.fillRect(60 + i * 90, 280, 54, 12);
  });
  // Floor.
  ctx.fillStyle = '#c9a06a';
  ctx.fillRect(0, 540, VIEW.width, 260);
  ctx.fillStyle = '#b58a55';
  for (let x = 0; x < VIEW.width; x += 120) ctx.fillRect(x, 540, 4, 260);
}

function drawBoard(ctx, state) {
  const b = LAYOUT.board;
  ctx.fillStyle = '#3d2c1e';
  roundRect(ctx, b.x, b.y, b.w, b.h, 14);
  ctx.fill();
  ctx.fillStyle = '#fff8e6';
  roundRect(ctx, b.x + 8, b.y + 8, b.w - 16, b.h - 16, 10);
  ctx.fill();
  text(ctx, 'ORDER BOARD', b.x + 20, b.y + 34, 20, '#3d2c1e');
  text(ctx, `Served ${state.served}  ·  Walked out ${state.failed}`, b.x + b.w - 20, b.y + 34, 14, '#8a6a45', 'right');
  if (state.orders.length === 0) {
    text(ctx, 'No orders yet — the lunch rush is coming…', b.x + 20, b.y + 90, 16, '#8a6a45');
  }
  state.orders.forEach((order, i) => {
    const y = b.y + 56 + i * 46;
    const dish = dishById(order.dishId);
    ctx.fillStyle = i === 0 ? '#fff3d6' : '#fdf6e3';
    roundRect(ctx, b.x + 14, y, b.w - 28, 40, 8);
    ctx.fill();
    text(ctx, `#${order.ticket} ${dish.name}`, b.x + 26, y + 25, 16, '#3d2c1e');
    order.needs.forEach((need, j) => drawIngredient(ctx, need, b.x + 235 + j * 20, y + 20, 9));
    // Patience bar.
    const frac = Math.max(0, order.patience / order.maxPatience);
    ctx.fillStyle = '#e0cba8';
    roundRect(ctx, b.x + 330, y + 12, 70, 14, 7);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? '#58b368' : frac > 0.25 ? '#ffc93c' : '#e4572e';
    roundRect(ctx, b.x + 330, y + 12, 70 * frac, 14, 7);
    ctx.fill();
  });
}

function drawGrill(ctx, state, slots) {
  const g = LAYOUT.grill;
  ctx.fillStyle = '#4a4a52';
  roundRect(ctx, g.x, g.y, g.w, g.h, 14);
  ctx.fill();
  ctx.fillStyle = '#2e2e33';
  roundRect(ctx, g.x + 10, g.y + 10, g.w - 20, g.h - 20, 10);
  ctx.fill();
  text(ctx, 'GRILL — click Patty to cook', g.x + 20, g.y + 34, 17, '#ffd93d');
  state.grill.forEach((slot, i) => {
    const s = slots.grillSlot(i);
    ctx.fillStyle = '#1c1c20';
    roundRect(ctx, s.x, s.y, s.w, s.h, 10);
    ctx.fill();
    ctx.strokeStyle = '#55555e';
    ctx.lineWidth = 2;
    for (let line = 1; line <= 3; line += 1) {
      ctx.beginPath();
      ctx.moveTo(s.x + 8, s.y + (line * s.h) / 4);
      ctx.lineTo(s.x + s.w - 8, s.y + (line * s.h) / 4);
      ctx.stroke();
    }
    if (slot.state === 'cooking' || slot.state === 'ready') {
      const cx = s.x + s.w / 2;
      const cy = s.y + s.h / 2 - 6;
      drawIngredient(ctx, 'patty', cx, cy, 30);
      if (slot.state === 'cooking') {
        // Steam wisps and a cook ring.
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy - 26);
        ctx.quadraticCurveTo(cx - 18, cy - 38, cx - 10, cy - 48);
        ctx.moveTo(cx + 10, cy - 26);
        ctx.quadraticCurveTo(cx + 16, cy - 38, cx + 8, cy - 48);
        ctx.stroke();
      }
      const frac = slot.state === 'cooking'
        ? slot.t / 6
        : 1 - slot.t / 14;
      ctx.fillStyle = '#e0cba8';
      roundRect(ctx, s.x + 10, s.y + s.h - 16, s.w - 20, 8, 4);
      ctx.fill();
      ctx.fillStyle = slot.state === 'cooking' ? '#ffc93c' : '#58b368';
      roundRect(ctx, s.x + 10, s.y + s.h - 16, (s.w - 20) * Math.max(0, Math.min(1, frac)), 8, 4);
      ctx.fill();
      text(ctx, slot.state === 'cooking' ? 'cooking…' : 'READY!', cx, s.y + s.h - 24, 12, slot.state === 'cooking' ? '#ffd93d' : '#7ee2a0', 'center');
    } else if (slot.state === 'burnt') {
      drawIngredient(ctx, 'patty', s.x + s.w / 2, s.y + s.h / 2 - 6, 30);
      ctx.fillStyle = 'rgba(20,20,20,0.55)';
      roundRect(ctx, s.x, s.y, s.w, s.h, 10);
      ctx.fill();
      text(ctx, 'BURNT — click to toss', s.x + s.w / 2, s.y + s.h - 22, 11, '#ff9a8a', 'center');
    } else {
      text(ctx, 'empty', s.x + s.w / 2, s.y + s.h / 2, 13, '#77777f', 'center');
    }
  });
}

function drawPlate(ctx, state) {
  const p = LAYOUT.plate;
  ctx.fillStyle = '#fff8e6';
  roundRect(ctx, p.x, p.y, p.w, p.h, 14);
  ctx.fill();
  ctx.strokeStyle = '#d8c49a';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'YOUR PLATE', p.x + 20, p.y + 34, 20, '#3d2c1e');
  // The plate itself: a white ellipse with the stacked dish on it.
  const cx = p.x + 130;
  const cy = p.y + 118;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 92, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8c49a';
  ctx.lineWidth = 2;
  ctx.stroke();
  state.plate.forEach((item, i) => {
    drawIngredient(ctx, item, cx, cy - 8 - i * 13, 26);
  });
  if (state.plate.length === 0) text(ctx, 'empty — add ingredients', cx, cy + 6, 13, '#a08a68', 'center');
  // What the plate still needs for the first order it could finish, on the
  // panel's bottom row where it cannot run off the edge.
  const first = state.orders[0] ? dishById(state.orders[0].dishId) : null;
  if (first) {
    const missing = missingFor(first, state.plate);
    text(ctx, `For #${state.orders[0].ticket} ${first.name}:`, p.x + 20, p.y + 172, 13, '#8a6a45');
    if (missing.length === 0) {
      text(ctx, 'Complete! Serve it!', p.x + p.w - 16, p.y + 172, 15, '#2e7d32', 'right');
    } else {
      missing.forEach((need, i) => {
        const ing = ingredientById(need);
        drawIngredient(ctx, need, p.x + 252 + i * 28, p.y + 164, 10);
        text(ctx, ing.name, p.x + 252 + i * 28, p.y + 186, 9, '#8a6a45', 'center');
      });
    }
  }
  // Serve button.
  const s = LAYOUT.serve;
  const canServe = state.plate.length > 0 && state.orders.some((o) => {
    const d = dishById(o.dishId);
    return [...d.needs].sort().join(',') === [...state.plate].sort().join(',');
  });
  ctx.fillStyle = canServe ? '#2e7d32' : '#9aa08a';
  roundRect(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fill();
  text(ctx, 'SERVE  ⏎', s.x + s.w / 2, s.y + 40, 22, '#ffffff', 'center');
  // Trash button.
  const t = LAYOUT.trash;
  ctx.fillStyle = '#b0a08a';
  roundRect(ctx, t.x, t.y, t.w, t.h, 12);
  ctx.fill();
  text(ctx, '🗑 CLEAR PLATE', t.x + t.w / 2, t.y + 40, 16, '#ffffff', 'center');
}

function drawCounter(ctx, state, slots) {
  const c = LAYOUT.counter;
  ctx.fillStyle = '#8a6a45';
  roundRect(ctx, c.x, c.y, c.w, c.h, 14);
  ctx.fill();
  ctx.fillStyle = '#a87c4e';
  roundRect(ctx, c.x + 8, c.y + 8, c.w - 16, c.h - 16, 10);
  ctx.fill();
  text(ctx, 'PANTRY — click (or press 1–7) to add · Patty goes to the grill', c.x + 20, c.y + 34, 17, '#fff3d6');
  INGREDIENTS.forEach((item, i) => {
    const s = slots.counterSlot(i);
    ctx.fillStyle = '#fff8e6';
    roundRect(ctx, s.x, s.y, s.w, s.h, 10);
    ctx.fill();
    drawIngredient(ctx, item.id, s.x + s.w / 2, s.y + 32, 24);
    text(ctx, item.name, s.x + s.w / 2, s.y + 66, 14, '#3d2c1e', 'center');
    text(ctx, `[${item.key}]`, s.x + s.w / 2, s.y + 82, 11, '#a08a68', 'center');
  });
}

function drawHud(ctx, state) {
  const h = LAYOUT.hud;
  const minutes = Math.floor(state.timeLeft / 60);
  const seconds = Math.floor(state.timeLeft % 60);
  const urgent = state.timeLeft <= 30;
  ctx.fillStyle = '#3d2c1e';
  roundRect(ctx, h.x, h.y, h.w, h.h, 12);
  ctx.fill();
  text(ctx, '⏱ SHIFT', h.x + 20, h.y + 36, 18, '#ffd93d');
  text(ctx, `${minutes}:${String(seconds).padStart(2, '0')}`, h.x + 110, h.y + 36, 24, urgent ? '#ff6b5e' : '#ffffff');
  text(ctx, `SCORE $${state.score}`, h.x + 320, h.y + 36, 22, '#ffffff');
  text(ctx, `🔥 STREAK x${state.streak}`, h.x + 560, h.y + 36, 18, '#ffb347');
  if (state.comboLeft > 0) text(ctx, `COMBO ${Math.ceil(state.comboLeft)}s +$2`, h.x + 760, h.y + 36, 18, '#7ee2a0');
  if (state.messageT > 0) text(ctx, state.message, h.x + h.w - 20, h.y + 36, 18, '#ffd93d', 'right');
  else text(ctx, 'P pause · M mute · S serve', h.x + h.w - 20, h.y + 36, 14, '#cbb894', 'right');
}

function drawTitle(ctx, best) {
  ctx.fillStyle = 'rgba(30,20,10,0.45)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fff8e6';
  roundRect(ctx, 290, 180, 700, 380, 20);
  ctx.fill();
  ctx.strokeStyle = '#e8a94e';
  ctx.lineWidth = 4;
  ctx.stroke();
  text(ctx, '🍳 SIZZLE & SERVE', 640, 260, 52, '#e4572e', 'center');
  text(ctx, 'A tiny lunch-rush cooking game', 640, 305, 20, '#8a6a45', 'center');
  text(ctx, 'Orders land on the board — build each dish on your plate,', 640, 355, 17, '#3d2c1e', 'center');
  text(ctx, 'grill every patty first, and serve before patience runs out.', 640, 382, 17, '#3d2c1e', 'center');
  text(ctx, 'Click the pantry or press 1–7 · S to serve · P to pause', 640, 425, 16, '#8a6a45', 'center');
  ctx.fillStyle = '#2e7d32';
  roundRect(ctx, 490, 450, 300, 56, 14);
  ctx.fill();
  text(ctx, 'START SHIFT — click / Space', 640, 486, 19, '#ffffff', 'center');
  if (best > 0) text(ctx, `Best shift so far: $${best}`, 640, 535, 16, '#2e7d32', 'center');
}

function drawOver(ctx, state, best) {
  ctx.fillStyle = 'rgba(30,20,10,0.5)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fff8e6';
  roundRect(ctx, 340, 190, 600, 380, 20);
  ctx.fill();
  ctx.strokeStyle = '#e8a94e';
  ctx.lineWidth = 4;
  ctx.stroke();
  text(ctx, 'SHIFT OVER!', 640, 270, 46, '#e4572e', 'center');
  text(ctx, `You earned $${state.score}`, 640, 330, 28, '#3d2c1e', 'center');
  text(ctx, `Served ${state.served} dishes · ${state.failed} orders walked out`, 640, 375, 18, '#8a6a45', 'center');
  const rank = state.score >= 150 ? 'Head Chef! 👑' : state.score >= 100 ? 'Sous Chef — the kitchen loves you' : state.score >= 50 ? 'Line Cook — solid shift' : 'Commis — keep practising!';
  text(ctx, rank, 640, 415, 20, '#2e7d32', 'center');
  if (state.score >= best && state.score > 0) text(ctx, 'New best shift! 🎉', 640, 450, 18, '#e4572e', 'center');
  ctx.fillStyle = '#2e7d32';
  roundRect(ctx, 490, 480, 300, 56, 14);
  ctx.fill();
  text(ctx, 'PLAY AGAIN — click / Space', 640, 516, 19, '#ffffff', 'center');
}

export function createRenderer(canvas) {
  canvas.width = VIEW.width;
  canvas.height = VIEW.height;
  const ctx = canvas.getContext('2d');

  return {
    draw(state, screen, best, slots) {
      ctx.clearRect(0, 0, VIEW.width, VIEW.height);
      drawKitchen(ctx);
      drawBoard(ctx, state);
      drawGrill(ctx, state, slots);
      drawPlate(ctx, state);
      drawCounter(ctx, state, slots);
      drawHud(ctx, state);
      if (screen === SCREEN_TITLE) drawTitle(ctx, best);
      else if (screen === SCREEN_PAUSED) {
        ctx.fillStyle = 'rgba(30,20,10,0.45)';
        ctx.fillRect(0, 0, VIEW.width, VIEW.height);
        text(ctx, 'PAUSED — press P or click to keep cooking', 640, 400, 30, '#ffffff', 'center');
      } else if (screen === SCREEN_OVER) drawOver(ctx, state, best);
    },
  };
}
