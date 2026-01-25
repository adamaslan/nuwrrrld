'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Html } from '@react-three/drei';

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
 *   fallback={<group />}
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
          {this.props.showDetails &&
            process.env.NODE_ENV === 'development' && (
              <Html center>
                <div
                  style={{
                    background: 'rgba(0,0,0,0.8)',
                    color: '#ff0000',
                    padding: '1rem',
                    borderRadius: '4px',
                    maxWidth: '400px',
                    fontFamily: 'monospace',
                  }}
                >
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>Scene Error</h3>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    {this.state.error.message}
                  </p>
                  <pre
                    style={{
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      maxHeight: '200px',
                      margin: 0,
                    }}
                  >
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
      // Use custom fallback if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error!);
        }
        return this.props.fallback;
      }

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
