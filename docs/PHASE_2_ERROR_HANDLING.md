# PHASE 2: ERROR HANDLING - Infrastructure and Safety

## Phase 2 Overview

**Goal**: Create robust error handling infrastructure with custom error classes, type guards, and error boundaries.

**Duration**: 1-2 days

**Risk Level**: Low-Medium

**Design Principles Applied**:
- Guideline #9: Specific Exception Handling
- Guideline #10: Custom Exception Hierarchy
- Guideline #11: Null/Undefined Safety
- Guideline #27: Type Safety (type guards)

---

## 2.1 Create Custom Error Classes

### File to Create: `lib/errors.ts`

Complete error hierarchy for the application.

```typescript
/**
 * Base error class for all NUWRRRLD application errors.
 *
 * Extends native Error with:
 * - Automatic name setting
 * - Optional error code for categorization
 * - Stack trace capture
 *
 * @example
 * ```typescript
 * throw new AppError('Something went wrong', 'APP_ERROR');
 * ```
 */
export class AppError extends Error {
  /**
   * Creates a new application error.
   *
   * @param message - Human-readable error description
   * @param code - Optional error code for programmatic handling
   */
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = this.constructor.name;

    // Capture stack trace if available (V8 feature)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Thrown when pool context is accessed outside of PoolProvider.
 *
 * This indicates a component hierarchy issue where a component
 * using `usePools()` is not wrapped in `<PoolProvider>`.
 *
 * @example
 * ```typescript
 * // This will throw PoolContextError
 * function MyComponent() {
 *   const pools = usePools(); // No provider above!
 * }
 *
 * // Correct usage
 * <PoolProvider>
 *   <MyComponent />
 * </PoolProvider>
 * ```
 */
export class PoolContextError extends AppError {
  constructor() {
    super(
      'usePools must be used within a PoolProvider. ' +
      'Wrap your component tree with <PoolProvider>.',
      'POOL_CONTEXT_ERROR'
    );
  }
}

/**
 * Thrown when media (texture, video) fails to load.
 *
 * Common causes:
 * - File not found (404)
 * - Network error
 * - Unsupported format
 * - CORS issues
 *
 * @example
 * ```typescript
 * try {
 *   await loadTexture('/media/missing.jpg');
 * } catch (error) {
 *   throw new MediaLoadError('/media/missing.jpg', 'image');
 * }
 * ```
 */
export class MediaLoadError extends AppError {
  /**
   * Creates a media load error.
   *
   * @param mediaPath - Path to the media file that failed
   * @param mediaType - Type of media (image or video)
   */
  constructor(
    public readonly mediaPath: string,
    public readonly mediaType: 'image' | 'video'
  ) {
    super(
      `Failed to load ${mediaType}: ${mediaPath}. ` +
      'Check that the file exists and is accessible.',
      'MEDIA_LOAD_ERROR'
    );
  }
}

/**
 * Thrown when geometry or material lookup fails in pool.
 *
 * This typically indicates a typo or missing pool entry.
 *
 * @example
 * ```typescript
 * const material = materials['nonexistent']; // typo
 * if (!material) {
 *   throw new PoolResourceError('material', 'nonexistent');
 * }
 * ```
 */
export class PoolResourceError extends AppError {
  /**
   * Creates a pool resource error.
   *
   * @param resourceType - Type of resource (geometry or material)
   * @param resourceName - Name of the missing resource
   */
  constructor(
    public readonly resourceType: 'geometry' | 'material',
    public readonly resourceName: string
  ) {
    super(
      `${resourceType} '${resourceName}' not found in pool. ` +
      'Check for typos or ensure the resource is created in the pool.',
      'POOL_RESOURCE_ERROR'
    );
  }
}

/**
 * Thrown when configuration validation fails.
 *
 * Use this for invalid screen configs, ship configs, etc.
 *
 * @example
 * ```typescript
 * if (config.baseSize <= 0) {
 *   throw new ConfigValidationError(
 *     'ScreenConfig',
 *     'baseSize must be positive'
 *   );
 * }
 * ```
 */
export class ConfigValidationError extends AppError {
  /**
   * Creates a configuration validation error.
   *
   * @param configType - Type of configuration (e.g., 'ScreenConfig')
   * @param issue - Description of the validation failure
   */
  constructor(
    public readonly configType: string,
    public readonly issue: string
  ) {
    super(
      `Invalid ${configType} configuration: ${issue}`,
      'CONFIG_VALIDATION_ERROR'
    );
  }
}

/**
 * Thrown when a Three.js object is accessed before initialization.
 *
 * Common in useFrame callbacks when refs haven't been assigned yet.
 *
 * @example
 * ```typescript
 * useFrame(() => {
 *   if (!meshRef.current) {
 *     throw new UninitializedObjectError('mesh', 'meshRef');
 *   }
 *   meshRef.current.rotation.y += 0.01;
 * });
 * ```
 */
export class UninitializedObjectError extends AppError {
  /**
   * Creates an uninitialized object error.
   *
   * @param objectType - Type of object (e.g., 'mesh', 'group')
   * @param refName - Name of the ref variable
   */
  constructor(
    public readonly objectType: string,
    public readonly refName: string
  ) {
    super(
      `${objectType} ref '${refName}' is not initialized. ` +
      'Ensure the ref is assigned before accessing it.',
      'UNINITIALIZED_OBJECT_ERROR'
    );
  }
}

/**
 * Thrown when WebGL context is lost or unavailable.
 *
 * This can happen when:
 * - GPU crashes
 * - Too many WebGL contexts
 * - Browser resource limits
 *
 * @example
 * ```typescript
 * canvas.addEventListener('webglcontextlost', (e) => {
 *   e.preventDefault();
 *   throw new WebGLContextError('Context lost');
 * });
 * ```
 */
export class WebGLContextError extends AppError {
  constructor(message: string) {
    super(
      `WebGL context error: ${message}. ` +
      'Try refreshing the page or closing other tabs.',
      'WEBGL_CONTEXT_ERROR'
    );
  }
}
```

