"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface Neuron3DProps {
  position: [number, number, number];
  voltage: number;
  spike: boolean;
  index: number;
}

function Neuron3D({ position, voltage, spike, index }: Neuron3DProps) {
  const meshRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  const color = useMemo(() => {
    if (spike) return new THREE.Color("#9D4EDD");
    const t = Math.max(0, Math.min(1, (voltage + 70) / 15));
    return new THREE.Color().lerpColors(
      new THREE.Color("#16213E"),
      new THREE.Color("#00F0FF"),
      t
    );
  }, [voltage, spike]);

  useFrame(() => {
    if (meshRef.current) {
      const targetColor = spike
        ? new THREE.Color("#9D4EDD")
        : new THREE.Color().lerpColors(
            new THREE.Color("#16213E"),
            new THREE.Color("#00F0FF"),
            Math.max(0, Math.min(1, (voltage + 70) / 15))
          );
      (meshRef.current.material as THREE.MeshStandardMaterial).color.lerp(targetColor, 0.1);
      (meshRef.current.material as THREE.MeshStandardMaterial).emissive.lerp(targetColor, 0.1);
      
      const targetScale = spike ? 1.5 : hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={spike ? 2 : 0.3}
        roughness={0.4}
        metalness={0.6}
      />
    </mesh>
  );
}

function Synapse3D({
  start,
  end,
  active,
}: {
  start: [number, number, number];
  end: [number, number, number];
  active: boolean;
}) {
  const lineObj = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2 + 0.5,
        (start[2] + end[2]) / 2
      ),
      new THREE.Vector3(...end)
    );
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(20));
    const material = new THREE.LineBasicMaterial({ color: "#1A1A2E", transparent: true, opacity: 0.2 });
    return new THREE.Line(geometry, material);
  }, [start, end]);

  useFrame(() => {
    if (lineObj) {
      lineObj.material.opacity = THREE.MathUtils.lerp(lineObj.material.opacity, active ? 0.8 : 0.2, 0.1);
      lineObj.material.color.lerp(
        active ? new THREE.Color("#00F0FF") : new THREE.Color("#1A1A2E"),
        0.1
      );
    }
  });

  return <primitive object={lineObj} />;
}

interface Simulation3DViewProps {
  neuronPositions: [number, number, number][];
  voltages: number[];
  spikes: boolean[];
  synapses: { source: number; target: number; active: boolean }[];
  autoRotate?: boolean;
}

function Scene({ neuronPositions, voltages, spikes, synapses, autoRotate }: Simulation3DViewProps) {
  const groupRef = useRef<any>(null);

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#00F0FF" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#9D4EDD" />
      
      {neuronPositions.map((pos, i) => (
        <Neuron3D
          key={i}
          position={pos}
          voltage={voltages[i] || -65}
          spike={spikes[i] || false}
          index={i}
        />
      ))}

      {synapses.map((syn, i) => (
        <Synapse3D
          key={i}
          start={neuronPositions[syn.source]}
          end={neuronPositions[syn.target]}
          active={syn.active}
        />
      ))}
    </group>
  );
}

export default function Simulation3DView({
  neuronPositions,
  voltages,
  spikes,
  synapses,
  autoRotate = true,
}: Simulation3DViewProps) {
  return (
    <div className="w-full h-full bg-void/50 rounded-lg overflow-hidden border border-neon/10">
      <Canvas camera={{ position: [3, 3, 3], fov: 50 }} dpr={[1, 2]}>
        <Scene
          neuronPositions={neuronPositions}
          voltages={voltages}
          spikes={spikes}
          synapses={synapses}
          autoRotate={autoRotate}
        />
        <OrbitControls
          enablePan={false}
          maxDistance={10}
          minDistance={2}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}