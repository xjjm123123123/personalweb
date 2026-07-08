/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { shaderMaterial, useTrailTexture } from '@react-three/drei';
import * as THREE from 'three';

import './PixelTrail.css';

const GooeyFilter = ({ id = 'goo-filter', strength = 10 }) => {
  return (
    <svg className="goo-filter-container">
      <defs>
        <filter id={id}>
          <feGaussianBlur in="SourceGraphic" stdDeviation={strength} result="blur" />
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
};

const DotMaterial = shaderMaterial(
  {
    resolution: new THREE.Vector2(),
    mouseTrail: null,
    gridSize: 100,
    pixelColor: new THREE.Color('#ffffff'),
    uMouse: new THREE.Vector2(),
    uHasMouse: 0.0
  },
  `
    varying vec2 vUv;
    void main() {
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  `
    uniform vec2 resolution;
    uniform sampler2D mouseTrail;
    uniform float gridSize;
    uniform vec3 pixelColor;
    uniform vec2 uMouse;
    uniform float uHasMouse;

    vec2 coverUv(vec2 uv) {
      vec2 s = resolution.xy / max(resolution.x, resolution.y);
      vec2 newUv = (uv - 0.5) * s + 0.5;
      return clamp(newUv, 0.0, 1.0);
    }

    void main() {
      vec2 screenUv = gl_FragCoord.xy / resolution;
      vec2 uv = coverUv(screenUv);

      vec2 gridUv = fract(uv * gridSize);
      vec2 gridUvCenter = (floor(uv * gridSize) + 0.5) / gridSize;

      float trail = texture2D(mouseTrail, gridUvCenter).r;

      // Calculate mouse cell to keep a single pixel visible when idle
      vec2 mouseScreenUv = uMouse * 0.5 + 0.5;
      vec2 mouseUv = coverUv(mouseScreenUv);
      vec2 mouseGridCenter = (floor(mouseUv * gridSize) + 0.5) / gridSize;
      
      float isMouseCell = step(distance(gridUvCenter, mouseGridCenter), 0.0001) * uHasMouse;

      gl_FragColor = vec4(pixelColor, max(trail, isMouseCell));
    }
  `
);

function Scene({ gridSize, trailSize, maxAge, interpolate, easingFunction, pixelColor }) {
  const size = useThree(s => s.size);
  const viewport = useThree(s => s.viewport);

  const dotMaterial = useMemo(() => new DotMaterial(), []);
  dotMaterial.uniforms.pixelColor.value = new THREE.Color(pixelColor);

  const [trail, onMove] = useTrailTexture({
    size: 512,
    radius: trailSize,
    maxAge: maxAge,
    interpolate: interpolate || 0.1,
    ease: easingFunction || (x => x)
  });

  if (trail) {
    trail.minFilter = THREE.NearestFilter;
    trail.magFilter = THREE.NearestFilter;
    trail.wrapS = THREE.ClampToEdgeWrapping;
    trail.wrapT = THREE.ClampToEdgeWrapping;
  }

  const hasMouseRef = useRef(0);
  const mouseRef = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const handlePointerMove = (event) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const maxSide = Math.max(width, height);
      const screenUv = {
        x: event.clientX / width,
        y: 1 - event.clientY / height
      };
      const trailUv = {
        x: Math.min(Math.max((screenUv.x - 0.5) * (width / maxSide) + 0.5, 0), 1),
        y: Math.min(Math.max((screenUv.y - 0.5) * (height / maxSide) + 0.5, 0), 1)
      };

      hasMouseRef.current = 1;
      mouseRef.current.set(
        screenUv.x * 2 - 1,
        screenUv.y * 2 - 1
      );
      onMove({
        uv: new THREE.Vector2(trailUv.x, trailUv.y)
      });
    };

    const handlePointerLeave = () => {
      hasMouseRef.current = 0;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('blur', handlePointerLeave);
    document.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', handlePointerLeave);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [onMove]);

  useFrame(() => {
    dotMaterial.uniforms.uMouse.value.copy(mouseRef.current);
    dotMaterial.uniforms.uHasMouse.value = hasMouseRef.current;
  });

  const scale = Math.max(viewport.width, viewport.height) / 2;

  return (
    <mesh 
      scale={[scale, scale, 1]} 
      onPointerMove={(e) => {
        hasMouseRef.current = 1;
        onMove(e);
      }}
      onPointerEnter={() => { hasMouseRef.current = 1; }}
      onPointerLeave={() => { hasMouseRef.current = 0; }}
    >
      <planeGeometry args={[2, 2]} />
      <primitive
        object={dotMaterial}
        gridSize={gridSize}
        resolution={[size.width * viewport.dpr, size.height * viewport.dpr]}
        mouseTrail={trail}
      />
    </mesh>
  );
}

export default function PixelTrail({
  gridSize = 40,
  trailSize = 0.1,
  maxAge = 250,
  interpolate = 5,
  easingFunction = x => x,
  canvasProps = {},
  glProps = {
    antialias: false,
    powerPreference: 'high-performance',
    alpha: true
  },
  gooeyFilter,
  color = '#ffffff',
  className = ''
}) {
  return (
    <>
      {gooeyFilter && <GooeyFilter id={gooeyFilter.id} strength={gooeyFilter.strength} />}
      <Canvas
        {...canvasProps}
        gl={glProps}
        className={`pixel-canvas ${className}`}
        style={gooeyFilter ? { filter: `url(#${gooeyFilter.id})` } : undefined}
      >
        <Scene
          gridSize={gridSize}
          trailSize={trailSize}
          maxAge={maxAge}
          interpolate={interpolate}
          easingFunction={easingFunction}
          pixelColor={color}
        />
      </Canvas>
    </>
  );
}