---

## 2.2 Create Type Guards

### File to Create: `lib/type-guards.ts`

Type guards for safe Three.js material and geometry access.

```typescript
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
  geometry: any
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
export function isPointLight(object: THREE.Object3D): object is THREE.PointLight {
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
```

---

## 2.3 Create Error Boundary Component

### File to Create: `components/three/ErrorBoundary.tsx`

React Error Boundary for 3D scene components.

```typescript
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import type { AppError } from '@/lib/errors';

/**
 * Props for SceneErrorBoundary component.
 */
interface ErrorBoundaryProps {
  /** Child components to protect */
  children: ReactNode;
  /** Optional custom fallback UI */
  fallback?: ReactNode | ((error: Error) => ReactNode);
  /** Optional error callback for logging */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show error details in fallback (dev only) */
  showDetails?: boolean;
}

/**
 * State for error boundary.
 */
interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The caught error, if any */
  error: Error | null;
}

/**
 * Error boundary for 3D scene components.
 *
 * Catches errors in child components and displays fallback UI
 * instead of crashing the entire application.
 *
 * Features:
 * - Custom fallback UI
 * - Error logging callback
 * - Default 3D fallback (red wireframe cube)
 * - Development mode error details
 *
 * @example
 * ```tsx
 * <SceneErrorBoundary
 *   fallback={<div>Scene failed to load</div>}
 *   onError={(error) => console.error(error)}
 * >
 *   <Environment />
 *   <TVScreen config={config} />
 * </SceneErrorBoundary>
 * ```
 */
export class SceneErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Static method called when an error is thrown in a child component.
   * Updates state to trigger fallback rendering.
   *
   * @param error - The error that was thrown
   * @returns New state with error information
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Called after error is caught. Use for side effects like logging.
   *
   * @param error - The error that was thrown
   * @param errorInfo - React component stack trace
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Scene error caught by boundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  /**
   * Renders children or fallback based on error state.
   */
  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error);
        }
        return this.props.fallback;
      }

      // Default 3D fallback - red wireframe cube
      return (
        <group>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#ff0000" wireframe />
          </mesh>
          {this.props.showDetails && process.env.NODE_ENV === 'development' && (
            <Html center>
              <div style={{
                background: 'rgba(0,0,0,0.8)',
                color: '#ff0000',
                padding: '1rem',
                borderRadius: '4px',
                maxWidth: '400px',
              }}>
                <h3>Scene Error</h3>
                <p>{this.state.error.message}</p>
                <pre style={{ fontSize: '0.8rem', overflow: 'auto' }}>
                  {this.state.error.stack}
                </pre>
              </div>
            </Html>
          )}
        </group>
      );
    }

    return this.props.children;
  }
}

/**
 * Error boundary specifically for media loading (textures, videos).
 *
 * Provides a specialized fallback for missing media.
 *
 * @example
 * ```tsx
 * <MediaErrorBoundary>
 *   <mesh>
 *     <planeGeometry />
 *     <meshBasicMaterial map={texture} />
 *   </mesh>
 * </MediaErrorBoundary>
 * ```
 */
export class MediaErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.warn('Media load error:', error.message);
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Fallback for media - magenta placeholder
      return (
        <mesh>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#ff00ff" />
        </mesh>
      );
    }

    return this.props.children;
  }
}
```

