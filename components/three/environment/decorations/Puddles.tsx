'use client';

/**
 * Reflective puddles on the ground that create mirror-like surfaces.
 *
 * Features:
 * - Circle geometry positioned on ground plane
 * - Highly reflective metallic material
 * - Various sizes for natural appearance
 */
export default function Puddles() {
  return (
    <group>
      {[
        { pos: [-3, -1.97, 4], size: 2.5 },
        { pos: [4, -1.97, 1], size: 3 },
        { pos: [-2, -1.97, -2], size: 2 },
        { pos: [3, -1.97, 6], size: 2.8 },
      ].map((puddle, i) => (
        <mesh
          key={i}
          position={puddle.pos as [number, number, number]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[puddle.size, 32]} />
          <meshStandardMaterial
            color="#0a0a15"
            metalness={1}
            roughness={0}
            envMapIntensity={2}
          />
        </mesh>
      ))}
    </group>
  );
}
