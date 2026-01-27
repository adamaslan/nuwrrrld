/**
 * Geometry Merging Utility for NUWRRRLD
 *
 * Merges static (non-animated) BufferGeometries to reduce mesh count and draw calls.
 * Used to optimize ship hulls, building structures, and TV screen back panels.
 *
 * Target: Reduce ~750 meshes to ~510 meshes (32% reduction)
 */

import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Entry for a single geometry to be merged
 */
export interface MergeEntry {
  /** The geometry to merge (must be a BufferGeometry) */
  geometry: THREE.BufferGeometry;
  /** World position [x, y, z] */
  position: [number, number, number];
  /** Scale [x, y, z] */
  scale: [number, number, number];
  /** Optional rotation [x, y, z] in radians */
  rotation?: [number, number, number];
  /** Optional quaternion (overrides rotation if provided) */
  quaternion?: THREE.Quaternion;
}

/**
 * Entry with material information for grouping
 */
export interface MaterialMergeEntry extends MergeEntry {
  /** Material index or identifier for grouping */
  material: THREE.Material;
}

/**
 * Clone and transform a geometry without modifying the original
 */
function cloneAndTransform(entry: MergeEntry): THREE.BufferGeometry {
  const cloned = entry.geometry.clone();

  // Create transformation matrix
  const matrix = new THREE.Matrix4();

  // Apply transformations in order: scale -> rotation -> translation
  const scaleMatrix = new THREE.Matrix4().makeScale(
    entry.scale[0],
    entry.scale[1],
    entry.scale[2]
  );

  let rotationMatrix = new THREE.Matrix4();
  if (entry.quaternion) {
    rotationMatrix.makeRotationFromQuaternion(entry.quaternion);
  } else if (entry.rotation) {
    const euler = new THREE.Euler(
      entry.rotation[0],
      entry.rotation[1],
      entry.rotation[2]
    );
    rotationMatrix.makeRotationFromEuler(euler);
  }

  const translationMatrix = new THREE.Matrix4().makeTranslation(
    entry.position[0],
    entry.position[1],
    entry.position[2]
  );

  // Combine: T * R * S
  matrix.multiply(translationMatrix).multiply(rotationMatrix).multiply(scaleMatrix);

  // Apply transformation to geometry
  cloned.applyMatrix4(matrix);

  return cloned;
}

/**
 * Merge geometries that share the same material
 * Returns a single mesh with merged geometry
 *
 * @param entries - Array of geometry entries to merge
 * @param material - Material to apply to the merged mesh
 * @returns A single Three.js Mesh with merged geometry
 */
export function createMergedMeshByMaterial(
  entries: MergeEntry[],
  material: THREE.Material
): THREE.Mesh {
  if (entries.length === 0) {
    throw new Error('Cannot merge empty array of geometries');
  }

  if (entries.length === 1) {
    // Single entry - no need to merge, just create a mesh
    const mesh = new THREE.Mesh(entries[0].geometry, material);
    mesh.position.set(...entries[0].position);
    mesh.scale.set(...entries[0].scale);
    if (entries[0].rotation) {
      mesh.rotation.set(...entries[0].rotation);
    }
    if (entries[0].quaternion) {
      mesh.quaternion.copy(entries[0].quaternion);
    }
    return mesh;
  }

  // Clone and transform all geometries
  const transformedGeometries = entries.map(cloneAndTransform);

  // Merge all geometries into one
  const mergedGeometry = BufferGeometryUtils.mergeGeometries(
    transformedGeometries,
    false // useGroups = false (single material)
  );

  if (!mergedGeometry) {
    throw new Error('Failed to merge geometries');
  }

  // Create mesh with merged geometry
  const mesh = new THREE.Mesh(mergedGeometry, material);

  // Clean up cloned geometries (merged geometry is a new instance)
  transformedGeometries.forEach(g => g.dispose());

  return mesh;
}

