// Geometry Pool
export {
  createGeometryPool,
  disposeGeometryPool,
  type IGeometryPool,
} from './GeometryPool';

// Material Pool
export {
  createMaterialPool,
  disposeMaterialPool,
  getWindowMaterial,
  getShipHullMaterial,
  type IMaterialPool,
} from './MaterialPool';

// Pool Context
export { PoolProvider, usePools } from './PoolContext';
