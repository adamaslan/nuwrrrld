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
