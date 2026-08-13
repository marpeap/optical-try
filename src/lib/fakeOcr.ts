import type { Ordonnance } from "./wizardState";

function randomInRange(min: number, max: number, decimals = 2): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

function randomOeil() {
  return {
    sph: randomInRange(-4, 4),
    cyl: randomInRange(-2, 0),
    axe: Math.round(randomInRange(0, 180, 0)),
    add: randomInRange(0, 3),
  };
}

export function simulateOcr(): Promise<Ordonnance> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        od: randomOeil(),
        og: randomOeil(),
        verifie: false,
      });
    }, 1200);
  });
}
