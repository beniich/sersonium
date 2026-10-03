import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Layers, Eye, RefreshCw, ZoomIn, ZoomOut, CheckCircle2, AlertTriangle, Activity, Droplets, Wind, SunMedium } from 'lucide-react';
import { SpatialNode } from '../types';

interface DigitalTwinViewer3DProps {
  onSelectNode?: (node: SpatialNode) => void;
  selectedNodeId?: string | null;
  interactive?: boolean;
}

export const INITIAL_SPATIAL_NODES: SpatialNode[] = [
  {
    id: 'node-chiller',
    name: 'Chiller Loop B-02',
    category: 'CVC',
    floor: 1,
    floorName: 'HVAC Plant Room - Sub-level 1',
    coords: [-2.2, 0.4, -1.2],
    metricLabel: 'COP: 6.22',
    metricValue: '7.4°C Chilled',
    status: 'OPTIMAL',
    description: 'Centrifugal liquid chiller with magnetic levitation bearings and variable speed drive. ASHRAE Class A efficiency.',
  },
  {
    id: 'node-valve',
    name: 'HydroSync Valve V-14',
    category: 'WATER',
    floor: 2,
    floorName: 'Floor 2 - Central Riser Core',
    coords: [2.4, 0.9, -0.6],
    metricLabel: '0 Leaks',
    metricValue: 'Pressure: 4.2 Bar',
    status: 'OPTIMAL',
    description: 'Smart motorized butterfly valve with piezo-acoustic leak sensors and automated isolated shutoff capabilities.',
  },
  {
    id: 'node-iaq',
    name: 'WELL IAQ Sensor Node',
    category: 'IAQ',
    floor: 3,
    floorName: 'Floor 3 - Open Workspace Zone A',
    coords: [-1.4, 1.6, 1.4],
    metricLabel: 'CO2: 412 ppm',
    metricValue: 'PM2.5: 5.1µg',
    status: 'OPTIMAL',
    description: 'Multi-parameter indoor air quality beacon monitoring TVOC, CO2, PM1/PM2.5/PM10, temperature and relative humidity.',
  },
  {
    id: 'node-dali',
    name: 'CityPulse DALI Lighting',
    category: 'LIGHTING',
    floor: 4,
    floorName: 'Floor 4 - Executive Penthouse',
    coords: [1.8, 2.3, 1.2],
    metricLabel: 'Circadian 4200K',
    metricValue: '320 Lux',
    status: 'OPTIMAL',
    description: 'DALI-2 addressable lighting bus with astronomical clock circadian dimming and harvested daylight sensing.',
  },
];