/**
 * Merge geometries grouped by material
 * Returns a THREE.Group containing one mesh per unique material
 *
 * @param entries - Array of geometry entries with materials
 * @returns A THREE.Group containing merged meshes
 */
export function createMergedGroup(
  entries: MaterialMergeEntry[]
): THREE.Group {
  const group = new THREE.Group();

  if (entries.length === 0) {
    return group;
  }

  // Group entries by material
  const materialGroups = new Map<THREE.Material, MergeEntry[]>();

  for (const entry of entries) {
    if (!materialGroups.has(entry.material)) {
      materialGroups.set(entry.material, []);
    }
    materialGroups.get(entry.material)!.push(entry);
  }

  // Create merged mesh for each material group
  for (const [material, groupEntries] of materialGroups.entries()) {
    const mergedMesh = createMergedMeshByMaterial(groupEntries, material);
    group.add(mergedMesh);
  }

  return group;
}

/**
 * Helper to create a MergeEntry from pool geometry with transform
 */
export function createMergeEntry(
  geometry: THREE.BufferGeometry,
  position: [number, number, number],
  scale: [number, number, number],
  rotation?: [number, number, number]
): MergeEntry {
  return {
    geometry,
    position,
    scale,
    rotation,
  };
}

/**
 * Helper to create a MaterialMergeEntry
 */
export function createMaterialMergeEntry(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number],
  scale: [number, number, number],
  rotation?: [number, number, number]
): MaterialMergeEntry {
  return {
    geometry,
    material,
    position,
    scale,
    rotation,
  };
}

/**
 * Dispose of a merged mesh and its geometry
 * (Materials are not disposed as they are typically pooled/shared)
 */
export function disposeMergedMesh(mesh: THREE.Mesh): void {
  if (mesh.geometry) {
    mesh.geometry.dispose();
  }
  // Note: Material is NOT disposed - assumed to be shared/pooled
}

/**
 * Dispose of a merged group and all its child meshes
 */
export function disposeMergedGroup(group: THREE.Group): void {
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      disposeMergedMesh(object);
    }
  });
  group.clear();
}

/**
 * Calculate approximate memory savings from merging
 * (Rough estimate based on typical THREE.Mesh overhead)
 */
export function estimateMergeSavings(
  originalMeshCount: number,
  mergedMeshCount: number
): {
  meshesEliminated: number;
  percentReduction: number;
  estimatedBytesSaved: number;
} {
  const meshesEliminated = originalMeshCount - mergedMeshCount;
  const percentReduction = (meshesEliminated / originalMeshCount) * 100;

  // Rough estimate: each THREE.Mesh = ~2KB overhead (matrix, bounding sphere, scene graph node)
  const BYTES_PER_MESH = 2048;
  const estimatedBytesSaved = meshesEliminated * BYTES_PER_MESH;

  return {
    meshesEliminated,
    percentReduction,
    estimatedBytesSaved,
  };
}

/**
 * Example usage:
 *
 * ```typescript
 * import { usePools } from '@/components/three/pools/PoolContext';
 * import { createMergedMeshByMaterial, createMergeEntry } from '@/lib/mergeStaticGeometry';
 *
 * const { geometries, materials } = usePools();
 *
 * // Define static hull elements
 * const hullEntries = [
 *   createMergeEntry(geometries.box, [0, 0, 0], [2, 0.5, 1]),
 *   createMergeEntry(geometries.box, [0, 0.5, 0], [0.5, 0.3, 0.8]),
 *   createMergeEntry(geometries.box, [0, -0.5, 0.5], [1.5, 0.2, 0.3]),
 * ];
 *
 * // Merge into single mesh
 * const mergedHull = useMemo(() =>
 *   createMergedMeshByMaterial(hullEntries, materials.shipHullDark),
 *   [geometries, materials]
 * );
 *
 * return <primitive object={mergedHull} />;
 * ```
 */
