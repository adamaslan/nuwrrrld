'use client';

import React, { createContext, useContext, useMemo, useEffect } from 'react';
import {
  createGeometryPool,
  disposeGeometryPool,
  type IGeometryPool,
} from './GeometryPool';
import {
  createMaterialPool,
  disposeMaterialPool,
  type IMaterialPool,
} from './MaterialPool';
import { PoolContextError } from '@/lib/errors';

/**
 * Type for the pool context value containing both geometry and material pools.
 */
interface PoolContextType {
  readonly geometries: IGeometryPool;
  readonly materials: IMaterialPool;
}

/**
 * React Context for geometry and material pools.
 * Provides centralized access to pooled resources throughout the scene.
 */
const PoolContext = createContext<PoolContextType | null>(null);

interface PoolProviderProps {
  children: React.ReactNode;
}

/**
 * PoolProvider - Provides geometry and material pools to all child components.
 *
 * Usage:
 * ```tsx
 * <PoolProvider>
 *   <Environment />
 *   <TVScreen />
 * </PoolProvider>
 * ```
 *
 * Child components access pools via usePools() hook.
 */
export function PoolProvider({ children }: PoolProviderProps) {
  const pools = useMemo(
    () => ({
      geometries: createGeometryPool(),
      materials: createMaterialPool(),
    }),
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disposeGeometryPool(pools.geometries);
      disposeMaterialPool(pools.materials);
    };
  }, [pools]);

  return (
    <PoolContext.Provider value={pools}>{children}</PoolContext.Provider>
  );
}

/**
 * Hook to access the geometry and material pools.
 * Must be used within a PoolProvider.
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { geometries, materials } = usePools();
 *   return (
 *     <mesh
 *       geometry={geometries.box}
 *       material={materials.buildingDark}
 *       scale={[2, 3, 1]}
 *     />
 *   );
 * }
 * ```
 *
 * @returns PoolContextType containing geometries and materials
 * @throws Error if used outside of PoolProvider
 */
export function usePools(): PoolContextType {
  const context = useContext(PoolContext);
  if (!context) {
    throw new PoolContextError();
  }
  return context;
}

// Re-export types for convenience
export type { IGeometryPool, IMaterialPool };
