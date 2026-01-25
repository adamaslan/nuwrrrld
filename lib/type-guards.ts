import * as THREE from 'three';

/**
 * Type guard to check if material is MeshBasicMaterial.
 *
 * Use this before accessing MeshBasicMaterial-specific properties
 * like `map`, `color`, or `opacity`.
 *
 * @param material - The material to check
 * @returns True if material is MeshBasicMaterial
 *
 * @example
 * ```typescript
 * const material = mesh.material;
 * if (isMeshBasicMaterial(material)) {
 *   material.opacity = 0.5; // TypeScript knows this is safe
 * }
 * ```
 */
export function isMeshBasicMaterial(
  material: THREE.Material | THREE.Material[]
): material is THREE.MeshBasicMaterial {
  if (Array.isArray(material)) return false;
  return material instanceof THREE.MeshBasicMaterial;
}

/**
 * Type guard to check if material is MeshStandardMaterial.
 *
 * Use this before accessing MeshStandardMaterial-specific properties
 * like `metalness`, `roughness`, or `emissive`.
 *
 * @param material - The material to check
 * @returns True if material is MeshStandardMaterial
 *
 * @example
 * ```typescript
 * if (isMeshStandardMaterial(material)) {
 *   material.metalness = 0.8;
 *   material.roughness = 0.2;
 * }
 * ```
 */
export function isMeshStandardMaterial(
  material: THREE.Material | THREE.Material[]
): material is THREE.MeshStandardMaterial {
  if (Array.isArray(material)) return false;
  return material instanceof THREE.MeshStandardMaterial;
}

/**
 * Type guard to check if material is PointsMaterial.
 *
 * @param material - The material to check
 * @returns True if material is PointsMaterial
 */
export function isPointsMaterial(
  material: THREE.Material | THREE.Material[]
): material is THREE.PointsMaterial {
  if (Array.isArray(material)) return false;
  return material instanceof THREE.PointsMaterial;
}

/**
 * Type guard to check if geometry is BufferGeometry.
 *
 * @param geometry - The geometry to check
 * @returns True if geometry is BufferGeometry
 */
export function isBufferGeometry(
  geometry: unknown
): geometry is THREE.BufferGeometry {
  return geometry instanceof THREE.BufferGeometry;
}

/**
 * Safely gets material as MeshBasicMaterial with type checking.
 *
 * Returns null if material is not MeshBasicMaterial, avoiding
 * unsafe type casting.
 *
 * @param mesh - The mesh containing the material
 * @returns MeshBasicMaterial if valid, null otherwise
 *
 * @example
 * ```typescript
 * // Before (unsafe)
 * const mat = mesh.material as THREE.MeshBasicMaterial;
 * mat.opacity = 0.5; // Runtime error if wrong type!
 *
 * // After (safe)
 * const mat = getMeshBasicMaterial(mesh);
 * if (mat) {
 *   mat.opacity = 0.5; // TypeScript-safe
 * }
 * ```
 */
export function getMeshBasicMaterial(
  mesh: THREE.Mesh
): THREE.MeshBasicMaterial | null {
  if (isMeshBasicMaterial(mesh.material)) {
    return mesh.material;
  }
  return null;
}

/**
 * Safely gets material as MeshStandardMaterial with type checking.
 *
 * @param mesh - The mesh containing the material
 * @returns MeshStandardMaterial if valid, null otherwise
 */
export function getMeshStandardMaterial(
  mesh: THREE.Mesh
): THREE.MeshStandardMaterial | null {
  if (isMeshStandardMaterial(mesh.material)) {
    return mesh.material;
  }
  return null;
}

/**
 * Type guard for checking if object is a Mesh.
 *
 * @param object - The Three.js object to check
 * @returns True if object is a Mesh
 */
export function isMesh(object: THREE.Object3D): object is THREE.Mesh {
  return object instanceof THREE.Mesh;
}

/**
 * Type guard for checking if object is a Group.
 *
 * @param object - The Three.js object to check
 * @returns True if object is a Group
 */
export function isGroup(object: THREE.Object3D): object is THREE.Group {
  return object instanceof THREE.Group;
}

/**
 * Type guard for checking if object is a PointLight.
 *
 * @param object - The Three.js object to check
 * @returns True if object is a PointLight
 */
export function isPointLight(
  object: THREE.Object3D
): object is THREE.PointLight {
  return object instanceof THREE.PointLight;
}

/**
 * Safely updates material opacity with type checking.
 *
 * Works with both MeshBasicMaterial and MeshStandardMaterial.
 *
 * @param mesh - The mesh to update
 * @param opacity - New opacity value (0-1)
 * @returns True if opacity was updated, false if material doesn't support it
 *
 * @example
 * ```typescript
 * // Before
 * (mesh.material as THREE.MeshBasicMaterial).opacity = 0.5;
 *
 * // After
 * if (!setMaterialOpacity(mesh, 0.5)) {
 *   console.warn('Material does not support opacity');
 * }
 * ```
 */
export function setMaterialOpacity(
  mesh: THREE.Mesh,
  opacity: number
): boolean {
  const mat = mesh.material;

  if (isMeshBasicMaterial(mat) || isMeshStandardMaterial(mat)) {
    mat.opacity = opacity;
    mat.transparent = opacity < 1.0;
    return true;
  }

  return false;
}

/**
 * Safely updates emissive intensity with type checking.
 *
 * Only works with MeshStandardMaterial.
 *
 * @param mesh - The mesh to update
 * @param intensity - New emissive intensity
 * @returns True if intensity was updated, false otherwise
 */
export function setEmissiveIntensity(
  mesh: THREE.Mesh,
  intensity: number
): boolean {
  const mat = getMeshStandardMaterial(mesh);

  if (mat) {
    mat.emissiveIntensity = intensity;
    return true;
  }

  return false;
}

/**
 * Safely gets the material opacity from a mesh.
 *
 * @param mesh - The mesh to read from
 * @returns The opacity value, or null if not accessible
 */
export function getMaterialOpacity(mesh: THREE.Mesh): number | null {
  const mat = mesh.material;

  if (isMeshBasicMaterial(mat) || isMeshStandardMaterial(mat)) {
    return mat.opacity;
  }

  return null;
}

/**
 * Safely sets material color with type checking.
 *
 * Works with both MeshBasicMaterial and MeshStandardMaterial.
 *
 * @param mesh - The mesh to update
 * @param color - New color (hex string or THREE.Color)
 * @returns True if color was updated, false otherwise
 */
export function setMaterialColor(
  mesh: THREE.Mesh,
  color: THREE.ColorRepresentation
): boolean {
  const mat = mesh.material;

  if (isMeshBasicMaterial(mat) || isMeshStandardMaterial(mat)) {
    mat.color.set(color);
    return true;
  }

  return false;
}
