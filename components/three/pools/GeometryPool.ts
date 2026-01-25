import * as THREE from 'three';

/**
 * Geometry pool interface providing pre-created unit geometries.
 * All geometries are unit-sized (1x1x1) and should be scaled via mesh.scale.
 *
 * @example
 * ```tsx
 * const { geometries } = usePools();
 * <mesh geometry={geometries.box} scale={[2, 3, 1]} />
 * ```
 */
export interface IGeometryPool {
  /** Unit box geometry (1x1x1) - scale via mesh.scale */
  readonly box: THREE.BoxGeometry;
  /** Unit plane geometry (1x1) - scale via mesh.scale */
  readonly plane: THREE.PlaneGeometry;
  /** Unit circle geometry (radius 1, 32 segments) */
  readonly circle: THREE.CircleGeometry;
  /** Unit cylinder geometry (radius 1, height 1, 8 segments) */
  readonly cylinder: THREE.CylinderGeometry;
  /** Unit sphere geometry (radius 1, 16x16 segments) */
  readonly sphere: THREE.SphereGeometry;
  /** Torus geometry (radius 1, tube 0.06, 8x48 segments) */
  readonly torus: THREE.TorusGeometry;
  /** Octahedron geometry (radius 1) */
  readonly octahedron: THREE.OctahedronGeometry;
  /** Window plane geometry (1 x 1.6 aspect ratio) */
  readonly windowPlane: THREE.PlaneGeometry;
  /** Grid line plane (80 x 0.08) */
  readonly gridLine: THREE.PlaneGeometry;
  /** Light shaft cylinder (3 to 5 radius, 40 height, 6 segments) */
  readonly lightShaft: THREE.CylinderGeometry;
}

/**
 * Creates a new geometry pool with all standard shapes.
 * Geometries are created once and should be disposed via disposeGeometryPool.
 *
 * @returns Immutable pool of unit geometries
 * @see disposeGeometryPool
 *
 * @example
 * ```tsx
 * const geometries = createGeometryPool();
 * // Use in components...
 * // On unmount:
 * disposeGeometryPool(geometries);
 * ```
 */
export function createGeometryPool(): IGeometryPool {
  return {
    box: new THREE.BoxGeometry(1, 1, 1),
    plane: new THREE.PlaneGeometry(1, 1),
    circle: new THREE.CircleGeometry(1, 32),
    cylinder: new THREE.CylinderGeometry(1, 1, 1, 8),
    sphere: new THREE.SphereGeometry(1, 16, 16),
    torus: new THREE.TorusGeometry(1, 0.06, 8, 48),
    octahedron: new THREE.OctahedronGeometry(1, 0),
    windowPlane: new THREE.PlaneGeometry(1, 1.6),
    gridLine: new THREE.PlaneGeometry(80, 0.08),
    lightShaft: new THREE.CylinderGeometry(3, 5, 40, 6),
  };
}

/**
 * Safely disposes all geometries in a pool.
 * Call this on unmount to prevent memory leaks.
 *
 * @param pool - The geometry pool to dispose
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const pool = createGeometryPool();
 *   return () => disposeGeometryPool(pool);
 * }, []);
 * ```
 */
export function disposeGeometryPool(pool: IGeometryPool): void {
  Object.values(pool).forEach((geometry) => {
    if (geometry instanceof THREE.BufferGeometry) {
      geometry.dispose();
    }
  });
}