export const DigitalTwinViewer3D: React.FC<DigitalTwinViewer3DProps> = ({
  onSelectNode,
  selectedNodeId,
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframeMode, setWireframeMode] = useState<boolean>(true);
  const [thermalHeatmap, setThermalHeatmap] = useState<boolean>(false);
  const [activeFloor, setActiveFloor] = useState<number>(0); // 0 = all floors
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [activeNode, setActiveNode] = useState<SpatialNode | null>(INITIAL_SPATIAL_NODES[0]);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const floorGroupsRef = useRef<THREE.Group[]>([]);
  const materialsRef = useRef<THREE.Material[]>([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(7, 5, 8);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x6366f1, 1.8);
    dirLight.position.set(10, 15, 10);
    scene.add(dirLight);

    const blueLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    blueLight.position.set(-10, -5, -10);
    scene.add(blueLight);

    // Root Group
    const rootGroup = new THREE.Group();
    groupRef.current = rootGroup;
    scene.add(rootGroup);

    // Coordinate Grid Foundation
    const gridHelper = new THREE.GridHelper(12, 24, 0x818cf8, 0xe0e7ff);
    gridHelper.position.y = -0.05;
    rootGroup.add(gridHelper);

    // Floor Slices
    const floorGroups: THREE.Group[] = [];
    const floorHeights = [0.2, 0.9, 1.6, 2.3, 3.0];
    const floorWidth = 5.2;
    const floorDepth = 4.2;

    floorHeights.forEach((yPos, index) => {
      const floorGroup = new THREE.Group();
      floorGroup.position.y = yPos;

      // Slab
      const slabGeo = new THREE.BoxGeometry(floorWidth, 0.08, floorDepth);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0xeff6ff,
        metalness: 0.1,
        roughness: 0.4,
        transparent: true,
        opacity: 0.85,
        wireframe: wireframeMode,
      });
      materialsRef.current.push(slabMat);
      const slab = new THREE.Mesh(slabGeo, slabMat);
      floorGroup.add(slab);

      // Wireframe contour outline
      const wireEdges = new THREE.EdgesGeometry(slabGeo);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x6366f1, linewidth: 1.5 });
      const wireframeLine = new THREE.LineSegments(wireEdges, lineMat);
      floorGroup.add(wireframeLine);

      // Structural columns
      const colHeight = 0.65;
      const colGeo = new THREE.CylinderGeometry(0.06, 0.06, colHeight, 8);
      const colMat = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        wireframe: wireframeMode,
        transparent: true,
        opacity: 0.9,
      });
      materialsRef.current.push(colMat);

      const colPositions = [
        [-2.3, colHeight / 2, -1.8],
        [2.3, colHeight / 2, -1.8],
        [-2.3, colHeight / 2, 1.8],
        [2.3, colHeight / 2, 1.8],
        [0, colHeight / 2, 0], // Central elevator core
      ];

      colPositions.forEach(([cx, cy, cz]) => {
        const col = new THREE.Mesh(colGeo, colMat);
        col.position.set(cx, cy, cz);
        floorGroup.add(col);
      });

      // Internal Glass Partition walls (BIM Level 300)
      if (index > 0 && index < 4) {
        const wallGeo = new THREE.BoxGeometry(2.4, 0.6, 0.04);
        const wallMat = new THREE.MeshPhysicalMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.25,
          roughness: 0.1,
          transmission: 0.8,
        });
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.set(-0.8, 0.35, 0.4);
        floorGroup.add(wall);
      }

      // Roof HVAC units on top floor
      if (index === 4) {
        const chillerUnitGeo = new THREE.BoxGeometry(1.2, 0.4, 0.8);
        const chillerUnitMat = new THREE.MeshStandardMaterial({
          color: 0x4f46e5,
          wireframe: wireframeMode,
        });
        materialsRef.current.push(chillerUnitMat);
        const chillerUnit = new THREE.Mesh(chillerUnitGeo, chillerUnitMat);
        chillerUnit.position.set(-1.2, 0.25, -0.8);
        floorGroup.add(chillerUnit);

        // Solar PV panels array
        const pvGeo = new THREE.BoxGeometry(2.0, 0.04, 1.4);
        const pvMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b });
        const pv = new THREE.Mesh(pvGeo, pvMat);
        pv.position.set(1.0, 0.15, 0.5);
        pv.rotation.x = -0.15;
        floorGroup.add(pv);
      }

      rootGroup.add(floorGroup);
      floorGroups.push(floorGroup);
    });

    floorGroupsRef.current = floorGroups;

    // Add Glowing 3D Marker Spheres for Spatial Nodes
    INITIAL_SPATIAL_NODES.forEach((node) => {
      const markerGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: node.category === 'CVC' ? 0x6366f1 : node.category === 'WATER' ? 0x0ea5e9 : node.category === 'IAQ' ? 0x10b981 : 0xf59e0b,
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(...node.coords);

      // Pulsing outer halo
      const haloGeo = new THREE.RingGeometry(0.16, 0.22, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(...node.coords);
      halo.lookAt(camera.position);

      rootGroup.add(marker);
      rootGroup.add(halo);
    });

    // Animation Loop
    let animationFrameId: number;
    let angle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && rootGroup) {
        rootGroup.rotation.y += 0.003;
      }

      angle += 0.03;
      renderer.render(scene, camera);
    };

    animate();

    // Mouse drag rotation controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !rootGroup) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      rootGroup.rotation.y += deltaX * 0.008;
      rootGroup.rotation.x = Math.max(-0.4, Math.min(0.6, rootGroup.rotation.x + deltaY * 0.005));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  // Update wireframe property on toggle
  useEffect(() => {
    materialsRef.current.forEach((mat) => {
      if ('wireframe' in mat) {
        (mat as THREE.MeshStandardMaterial).wireframe = wireframeMode;
      }
    });
  }, [wireframeMode]);

  // Update thermal heatmap visualization
  useEffect(() => {
    materialsRef.current.forEach((mat, idx) => {
      if ('color' in mat) {
        const stdMat = mat as THREE.MeshStandardMaterial;
        if (thermalHeatmap) {
          // pseudo thermal gradient
          const colors = [0xef4444, 0xf97316, 0x10b981, 0x3b82f6];
          stdMat.color.setHex(colors[idx % colors.length]);
          stdMat.wireframe = false;
        } else {
          stdMat.color.setHex(idx % 2 === 0 ? 0xeff6ff : 0x6366f1);
          stdMat.wireframe = wireframeMode;
        }
      }
    });
  }, [thermalHeatmap, wireframeMode]);

  // Filter floor slicing
  useEffect(() => {
    floorGroupsRef.current.forEach((group, index) => {
      if (activeFloor === 0) {
        group.visible = true;
        group.position.y = [0.2, 0.9, 1.6, 2.3, 3.0][index];
      } else if (activeFloor === index + 1) {
        group.visible = true;
        group.position.y = 1.4; // Center isolated floor
      } else {
        group.visible = false;
      }
    });
  }, [activeFloor]);

  const handleNodeClick = (node: SpatialNode) => {
    setActiveNode(node);
    if (onSelectNode) {
      onSelectNode(node);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const factor = direction === 'in' ? 0.85 : 1.15;
    cameraRef.current.position.multiplyScalar(factor);
  };

  const handleReset = () => {
    if (!cameraRef.current || !groupRef.current) return;
    cameraRef.current.position.set(7, 5, 8);
    cameraRef.current.lookAt(0, 1.2, 0);
    groupRef.current.rotation.set(0, 0, 0);
    setActiveFloor(0);
    setAutoRotate(true);
  };

  return (
    <div className="relative w-full h-[460px] md:h-[520px] rounded-xl overflow-hidden bg-gradient-to-b from-[#f8faff] via-[#edf2fe] to-[#e8edfc] border border-indigo-100 shadow-[0_20px_50px_rgba(99,102,241,0.08)]">
      {/* Canvas Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2.5 bg-white/80 backdrop-blur-md border-b border-indigo-50 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <span>HQ NeuMatrix</span>
            <span className="text-slate-300 font-normal">/</span>
            <span className="text-indigo-600 font-mono text-[11px]">Tower Omicron-4</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping inline-block" />
            LIVE IFC STREAM · SYNC 12ms
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-[11px] font-mono text-slate-500">
            Spatial Mesh: REVIT 2025 IFC4.3
          </span>
          <button
            onClick={() => setWireframeMode(!wireframeMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              wireframeMode
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Wireframe
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Interactive Floating Spatial Nodes (Matching image overlays) */}
      <div className="absolute inset-0 pointer-events-none z-10 p-4">
        {/* Node 1: Chiller Loop B-02 (Top Left) */}
        <div
          onClick={() => handleNodeClick(INITIAL_SPATIAL_NODES[0])}
          className={`pointer-events-auto absolute top-14 left-4 md:left-8 transition-all duration-200 cursor-pointer p-2.5 rounded-lg border backdrop-blur-md shadow-lg ${
            activeNode?.id === 'node-chiller'
              ? 'bg-white/95 border-indigo-500 ring-2 ring-indigo-200 scale-105'
              : 'bg-white/85 border-indigo-100 hover:bg-white hover:scale-102'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-100 text-indigo-600">
              <Activity className="w-3.5 h-3.5" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-900">Chiller Loop B-02</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              </div>
              <div className="text-[11px] font-mono text-slate-600">
                COP: 6.22 · <span className="text-indigo-600 font-semibold">7.4°C Chilled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Node 2: HydroSync Valve V-14 (Top Right) */}
        <div
          onClick={() => handleNodeClick(INITIAL_SPATIAL_NODES[1])}
          className={`pointer-events-auto absolute top-16 right-4 md:right-8 transition-all duration-200 cursor-pointer p-2.5 rounded-lg border backdrop-blur-md shadow-lg ${
            activeNode?.id === 'node-valve'
              ? 'bg-white/95 border-sky-500 ring-2 ring-sky-200 scale-105'
              : 'bg-white/85 border-sky-100 hover:bg-white hover:scale-102'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-sky-100 text-sky-600">
              <Droplets className="w-3.5 h-3.5" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-900">HydroSync Valve V-14</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" />
              </div>
              <div className="text-[11px] font-mono text-slate-600">
                0 Leaks · Pressure: <span className="text-sky-600 font-semibold">4.2 Bar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Node 3: WELL IAQ Sensor Node (Bottom Left) */}
        <div
          onClick={() => handleNodeClick(INITIAL_SPATIAL_NODES[2])}
          className={`pointer-events-auto absolute bottom-14 left-4 md:left-12 transition-all duration-200 cursor-pointer p-2.5 rounded-lg border backdrop-blur-md shadow-lg ${
            activeNode?.id === 'node-iaq'
              ? 'bg-white/95 border-emerald-500 ring-2 ring-emerald-200 scale-105'
              : 'bg-white/85 border-emerald-100 hover:bg-white hover:scale-102'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-100 text-emerald-600">
              <Wind className="w-3.5 h-3.5" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-900">WELL IAQ Sensor Node</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              </div>
              <div className="text-[11px] font-mono text-slate-600">
                CO2: <span className="text-emerald-600 font-semibold">412 ppm</span> · PM2.5: 5.1µg
              </div>
            </div>
          </div>
        </div>

        {/* Node 4: CityPulse DALI Lighting (Bottom Right) */}
        <div
          onClick={() => handleNodeClick(INITIAL_SPATIAL_NODES[3])}
          className={`pointer-events-auto absolute bottom-14 right-4 md:right-12 transition-all duration-200 cursor-pointer p-2.5 rounded-lg border backdrop-blur-md shadow-lg ${
            activeNode?.id === 'node-dali'
              ? 'bg-white/95 border-amber-500 ring-2 ring-amber-200 scale-105'
              : 'bg-white/85 border-amber-100 hover:bg-white hover:scale-102'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-100 text-amber-600">
              <SunMedium className="w-3.5 h-3.5" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-900">CityPulse DALI Lighting</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
              </div>
              <div className="text-[11px] font-mono text-slate-600">
                Circadian 4200K · <span className="text-amber-600 font-semibold">320 Lux</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Viewport Controls (Bottom Floating Strip) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-indigo-100 shadow-md">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveFloor(0)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              activeFloor === 0 ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Floors
          </button>
          {[1, 2, 3, 4, 5].map((fl) => (
            <button
              key={fl}
              onClick={() => setActiveFloor(fl)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition-colors ${
                activeFloor === fl ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              F{fl}
            </button>
          ))}
        </div>

        <div className="h-3 w-[1px] bg-slate-200" />

        <button
          onClick={() => setThermalHeatmap(!thermalHeatmap)}
          title="Toggle Thermal Heatmap"
          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
            thermalHeatmap ? 'bg-rose-500 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Thermal
        </button>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title="Auto Rotate"
          className={`p-1 rounded text-slate-600 hover:text-indigo-600 ${autoRotate ? 'text-indigo-600' : ''}`}
        >
          <RefreshCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} />
        </button>

        <button
          onClick={() => handleZoom('in')}
          title="Zoom In"
          className="p-1 rounded text-slate-600 hover:text-indigo-600"
        >
          <ZoomIn className="w-3 h-3" />
        </button>

        <button
          onClick={() => handleZoom('out')}
          title="Zoom Out"
          className="p-1 rounded text-slate-600 hover:text-indigo-600"
        >
          <ZoomOut className="w-3 h-3" />
        </button>

        <button
          onClick={handleReset}
          title="Reset Camera"
          className="px-2 py-0.5 rounded text-[10px] text-slate-600 hover:text-slate-900 bg-slate-100"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