---

## 2.4 Update PoolContext with Custom Error

### File to Modify: `components/three/pools/PoolContext.tsx`

```typescript
// Add import at top
import { PoolContextError } from '@/lib/errors';

// Update usePools hook
export function usePools(): PoolContextType {
  const context = useContext(PoolContext);

  if (!context) {
    throw new PoolContextError(); // Use custom error
  }

  return context;
}
```

---

## 2.5 Update Environment.tsx with Type Guards

### File to Modify: `components/three/Environment.tsx`

Replace unsafe type casts throughout the file:

**Example 1: Neon sign flicker animation (around line 950)**

```typescript
// Before (unsafe cast)
useFrame((state) => {
  holoRefs.current.forEach((mesh, i) => {
    if (mesh) {
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const time = state.clock.elapsedTime;
      mat.opacity = 0.5 + Math.sin(time * 20 + i * 3) * 0.3;
    }
  });
});

// After (type-safe)
import { getMeshBasicMaterial } from '@/lib/type-guards';

useFrame((state) => {
  holoRefs.current.forEach((mesh, i) => {
    if (!mesh) return;

    const mat = getMeshBasicMaterial(mesh);
    if (!mat) return; // Early return if wrong material type

    const time = state.clock.elapsedTime;
    mat.opacity = 0.5 + Math.sin(time * 20 + i * 3) * 0.3;
  });
});
```

**Example 2: Window flicker (around line 200)**

```typescript
// Before
windowRefs.current.forEach((ref, idx) => {
  if (ref) {
    const mat = ref.material as THREE.MeshBasicMaterial;
    mat.opacity = baseOpacity + flicker;
  }
});

// After
import { setMaterialOpacity } from '@/lib/type-guards';

windowRefs.current.forEach((ref, idx) => {
  if (ref) {
    setMaterialOpacity(ref, baseOpacity + flicker);
  }
});
```

**Example 3: Engine glow (around line 550)**

```typescript
// Before
if (engineRef.current) {
  const mat = engineRef.current.material as THREE.MeshBasicMaterial;
  mat.emissiveIntensity = intensity;
}

// After
import { setEmissiveIntensity } from '@/lib/type-guards';

if (engineRef.current) {
  setEmissiveIntensity(engineRef.current, intensity);
}
```

---

## 2.6 Add Error Boundaries to Scene Hierarchy

### File to Modify: `components/three/SceneContent.tsx`

Wrap components in error boundaries:

