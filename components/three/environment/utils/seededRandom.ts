/**
 * Deterministic pseudo-random number generator.
 *
 * Uses seeded randomization to ensure consistent results across renders.
 * Same seed + index always produces the same "random" value.
 *
 * @param seed - Base seed for randomization
 * @param index - Index for this specific random value
 * @returns Pseudo-random number between 0 and 1
 *
 * @example
 * ```typescript
 * const seed = 42;
 * const x = seededRandom(seed, 0); // Always returns same value
 * const y = seededRandom(seed, 1); // Different but consistent value
 * ```
 */
export function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index * 9999) * 10000;
  return x - Math.floor(x);
}

/**
 * Generates random position within bounds using seeded random.
 *
 * @param seed - Base seed
 * @param index - Position index
 * @param xRange - [min, max] X bounds
 * @param yRange - [min, max] Y bounds
 * @param zRange - [min, max] Z bounds
 * @returns Position tuple [x, y, z]
 */
export function seededPosition(
  seed: number,
  index: number,
  xRange: [number, number],
  yRange: [number, number],
  zRange: [number, number]
): [number, number, number] {
  const x = xRange[0] + seededRandom(seed, index) * (xRange[1] - xRange[0]);
  const y = yRange[0] + seededRandom(seed, index + 1000) * (yRange[1] - yRange[0]);
  const z = zRange[0] + seededRandom(seed, index + 2000) * (zRange[1] - zRange[0]);

  return [x, y, z];
}
