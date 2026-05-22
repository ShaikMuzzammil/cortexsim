"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

function Neuron({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const meshRef = useRef<<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.3 * scale, 16, 16]} />
      <meshStandardMaterial
        color={hovered ? "#00F0FF" : color}
        emissive={hovered ? "#00F0FF" : color}
        emissiveIntensity={hovered ? 2 : 0.5}
        roughness={0.3}
        metalness={0.8}
      />
    </mesh>
  );
}

function Connection({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const points = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(
        (start[0] + end[0]) / 2 + (Math.random() - 0.5) * 2,
        (start[1] + end[1]) / 2 + (Math.random() - 0.5) * 2,
        (start[2] + end[2]) / 2 + (Math.random() - 0.5) * 2
      ),
      new THREE.Vector3(...end)
    );
    return curve.getPoints(50);
  }, [start, end]);

  const lineObj = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: "#00F0FF", transparent: true, opacity: 0.3 });
    return new THREE.Line(geometry, material);
  }, [points]);

  return <primitive object={lineObj} />;
}

function NeuralNetwork() {
  const groupRef = useRef<<THREE.Group>(null);
  
  const neurons = useMemo(() => {
    const items: { position: [number, number, number]; color: string; scale: number }[] = [];
    const colors = ["#00F0FF", "#9D4EDD", "#00E676", "#FF1744"];
    
    for (let i = 0; i < 80; i++) {
      items.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
        ],
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: 0.5 + Math.random() * 1,
      });
    }
    return items;
  }, []);

  const connections = useMemo(() => {
    const conns: { start: [number, number, number]; end: [number, number, number] }[] = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dist = Math.sqrt(
          Math.pow(neurons[i].position[0] - neurons[j].position[0], 2) +
          Math.pow(neurons[i].position[1] - neurons[j].position[1], 2) +
          Math.pow(neurons[i].position[2] - neurons[j].position[2], 2)
        );
        if (dist < 6 && Math.random() > 0.7) {
          conns.push({ start: neurons[i].position, end: neurons[j].position });
        }
      }
    }
    return conns;
  }, [neurons]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {neurons.map((neuron, i) => (
        <Neuron key={i} {...neuron} />
      ))}
      {connections.map((conn, i) => (
        <Connection key={i} {...conn} />
      ))}
    </group>
  );
}

function SpikeParticles() {
  const particlesRef = useRef<<THREE.Points>(null);
  const count = 200;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.01;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00F0FF"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00F0FF" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#9D4EDD" />
        <NeuralNetwork />
        <SpikeParticles />
        <Stars radius={50} depth={50} count={1000} factor={4} saturation={0.5} fade speed={1} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
}