```typescript
import { SceneErrorBoundary, MediaErrorBoundary } from './ErrorBoundary';

export default function SceneContent() {
  return (
    <PoolProvider>
      <SceneErrorBoundary
        onError={(error) => {
          console.error('Scene error:', error);
          // Could send to error tracking service here
        }}
      >
        <GradientSkyDome />
        <OrbitControls />
        <Lighting />

        <SceneErrorBoundary fallback={<group />}>
          <Environment />
        </SceneErrorBoundary>

        {SCREEN_CONFIGS.map((config) => (
          <MediaErrorBoundary key={config.id}>
            <TVScreen config={config} />
          </MediaErrorBoundary>
        ))}

        <PostProcessing />
        <Particles />
      </SceneErrorBoundary>
    </PoolProvider>
  );
}
```

---

## 2.7 Add Null Checks to useFrame Callbacks

### Pattern to Apply Throughout

```typescript
// Before
useFrame((state) => {
  groupRef.current.rotation.y += 0.01;
});

// After (with null check and early return)
useFrame((state) => {
  if (!groupRef.current) return; // Guard clause
  groupRef.current.rotation.y += 0.01;
});
```

Apply this pattern to:
- All useFrame callbacks in Environment.tsx (~20 instances)
- useFrame in TVScreen.tsx (~3 instances)
- useFrame in Lighting.tsx (~2 instances)
- useFrame in Particles.tsx (~1 instance)

---

## Implementation Checklist - Phase 2

### Step 1: Create Error Infrastructure
- [ ] Create `lib/errors.ts`
- [ ] Add AppError base class
- [ ] Add PoolContextError class
- [ ] Add MediaLoadError class
- [ ] Add PoolResourceError class
- [ ] Add ConfigValidationError class
- [ ] Add UninitializedObjectError class
- [ ] Add WebGLContextError class

### Step 2: Create Type Guards
- [ ] Create `lib/type-guards.ts`
- [ ] Add isMeshBasicMaterial guard
- [ ] Add isMeshStandardMaterial guard
- [ ] Add isPointsMaterial guard
- [ ] Add isBufferGeometry guard
- [ ] Add getMeshBasicMaterial helper
- [ ] Add getMeshStandardMaterial helper
- [ ] Add isMesh, isGroup, isPointLight guards
- [ ] Add setMaterialOpacity helper
- [ ] Add setEmissiveIntensity helper

### Step 3: Create Error Boundaries
- [ ] Create `components/three/ErrorBoundary.tsx`
- [ ] Implement SceneErrorBoundary class
- [ ] Implement MediaErrorBoundary class
- [ ] Add fallback rendering logic
- [ ] Add error logging

### Step 4: Update Existing Code
- [ ] Update PoolContext.tsx with PoolContextError
- [ ] Import type guards in Environment.tsx
- [ ] Replace unsafe casts in neon sign animation
- [ ] Replace unsafe casts in window flicker
- [ ] Replace unsafe casts in engine glow
- [ ] Replace unsafe casts in ship lights
- [ ] Replace all material type casts (search for `as THREE.`)

### Step 5: Add Null Checks
- [ ] Add guards to all useFrame in Environment.tsx
- [ ] Add guards to useFrame in TVScreen.tsx
- [ ] Add guards to useFrame in Lighting.tsx
- [ ] Add guards to useFrame in Particles.tsx
- [ ] Update refs to type `(T | null)[]` for arrays

### Step 6: Add Error Boundaries
- [ ] Wrap SceneContent in SceneErrorBoundary
- [ ] Wrap Environment in SceneErrorBoundary
- [ ] Wrap each TVScreen in MediaErrorBoundary
- [ ] Add error logging callback

### Step 7: Verification
- [ ] Run `npm run build` - no TypeScript errors
- [ ] Run `npm run dev` - visual inspection
- [ ] Test error boundary with intentional error
- [ ] Verify fallback UI displays
- [ ] Check console for proper error logging
- [ ] Verify scene still renders correctly

---

## Success Criteria - Phase 2

- ✅ Custom error classes created and documented
- ✅ Type guards eliminate all unsafe casts
- ✅ Error boundaries protect component tree
- ✅ All useFrame callbacks have null checks
- ✅ No TypeScript errors
- ✅ Scene renders identically
- ✅ Error handling tested and working
