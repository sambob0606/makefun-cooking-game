// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s
// steps, and the renderer paints what is there. Four screens: title, play, paused, over.
//
// ?seed=N fixes the order pattern. ?shot=cover|assembly|serve|end (with &seed=N) stages
// that scene instead of running the loop, paints it twice and sets window.__shotReady.
import { BEST_KEY, LAYOUT, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_BURNT, EVENT_FAILED, EVENT_NEW_ORDER, EVENT_OVER, EVENT_SERVED } from './world.js';
import { ACTION_CONFIRM, ACTION_PAUSE, ACTION_SERVE, ACTION_TRASH, createInput } from './input.js';
import { createAudio } from './audio.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const slots = world.slots;
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, slots);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let lastTickSecond = -1;

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    audio.unlock();
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Serve orders before their patience runs out.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(`Shift over. Score ${world.state.score}. Best ${best}.`);
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) startGame();
    else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    } else if (actions & ACTION_SERVE && screen === SCREEN_PLAY) {
      const before = world.state.served;
      const serve = LAYOUT.serve;
      world.step(0, { x: serve.x + serve.w / 2, y: serve.y + serve.h / 2 }, [], false);
      if (world.state.served > before) audio.serve();
    }
  }

  function step() {
    if (screen === SCREEN_TITLE) {
      world.step(STEP, null, [], true);
      return;
    }
    const click = input.takeClick();
    const keys = input.takeKeys();
    if (keys.includes('m')) {
      const muted = audio.toggleMute();
      announce(muted ? 'Muted.' : 'Sound on.');
    }
    const events = world.step(STEP, click, keys, false);
    if (events & EVENT_SERVED) {
      audio.serve();
      announce(world.state.message);
    }
    if (events & EVENT_FAILED) {
      audio.bad();
      announce(world.state.message);
    }
    if (events & EVENT_BURNT) audio.bad();
    if (events & EVENT_NEW_ORDER) audio.ding();
    if (events & EVENT_OVER) endGame();
    const whole = Math.ceil(world.state.timeLeft);
    if (whole !== lastTickSecond && whole <= 10 && whole > 0) {
      lastTickSecond = whole;
      audio.tick();
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, slots);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Sizzle and Serve. Press Space or click to start your shift.');
  world.reset();
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
