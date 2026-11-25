// The menu book: dish lookup and the plate-matching rule.
// One file, one job: know what a dish needs and whether a plate is it.
import { INGREDIENTS, MENU } from './config.js';

export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id) ?? null;
}

export function dishById(id) {
  return MENU.find((dish) => dish.id === id) ?? null;
}

/** A plate matches a dish when it holds exactly the dish's ingredients, in any order. */
export function dishForPlate(plate) {
  if (plate.length === 0) return null;
  const sorted = [...plate].sort().join(',');
  return MENU.find((dish) => [...dish.needs].sort().join(',') === sorted) ?? null;
}

/** The first order whose dish the plate matches, or null. */
export function matchingOrder(plate, orders) {
  const dish = dishForPlate(plate);
  if (!dish) return null;
  return orders.find((order) => order.dishId === dish.id) ?? null;
}

/** Human list of what a dish still needs given the plate so far. */
export function missingFor(dish, plate) {
  const remaining = [...dish.needs];
  for (const item of plate) {
    const index = remaining.indexOf(item);
    if (index !== -1) remaining.splice(index, 1);
  }
  return remaining;
}
