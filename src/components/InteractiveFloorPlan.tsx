import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Server, 
  Zap, 
  Thermometer, 
  Fan, 
  Shield, 
  Wifi, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  X, 
  Plus, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Search, 
  Layers, 
  Activity, 
  Gauge, 
  Info, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  ArrowUpRight, 
  Sparkles, 
  Cpu, 
  Power,
  Flame,
  Radio,
  Clock,
  Compass
} from "lucide-react";
import { EdgeNode, CAFMWorkOrder, GlobalState } from "../types";
import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { logAuditEvent } from "../hooks/useGlobalState";

// Types for Spatial Floor Plan
export type AssetCategory = "compute" | "power" | "cooling" | "network" | "sensor" | "security";
export type AssetHealthStatus = "active" | "warning" | "critical" | "maintenance" | "offline";
export type HeatmapMode = "none" | "thermal" | "power" | "occupancy";

export interface FloorRoom {
  id: string;
  name: string;
  code: string;
  type: "datacenter" | "power" | "cooling" | "noc" | "corridor" | "storage";
  x: number;
  y: number;
  width: number;
  height: number;
  targetTemp: number; // °C
  currentTemp: number;
  humidity: number; // %
  pueTarget: number;
}

export interface SpatialAssetNode {
  id: string;
  code: string;
  name: string;
  category: AssetCategory;
  roomId: string;
  x: number; // canvas coordinates
  y: number;
  width?: number;
  height?: number;
  rotation?: number; // 0, 90, 180, 270
  status: AssetHealthStatus;
  
  // Real-time telemetry
  temperature: number; // °C
  tempThreshold: number; // Alert above this
  powerKw: number; // kW power draw
  powerCapacityKw: number;
  loadPercentage: number; // %
  fanRpm?: number;
  efficiencyPue?: number;
  lastMaintenance: string;
  nextScheduled: string;
  activeWorkOrderId?: string;
  
  // Specs / Details
  specs: {
    model: string;
    serial: string;
    manufacturer: string;
    redundancy: "N+1" | "2N" | "N+2" | "Single";
    coolingType?: string;
    ipAddress?: string;
  };
  
  // Link to edge node if mapped
  linkedEdgeNodeId?: string;
}

export interface FacilityBuilding {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  floors: {
    id: string;
    name: string;
    level: string;
    description: string;
    width: number;
    height: number;
    rooms: FloorRoom[];
    assets: SpatialAssetNode[];
  }[];
}

// Comprehensive Datacenter Facilities Data
const DEFAULT_FACILITIES: FacilityBuilding[] = [
  {
    id: "fra-1",
    name: "Frankfurt FRA-1 Flagship",
    city: "Frankfurt",
    country: "Germany",
    address: "Hanauer Landstraße 320, 60314 Frankfurt am Main",
    floors: [
      {
        id: "fra-1-l1",
        name: "Alpha Cleanroom & Edge Racks",
        level: "Level 1",
        description: "High-density server space, contained hot/cold aisles, and Anycast Edge POP racks.",
        width: 1000,
        height: 650,
        rooms: [
          { id: "room-wh-1", name: "Cleanroom A (HPC & Edge)", code: "DC-A1", type: "datacenter", x: 50, y: 50, width: 440, height: 380, targetTemp: 21.0, currentTemp: 21.4, humidity: 48, pueTarget: 1.15 },
          { id: "room-wh-2", name: "Cleanroom B (Storage & AI)", code: "DC-B1", type: "datacenter", x: 510, y: 50, width: 440, height: 380, targetTemp: 20.5, currentTemp: 24.8, humidity: 52, pueTarget: 1.18 },
          { id: "room-noc", name: "NOC/SOC Operations Center", code: "NOC-1", type: "noc", x: 50, y: 450, width: 280, height: 160, targetTemp: 22.0, currentTemp: 21.8, humidity: 45, pueTarget: 1.20 },
          { id: "room-meet", name: "Meet-Me Room & Optical Fiber", code: "MMR-1", type: "datacenter", x: 350, y: 450, width: 280, height: 160, targetTemp: 20.0, currentTemp: 20.2, humidity: 46, pueTarget: 1.12 },
          { id: "room-stock", name: "Logistics Airbag & Spare Parts", code: "SAS-1", type: "storage", x: 650, y: 450, width: 300, height: 160, targetTemp: 22.0, currentTemp: 22.1, humidity: 50, pueTarget: 1.25 }
        ],
        assets: [
          // Row A (DC-A1) - Server Racks
          {
            id: "rack-a1",
            code: "RCK-A01",
            name: "Compute Edge Rack 01 (fra-edge-01)",
            category: "compute",
            roomId: "room-wh-1",
            x: 80,
            y: 80,
            width: 32,
            height: 55,
            status: "active",
            temperature: 21.2,
            tempThreshold: 28.0,
            powerKw: 12.4,
            powerCapacityKw: 18.0,
            loadPercentage: 68,
            lastMaintenance: "2026-08-12",
            nextScheduled: "2026-11-12",
            specs: { model: "Supermicro 42U HPC Rack", serial: "SM-42U-9941", manufacturer: "Supermicro", redundancy: "2N", ipAddress: "10.240.10.11" },
            linkedEdgeNodeId: "fra-1"
          },
          {
            id: "rack-a2",
            code: "RCK-A02",
            name: "Compute Edge Rack 02",
            category: "compute",
            roomId: "room-wh-1",
            x: 125,
            y: 80,
            width: 32,
            height: 55,
            status: "active",
            temperature: 21.8,
            tempThreshold: 28.0,
            powerKw: 14.1,
            powerCapacityKw: 18.0,
            loadPercentage: 78,
            lastMaintenance: "2026-08-12",
            nextScheduled: "2026-11-12",
            specs: { model: "Supermicro 42U HPC Rack", serial: "SM-42U-9942", manufacturer: "Supermicro", redundancy: "2N", ipAddress: "10.240.10.12" }
          },
          {
            id: "rack-a3",
            code: "RCK-A03",
            name: "In-Row Anycast Router Rack",
            category: "network",
            roomId: "room-wh-1",
            x: 170,
            y: 80,
            width: 32,
            height: 55,
            status: "active",
            temperature: 22.1,
            tempThreshold: 28.0,
            powerKw: 8.6,
            powerCapacityKw: 15.0,
            loadPercentage: 57,
            lastMaintenance: "2026-07-20",
            nextScheduled: "2026-10-20",
            specs: { model: "Arista 7050SX Spine Switch", serial: "AR-7050-88", manufacturer: "Arista Networks", redundancy: "2N", ipAddress: "10.240.1.1" }
          },
          {
            id: "rack-a4",
            code: "RCK-A04",
            name: "GPU Inference Alpha Rack",
            category: "compute",
            roomId: "room-wh-1",
            x: 215,
            y: 80,
            width: 32,
            height: 55,
            status: "warning",
            temperature: 26.9,
            tempThreshold: 27.5,
            powerKw: 21.8,
            powerCapacityKw: 24.0,
            loadPercentage: 91,
            lastMaintenance: "2026-06-15",
            nextScheduled: "2026-09-25",
            specs: { model: "NVIDIA HGX H100 8-GPU Node", serial: "NV-HGX-004", manufacturer: "NVIDIA / Dell", redundancy: "2N", ipAddress: "10.240.10.14" }
          },

          // Row B (DC-A1)
          {
            id: "rack-b1",
            code: "RCK-B01",
            name: "Bare-Metal Kubernetes Rack 01",
            category: "compute",
            roomId: "room-wh-1",
            x: 80,
            y: 190,
            width: 32,
            height: 55,
            status: "active",
            temperature: 20.8,
            tempThreshold: 28.0,
            powerKw: 11.2,
            powerCapacityKw: 18.0,
            loadPercentage: 62,
            lastMaintenance: "2026-08-01",
            nextScheduled: "2026-11-01",
            specs: { model: "Dell PowerEdge R760", serial: "DL-R760-441", manufacturer: "Dell EMC", redundancy: "N+1", ipAddress: "10.240.20.21" }
          },
          {
            id: "rack-b2",
            code: "RCK-B02",
            name: "Bare-Metal Kubernetes Rack 02",
            category: "compute",
            roomId: "room-wh-1",
            x: 125,
            y: 190,
            width: 32,
            height: 55,
            status: "active",
            temperature: 21.0,
            tempThreshold: 28.0,
            powerKw: 11.5,
            powerCapacityKw: 18.0,
            loadPercentage: 64,
            lastMaintenance: "2026-08-01",
            nextScheduled: "2026-11-01",
            specs: { model: "Dell PowerEdge R760", serial: "DL-R760-442", manufacturer: "Dell EMC", redundancy: "N+1", ipAddress: "10.240.20.22" }
          },
          {
            id: "rack-b3",
            code: "RCK-B03",
            name: "Flash NVMe Storage Array Rack",
            category: "compute",
            roomId: "room-wh-1",
            x: 170,
            y: 190,
            width: 32,
            height: 55,
            status: "active",
            temperature: 19.8,
            tempThreshold: 26.0,
            powerKw: 9.8,
            powerCapacityKw: 16.0,
            loadPercentage: 52,
            lastMaintenance: "2026-05-18",
            nextScheduled: "2026-11-18",
            specs: { model: "Pure Storage FlashArray //X", serial: "PS-FA-991", manufacturer: "Pure Storage", redundancy: "2N", ipAddress: "10.240.30.1" }
          },

          // Cooling & Power in DC-A1
          {
            id: "crac-1",
            code: "CRAC-A01",
            name: "InRow CRAC Air Handler Alpha 1",
            category: "cooling",
            roomId: "room-wh-1",
            x: 270,
            y: 80,
            width: 40,
            height: 55,
            status: "active",
            temperature: 18.4,
            tempThreshold: 24.0,
            powerKw: 6.8,
            powerCapacityKw: 12.0,
            loadPercentage: 58,
            fanRpm: 2400,
            lastMaintenance: "2026-07-10",
            nextScheduled: "2026-10-10",
            specs: { model: "Vertiv Liebert CRV InRow 30kW", serial: "VT-CRV-11", manufacturer: "Vertiv", redundancy: "N+1", coolingType: "Chilled Water Loop" }
          },
          {
            id: "crac-2",
            code: "CRAC-A02",
            name: "InRow CRAC Air Handler Alpha 2",
            category: "cooling",
            roomId: "room-wh-1",
            x: 270,
            y: 190,
            width: 40,
            height: 55,
            status: "active",
            temperature: 18.6,
            tempThreshold: 24.0,
            powerKw: 7.1,
            powerCapacityKw: 12.0,
            loadPercentage: 60,
            fanRpm: 2450,
            lastMaintenance: "2026-07-10",
            nextScheduled: "2026-10-10",
            specs: { model: "Vertiv Liebert CRV InRow 30kW", serial: "VT-CRV-12", manufacturer: "Vertiv", redundancy: "N+1", coolingType: "Chilled Water Loop" }
          },
          {
            id: "pdu-1",
            code: "PDU-A01",
            name: "PDU Power Cabinet A 160kVA",
            category: "power",
            roomId: "room-wh-1",
            x: 360,
            y: 110,
            width: 45,
            height: 60,
            status: "active",
            temperature: 24.2,
            tempThreshold: 35.0,
            powerKw: 88.0,
            powerCapacityKw: 160.0,
            loadPercentage: 55,
            efficiencyPue: 1.02,
            lastMaintenance: "2026-06-04",
            nextScheduled: "2026-12-04",
            specs: { model: "Schneider Electric Galaxy PDU", serial: "SE-PDU-160", manufacturer: "Schneider Electric", redundancy: "2N" }
          },

          // Sensors in DC-A1
          {
            id: "sens-iaq-1",
            code: "IAQ-A01",
            name: "Cold Aisle IAQ Environmental Sensor",
            category: "sensor",
            roomId: "room-wh-1",
            x: 150,
            y: 155,
            width: 18,
            height: 18,
            status: "active",
            temperature: 20.9,
            tempThreshold: 26.0,
            powerKw: 0.05,
            powerCapacityKw: 0.1,
            loadPercentage: 10,
            lastMaintenance: "2026-04-10",
            nextScheduled: "2027-04-10",
            specs: { model: "Sensaphone IoT Mesh Multi-Sensor", serial: "SP-MESH-01", manufacturer: "Sensaphone", redundancy: "N+1" }
          },

          // DC-B1 (Hotspot Zone with Alert)
          {
            id: "rack-c1",
            code: "RCK-C01",
            name: "High-Density AI Cluster Rack B1",
            category: "compute",
            roomId: "room-wh-2",
            x: 540,
            y: 80,
            width: 32,
            height: 55,
            status: "critical",
            temperature: 31.4,
            tempThreshold: 28.0,
            powerKw: 28.4,
            powerCapacityKw: 30.0,
            loadPercentage: 96,
            activeWorkOrderId: "wo-hotspot-c1",
            lastMaintenance: "2026-06-11",
            nextScheduled: "2026-09-18",
            specs: { model: "NVIDIA DGX SuperPOD Node", serial: "NV-DGX-9901", manufacturer: "NVIDIA", redundancy: "2N", ipAddress: "10.240.40.1" }
          },
          {
            id: "rack-c2",
            code: "RCK-C02",
            name: "High-Density AI Cluster Rack B2",
            category: "compute",
            roomId: "room-wh-2",
            x: 585,
            y: 80,
            width: 32,
            height: 55,
            status: "warning",
            temperature: 27.8,
            tempThreshold: 28.0,
            powerKw: 24.2,
            powerCapacityKw: 30.0,
            loadPercentage: 88,
            lastMaintenance: "2026-06-11",
            nextScheduled: "2026-09-18",
            specs: { model: "NVIDIA DGX SuperPOD Node", serial: "NV-DGX-9902", manufacturer: "NVIDIA", redundancy: "2N", ipAddress: "10.240.40.2" }
          },
          {
            id: "rack-c3",
            code: "RCK-C03",
            name: "Infiniband Quantum Fabric Rack",
            category: "network",
            roomId: "room-wh-2",
            x: 630,
            y: 80,
            width: 32,
            height: 55,
            status: "active",
            temperature: 23.5,
            tempThreshold: 28.0,
            powerKw: 12.0,
            powerCapacityKw: 20.0,
            loadPercentage: 60,
            lastMaintenance: "2026-07-22",
            nextScheduled: "2026-10-22",
            specs: { model: "Mellanox Quantum-2 QM9700 64-Port 400G", serial: "ML-QM9700", manufacturer: "Mellanox / NVIDIA", redundancy: "2N", ipAddress: "10.240.40.50" }
          },
          {
            id: "crac-b1",
            code: "CRAC-B01",
            name: "InRow CRAC Beta 1 (Stalled Fan)",
            category: "cooling",
            roomId: "room-wh-2",
            x: 700,
            y: 80,
            width: 40,
            height: 55,
            status: "warning",
            temperature: 25.2,
            tempThreshold: 24.0,
            powerKw: 4.2,
            powerCapacityKw: 15.0,
            loadPercentage: 35,
            fanRpm: 1100, // degraded fan rpm
            lastMaintenance: "2026-05-10",
            nextScheduled: "2026-09-19",
            specs: { model: "Stulz CyberAir InRow Direct Cool", serial: "ST-CA-882", manufacturer: "Stulz", redundancy: "N+1", coolingType: "Direct Free Cooling" }
          },
          {
            id: "crac-b2",
            code: "CRAC-B02",
            name: "InRow CRAC Beta 2 (Active Backup)",
            category: "cooling",
            roomId: "room-wh-2",
            x: 700,
            y: 190,
            width: 40,
            height: 55,
            status: "active",
            temperature: 19.1,
            tempThreshold: 24.0,
            powerKw: 11.5,
            powerCapacityKw: 15.0,
            loadPercentage: 85,
            fanRpm: 2900,
            lastMaintenance: "2026-07-15",
            nextScheduled: "2026-10-15",
            specs: { model: "Stulz CyberAir InRow Direct Cool", serial: "ST-CA-883", manufacturer: "Stulz", redundancy: "N+1", coolingType: "Direct Free Cooling" }
          },
          {
            id: "pdu-2",
            code: "PDU-B01",
            name: "PDU Power Cabinet B 250kVA",
            category: "power",
            roomId: "room-wh-2",
            x: 820,
            y: 110,
            width: 45,
            height: 60,
            status: "active",
            temperature: 25.5,
            tempThreshold: 35.0,
            powerKw: 172.0,
            powerCapacityKw: 250.0,
            loadPercentage: 68,
            efficiencyPue: 1.03,
            lastMaintenance: "2026-06-04",
            nextScheduled: "2026-12-04",
            specs: { model: "Schneider Electric Galaxy PDU", serial: "SE-PDU-250", manufacturer: "Schneider Electric", redundancy: "2N" }
          },
          {
            id: "sens-iaq-2",
            code: "IAQ-B01",
            name: "Thermal & Hotspot Sensor Aisle B",
            category: "sensor",
            roomId: "room-wh-2",
            x: 570,
            y: 155,
            width: 18,
            height: 18,
            status: "critical",
            temperature: 31.8,
            tempThreshold: 27.0,
            powerKw: 0.05,
            powerCapacityKw: 0.1,
            loadPercentage: 10,
            lastMaintenance: "2026-04-10",
            nextScheduled: "2027-04-10",
            specs: { model: "Sensaphone IoT Mesh Multi-Sensor", serial: "SP-MESH-02", manufacturer: "Sensaphone", redundancy: "N+1" }
          },

          // Meet-Me Room Assets
          {
            id: "mmr-odf-1",
            code: "ODF-01",
            name: "MMR 1 Main Optical Distribution Frame",
            category: "network",
            roomId: "room-meet",
            x: 380,
            y: 490,
            width: 35,
            height: 50,
            status: "active",
            temperature: 19.5,
            tempThreshold: 26.0,
            powerKw: 2.1,
            powerCapacityKw: 8.0,
            loadPercentage: 26,
            lastMaintenance: "2026-07-01",
            nextScheduled: "2027-01-01",
            specs: { model: "Corning EDGE HD High-Density Fiber Housing", serial: "CN-EDGE-88", manufacturer: "Corning", redundancy: "2N" }
          },
          {
            id: "mmr-odf-2",
            code: "ODF-02",
            name: "Tier-1 Transit Interconnection Rack",
            category: "network",
            roomId: "room-meet",
            x: 430,
            y: 490,
            width: 35,
            height: 50,
            status: "active",
            temperature: 20.2,
            tempThreshold: 26.0,
            powerKw: 4.8,
            powerCapacityKw: 10.0,
            loadPercentage: 48,
            lastMaintenance: "2026-07-01",
            nextScheduled: "2027-01-01",
            specs: { model: "Cisco Nexus 9300-GX Fabric", serial: "CS-N9K-9300", manufacturer: "Cisco Systems", redundancy: "2N", ipAddress: "10.240.1.20" }
          },
          {
            id: "sec-mantrap-1",
            code: "SEC-MTR-1",
            name: "Biometric Access Airbag & Anti-Tailgating Gate",
            category: "security",
            roomId: "room-meet",
            x: 350,
            y: 450,
            width: 25,
            height: 25,
            status: "active",
            temperature: 21.0,
            tempThreshold: 30.0,
            powerKw: 0.8,
            powerCapacityKw: 2.0,
            loadPercentage: 40,
            lastMaintenance: "2026-08-10",
            nextScheduled: "2026-11-10",
            specs: { model: "Gunnebo SpeedStile FLs Biometric Interlock", serial: "GB-FLS-104", manufacturer: "Gunnebo", redundancy: "N+1" }
          },

          // NOC & Security Assets
          {
            id: "noc-console-1",
            code: "NOC-CON-1",
            name: "NOC Video Wall Supervision Station",
            category: "security",
            roomId: "room-noc",
            x: 90,
            y: 480,
            width: 50,
            height: 35,
            status: "active",
            temperature: 21.5,
            tempThreshold: 28.0,
            powerKw: 1.8,
            powerCapacityKw: 4.0,
            loadPercentage: 45,
            lastMaintenance: "2026-08-01",
            nextScheduled: "2027-02-01",
            specs: { model: "Barco UniSee 55\" Video Wall Controller", serial: "BC-US-55", manufacturer: "Barco", redundancy: "N+1" }
          },
          {
            id: "sec-cctv-1",
            code: "CCTV-NOC-1",
            name: "AI & Thermal 4K Dome Camera Central Aisle",
            category: "security",
            roomId: "room-noc",
            x: 230,
            y: 455,
            width: 16,
            height: 16,
            status: "active",
            temperature: 24.0,
            tempThreshold: 45.0,
            powerKw: 0.03,
            powerCapacityKw: 0.08,
            loadPercentage: 35,
            lastMaintenance: "2026-03-12",
            nextScheduled: "2027-03-12",
            specs: { model: "Axis Q1952-E Thermal & Optical PTZ", serial: "AX-Q1952", manufacturer: "Axis Communications", redundancy: "N+1" }
          }
        ]
      },
      {
        id: "fra-1-l0",
        name: "Technical Basement & HV/LV Substations",
        level: "Level 0 (Energy)",
        description: "HV transformers, static/rotary UPS units, diesel generators, and main switchboards.",
        width: 1000,
        height: 650,
        rooms: [
          { id: "room-ups-1", name: "UPS Room A & Batteries", code: "UPS-A", type: "power", x: 50, y: 50, width: 440, height: 320, targetTemp: 22.0, currentTemp: 22.4, humidity: 45, pueTarget: 1.05 },
          { id: "room-ups-2", name: "UPS Room B & Batteries", code: "UPS-B", type: "power", x: 510, y: 50, width: 440, height: 320, targetTemp: 22.0, currentTemp: 22.8, humidity: 46, pueTarget: 1.05 },
          { id: "room-tgbt", name: "High Voltage Substation & Central Switchboard", code: "TGBT-1", type: "power", x: 50, y: 390, width: 440, height: 220, targetTemp: 24.0, currentTemp: 23.6, humidity: 40, pueTarget: 1.04 },
          { id: "room-genset", name: "Diesel Generator Hall", code: "GEN-1", type: "power", x: 510, y: 390, width: 440, height: 220, targetTemp: 25.0, currentTemp: 24.5, humidity: 42, pueTarget: 1.08 }
        ],
        assets: [
          {
            id: "ups-a1",
            code: "UPS-A01",
            name: "Central UPS Inverter A 500kVA",
            category: "power",
            roomId: "room-ups-1",
            x: 100,
            y: 90,
            width: 70,
            height: 50,
            status: "active",
            temperature: 23.1,
            tempThreshold: 35.0,
            powerKw: 340.0,
            powerCapacityKw: 500.0,
            loadPercentage: 68,
            efficiencyPue: 1.02,
            lastMaintenance: "2026-06-18",
            nextScheduled: "2026-12-18",
            specs: { model: "Eaton 9395P 500kVA High Efficiency", serial: "ET-9395P-500", manufacturer: "Eaton Power", redundancy: "2N" }
          },
          {
            id: "bat-a1",
            code: "BAT-A01",
            name: "Lithium-Ion Battery Bank A (250kWh)",
            category: "power",
            roomId: "room-ups-1",
            x: 200,
            y: 90,
            width: 80,
            height: 45,
            status: "active",
            temperature: 21.8,
            tempThreshold: 28.0,
            powerKw: 0.0,
            powerCapacityKw: 250.0,
            loadPercentage: 100,
            lastMaintenance: "2026-07-04",
            nextScheduled: "2027-01-04",
            specs: { model: "Samsung SDI MegaLi-ion Rack", serial: "SDI-LI-250", manufacturer: "Samsung SDI", redundancy: "2N" }
          },
          {
            id: "gen-1",
            code: "GEN-01",
            name: "Diesel Generator MTU 2000kW #1",
            category: "power",
            roomId: "room-genset",
            x: 580,
            y: 430,
            width: 110,
            height: 65,
            status: "active",
            temperature: 22.0,
            tempThreshold: 85.0,
            powerKw: 0.0,
            powerCapacityKw: 2000.0,
            loadPercentage: 0,
            lastMaintenance: "2026-08-14",
            nextScheduled: "2026-09-30",
            specs: { model: "Rolls-Royce MTU 16V4000 DS2000", serial: "MTU-16V-01", manufacturer: "Rolls-Royce Power Systems", redundancy: "N+1" }
          },
          {
            id: "gen-2",
            code: "GEN-02",
            name: "Diesel Generator MTU 2000kW #2 (Under Overhaul)",
            category: "power",
            roomId: "room-genset",
            x: 720,
            y: 430,
            width: 110,
            height: 65,
            status: "maintenance",
            temperature: 21.5,
            tempThreshold: 85.0,
            powerKw: 0.0,
            powerCapacityKw: 2000.0,
            loadPercentage: 0,
            lastMaintenance: "2026-09-10",
            nextScheduled: "2026-09-20",
            specs: { model: "Rolls-Royce MTU 16V4000 DS2000", serial: "MTU-16V-02", manufacturer: "Rolls-Royce Power Systems", redundancy: "N+1" }
          }
        ]
      }
    ]
  },
  {
    id: "par-4",
    name: "Paris PA4 Saint-Denis",
    city: "Paris",
    country: "France",
    address: "114 Rue Ambroise Croizat, 93200 Saint-Denis",
    floors: [
      {
        id: "par-4-l1",
        name: "Server Room Île-de-France",
        level: "Level 1",
        description: "Cloud & Anycast POP France, Paris-Saclay metropolitan fiber network.",
        width: 900,
        height: 600,
        rooms: [
          { id: "room-pa-wh", name: "Cleanroom PA4-Compute", code: "PA-C1", type: "datacenter", x: 50, y: 50, width: 500, height: 480, targetTemp: 21.0, currentTemp: 20.8, humidity: 45, pueTarget: 1.16 },
          { id: "room-pa-pwr", name: "HV/LV Technical Room & Inverters", code: "PA-PWR", type: "power", x: 580, y: 50, width: 270, height: 230, targetTemp: 23.0, currentTemp: 22.5, humidity: 44, pueTarget: 1.05 },
          { id: "room-pa-hvac", name: "Air Handling Unit & Water Treatment", code: "PA-HVAC", type: "cooling", x: 580, y: 300, width: 270, height: 230, targetTemp: 20.0, currentTemp: 19.8, humidity: 48, pueTarget: 1.10 }
        ],
        assets: [
          {
            id: "pa-rack-1",
            code: "PA-RCK-01",
            name: "Core Anycast Paris Rack",
            category: "compute",
            roomId: "room-pa-wh",
            x: 100,
            y: 100,
            width: 35,
            height: 60,
            status: "active",
            temperature: 20.5,
            tempThreshold: 28.0,
            powerKw: 15.2,
            powerCapacityKw: 20.0,
            loadPercentage: 76,
            lastMaintenance: "2026-07-14",
            nextScheduled: "2026-10-14",
            specs: { model: "Supermicro Blade 2U Twin", serial: "SM-2U-PA01", manufacturer: "Supermicro", redundancy: "2N", ipAddress: "10.241.10.1" },
            linkedEdgeNodeId: "par-4"
          },
          {
            id: "pa-rack-2",
            code: "PA-RCK-02",
            name: "Storage Object S3 & R2 Rack",
            category: "compute",
            roomId: "room-pa-wh",
            x: 155,
            y: 100,
            width: 35,
            height: 60,
            status: "active",
            temperature: 21.2,
            tempThreshold: 28.0,
            powerKw: 12.8,
            powerCapacityKw: 18.0,
            loadPercentage: 71,
            lastMaintenance: "2026-07-14",
            nextScheduled: "2026-10-14",
            specs: { model: "Dell EMC PowerVault ME5", serial: "DL-ME5-PA02", manufacturer: "Dell EMC", redundancy: "2N", ipAddress: "10.241.20.1" }
          },
          {
            id: "pa-crac-1",
            code: "PA-CRAC-01",
            name: "InRow CRAC Air Handler PA-1",
            category: "cooling",
            roomId: "room-pa-wh",
            x: 230,
            y: 100,
            width: 40,
            height: 60,
            status: "active",
            temperature: 18.2,
            tempThreshold: 24.0,
            powerKw: 7.4,
            powerCapacityKw: 14.0,
            loadPercentage: 53,
            fanRpm: 2300,
            lastMaintenance: "2026-08-01",
            nextScheduled: "2026-11-01",
            specs: { model: "Vertiv Liebert PCW Chilled Water", serial: "VT-PCW-01", manufacturer: "Vertiv", redundancy: "N+1" }
          }
        ]
      }
    ]
  }
];

interface InteractiveFloorPlanProps {
  nodes?: EdgeNode[];
  workOrders?: CAFMWorkOrder[];
  isDark?: boolean;
  onSelectNode?: (node: EdgeNode) => void;
  onCreateWorkOrderForAsset?: (asset: SpatialAssetNode) => void;
}

export default function InteractiveFloorPlan({
  nodes = [],
  workOrders = [],
  isDark = true,
  onSelectNode,
  onCreateWorkOrderForAsset
}: InteractiveFloorPlanProps) {
  // Facilities State
  const [facilities, setFacilities] = useState<FacilityBuilding[]>(DEFAULT_FACILITIES);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("fra-1");
  const [selectedFloorId, setSelectedFloorId] = useState<string>("fra-1-l1");

  // Filter & Layer Toggles
  const [statusFilter, setStatusFilter] = useState<"all" | AssetHealthStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | AssetCategory>("all");
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>("none");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Layer visibility toggles
  const [showRacks, setShowRacks] = useState(true);
  const [showPower, setShowPower] = useState(true);
  const [showCooling, setShowCooling] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showSecurity, setShowSecurity] = useState(true);
  const [showAirflowVectors, setShowAirflowVectors] = useState(true);
  const [showRoomLabels, setShowRoomLabels] = useState(true);
  const [showWorkOrderPins, setShowWorkOrderPins] = useState(true);

  // Selected Asset for Spatial Inspection Drawer
  const [selectedAsset, setSelectedAsset] = useState<SpatialAssetNode | null>(null);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);

  // Interactive Pan & Zoom State
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Current Building & Floor
  const currentFacility = useMemo(() => {
    return facilities.find(f => f.id === selectedFacilityId) || facilities[0];
  }, [facilities, selectedFacilityId]);

  const currentFloor = useMemo(() => {
    return currentFacility.floors.find(fl => fl.id === selectedFloorId) || currentFacility.floors[0];
  }, [currentFacility, selectedFloorId]);

  // Sync when facility changes
  useEffect(() => {
    if (currentFacility.floors.length > 0) {
      setSelectedFloorId(currentFacility.floors[0].id);
    }
  }, [selectedFacilityId, currentFacility]);

  // Synchronize EdgeNode statuses to Spatial Asset Nodes if linked
  useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    setFacilities(prevFacilities => {
      return prevFacilities.map(fac => ({
        ...fac,
        floors: fac.floors.map(fl => ({
          ...fl,
          assets: fl.assets.map(asset => {
            if (asset.linkedEdgeNodeId) {
              const matchedNode = nodes.find(n => n.id === asset.linkedEdgeNodeId);
              if (matchedNode) {
                const mappedStatus: AssetHealthStatus = 
                  matchedNode.status === "active" ? "active" :
                  matchedNode.status === "warning" ? "warning" :
                  matchedNode.status === "critical" ? "critical" : "maintenance";
                return {
                  ...asset,
                  status: mappedStatus,
                  loadPercentage: Math.round((matchedNode.cpuUsage + matchedNode.ramUsage) / 2),
                  powerKw: Math.round((matchedNode.cpuUsage / 100) * asset.powerCapacityKw * 10) / 10
                };
              }
            }
            return asset;
          })
        }))
      }));
    });
  }, [nodes]);

  // Filtered Assets on Current Floor
  const visibleAssets = useMemo(() => {
    return currentFloor.assets.filter(asset => {
      // Category layer check
      if (asset.category === "compute" && !showRacks) return false;
      if (asset.category === "power" && !showPower) return false;
      if (asset.category === "cooling" && !showCooling) return false;
      if (asset.category === "sensor" && !showSensors) return false;
      if (asset.category === "security" && !showSecurity) return false;

      // Status filter
      if (statusFilter !== "all" && asset.status !== statusFilter) return false;

      // Category filter
      if (categoryFilter !== "all" && asset.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = asset.code.toLowerCase().includes(q);
        const matchesName = asset.name.toLowerCase().includes(q);
        const matchesModel = asset.specs.model.toLowerCase().includes(q);
        const matchesIp = (asset.specs.ipAddress || "").toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesModel && !matchesIp) return false;
      }

      return true;
    });
  }, [currentFloor, showRacks, showPower, showCooling, showSensors, showSecurity, statusFilter, categoryFilter, searchQuery]);

  // Spatial Floor Statistics & KPIs
  const floorStats = useMemo(() => {
    const assets = currentFloor.assets;
    const totalAssets = assets.length;
    const healthyCount = assets.filter(a => a.status === "active").length;
    const warningCount = assets.filter(a => a.status === "warning").length;
    const criticalCount = assets.filter(a => a.status === "critical").length;
    const maintenanceCount = assets.filter(a => a.status === "maintenance" || a.status === "offline").length;
    
    const healthIndex = totalAssets > 0 ? Math.round((healthyCount / totalAssets) * 100) : 100;
    const totalPowerKw = Math.round(assets.reduce((acc, a) => acc + a.powerKw, 0) * 10) / 10;
    const avgTemp = Math.round((assets.reduce((acc, a) => acc + a.temperature, 0) / (totalAssets || 1)) * 10) / 10;
    
    // Calculate estimated floor PUE
    const itLoadKw = assets.filter(a => a.category === "compute" || a.category === "network").reduce((acc, a) => acc + a.powerKw, 0);
    const facilityLoadKw = assets.filter(a => a.category === "cooling" || a.category === "power").reduce((acc, a) => acc + a.powerKw, 0);
    const estimatedPue = itLoadKw > 0 ? Math.round(((itLoadKw + facilityLoadKw) / itLoadKw) * 100) / 100 : 1.15;

    return {
      totalAssets,
      healthyCount,
      warningCount,
      criticalCount,
      maintenanceCount,
      healthIndex,
      totalPowerKw,
      avgTemp,
      estimatedPue
    };
  }, [currentFloor]);

  // Pan & Zoom Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoomLevel(prev => Math.min(Math.max(prev * zoomFactor, 0.5), 3.0));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  // Center on specific asset
  const handleFocusAsset = (asset: SpatialAssetNode) => {
    setSelectedAsset(asset);
    setZoomLevel(1.6);
    // Center calculation based on floor dimensions
    const targetX = -(asset.x - currentFloor.width / 2) * 1.6;
    const targetY = -(asset.y - currentFloor.height / 2) * 1.6;
    setPanOffset({ x: targetX, y: targetY });
  };

  // Trigger Diagnostic Test on Asset
  const handleRunDiagnostic = async () => {
    if (!selectedAsset) return;
    setIsDiagnosticRunning(true);
    setDiagnosticResult(null);

    await new Promise(r => setTimeout(r, 1400));

    const isGood = selectedAsset.status !== "critical";
    const resultMsg = isGood 
      ? `✓ All thermal sensors, power phases, and BMC diagnostics passed for ${selectedAsset.code}. Telemetry within nominal parameters.`
      : `⚠️ ALERT: Hotspot detected at ${selectedAsset.code}. Temperature exceeds threshold (${selectedAsset.temperature}°C vs max ${selectedAsset.tempThreshold}°C). Recommend airflow re-routing.`;
    
    setDiagnosticResult(resultMsg);
    setIsDiagnosticRunning(false);

    try {
      await logAuditEvent("CAFM_ASSET_DIAGNOSTIC", `Ran spatial diagnostic test on asset ${selectedAsset.code} (${selectedAsset.name})`);
    } catch {}
  };

  // Toggle Emergency Fan Boost for Cooling Units
  const handleToggleFanBoost = async (asset: SpatialAssetNode) => {
    const newFanRpm = asset.fanRpm && asset.fanRpm > 2600 ? 2200 : 3100;
    const newTemp = asset.temperature > 20 ? asset.temperature - 2.5 : asset.temperature;

    setFacilities(prev => prev.map(f => ({
      ...f,
      floors: f.floors.map(fl => ({
        ...fl,
        assets: fl.assets.map(a => a.id === asset.id ? { ...a, fanRpm: newFanRpm, temperature: newTemp, status: "active" } : a)
      }))
    })));

    if (selectedAsset && selectedAsset.id === asset.id) {
      setSelectedAsset(prev => prev ? { ...prev, fanRpm: newFanRpm, temperature: newTemp, status: "active" } : null);
    }

    try {
      await logAuditEvent("CAFM_HVAC_OVERRIDE", `Adjusted fan speed on ${asset.code} to ${newFanRpm} RPM`);
    } catch {}
  };

  // Color Mapping Helper
  const getStatusColor = (status: AssetHealthStatus) => {
    switch (status) {
      case "active": return { bg: "#10B981", border: "#059669", ring: "rgba(16, 185, 129, 0.4)", text: "text-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
      case "warning": return { bg: "#F59E0B", border: "#D97706", ring: "rgba(245, 158, 11, 0.4)", text: "text-amber-400", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
      case "critical": return { bg: "#EF4444", border: "#DC2626", ring: "rgba(239, 68, 68, 0.6)", text: "text-rose-400", badge: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
      case "maintenance": return { bg: "#3B82F6", border: "#2563EB", ring: "rgba(59, 130, 246, 0.4)", text: "text-blue-400", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
      case "offline": return { bg: "#6B7280", border: "#4B5563", ring: "rgba(107, 114, 128, 0.3)", text: "text-neutral-400", badge: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20" };
    }
  };

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case "compute": return <Server className="w-3.5 h-3.5 text-blue-400" />;
      case "power": return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case "cooling": return <Fan className="w-3.5 h-3.5 text-cyan-400" />;
      case "network": return <Wifi className="w-3.5 h-3.5 text-purple-400" />;
      case "sensor": return <Thermometer className="w-3.5 h-3.5 text-emerald-400" />;
      case "security": return <Shield className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP HEADER & FACILITY/FLOOR SELECTOR BANNER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0c0c0e]/90 border border-white/[0.08] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Compass className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              CAFM 2D Interactive Floor Plan & Spatial Supervision
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              SVG Mesh Engine
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Real-time spatial mapping of white space cleanrooms, hot/cold aisles, server racks, and critical infrastructure.
          </p>
        </div>

        {/* Facility & Floor Selectors */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Facility Selector */}
          <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
            <Building2 className="w-3.5 h-3.5 text-orange-400 ml-1.5" />
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="bg-transparent text-white font-medium text-xs py-1 px-1.5 focus:outline-none cursor-pointer"
            >
              {facilities.map(f => (
                <option key={f.id} value={f.id} className="bg-neutral-900 text-white">
                  {f.name} ({f.city})
                </option>
              ))}
            </select>
          </div>

          {/* Floor Level Selector */}
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
            <Layers className="w-3.5 h-3.5 text-blue-400 ml-1.5" />
            <div className="flex gap-1">
              {currentFacility.floors.map(fl => (
                <button
                  key={fl.id}
                  onClick={() => setSelectedFloorId(fl.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedFloorId === fl.id
                      ? "bg-white text-black font-bold shadow-xs"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {fl.level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SPATIAL HEALTH KPI BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Floor Health Score</span>
            <Activity className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {floorStats.healthIndex}%
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
            {floorStats.healthyCount}/{floorStats.totalAssets} nominal
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Hotspots / Alerts</span>
            <Flame className={`w-3 h-3 ${floorStats.criticalCount > 0 ? "text-rose-400 animate-pulse" : "text-neutral-400"}`} />
          </div>
          <div className={`text-xl font-bold font-mono mt-1 ${floorStats.criticalCount > 0 ? "text-rose-400" : "text-white"}`}>
            {floorStats.criticalCount} Alert{floorStats.criticalCount > 1 ? "s" : ""}
          </div>
          <div className="text-[10px] text-amber-400 font-mono mt-0.5">
            {floorStats.warningCount} warning{floorStats.warningCount > 1 ? "s" : ""}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Electrical Load</span>
            <Zap className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {floorStats.totalPowerKw} kW
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
            On redundant 2N loop
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Avg Temperature</span>
            <Thermometer className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {floorStats.avgTemp}°C
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
            Target 21.0°C (ASHRAE A1)
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Calculated Floor PUE</span>
            <Cpu className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {floorStats.estimatedPue}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
            Top 5% datacenter efficiency
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Maintenance & WO</span>
            <Wrench className="w-3 h-3 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {currentFloor.assets.filter(a => a.activeWorkOrderId).length} WO
          </div>
          <div className="text-[10px] text-blue-400 font-mono mt-0.5">
            {floorStats.maintenanceCount} in progress
          </div>
        </div>
      </div>

      {/* 3. TOOLBAR CONTROLS (SEARCH, FILTERS, LAYERS, HEATMAP MODE, ZOOM) */}
      <div className="p-3 rounded-2xl bg-[#0c0c0e]/80 border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Search & Quick Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rack, equipment, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500/50 text-xs font-mono"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
            <span className="text-neutral-400 text-[10px] uppercase font-mono px-1">Status:</span>
            {(["all", "active", "warning", "critical", "maintenance"] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-white text-black font-bold shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {st === "all" ? "All" : st}
              </button>
            ))}
          </div>

          {/* Heatmap Mode Selector */}
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
            <span className="text-neutral-400 text-[10px] uppercase font-mono px-1">Thermal Layer:</span>
            {(["none", "thermal", "power"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setHeatmapMode(mode)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  heatmapMode === mode
                    ? "bg-orange-500 text-white font-bold shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {mode === "none" ? "Standard" : mode === "thermal" ? "AI Heatmap" : "kW Density"}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Layer Toggles & Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Layer toggles popup/buttons */}
          <div className="hidden sm:flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setShowRacks(!showRacks)}
              title="Show/Hide server racks"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${showRacks ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-neutral-500 opacity-50"}`}
            >
              <Server className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowPower(!showPower)}
              title="Show/Hide power & switchboards"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${showPower ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-neutral-500 opacity-50"}`}
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowCooling(!showCooling)}
              title="Show/Hide CRAC & cooling"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${showCooling ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-neutral-500 opacity-50"}`}
            >
              <Fan className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowSensors(!showSensors)}
              title="Show/Hide IAQ sensors"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${showSensors ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-neutral-500 opacity-50"}`}
            >
              <Thermometer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowAirflowVectors(!showAirflowVectors)}
              title="Show/Hide hot/cold airflow"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${showAirflowVectors ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "text-neutral-500 opacity-50"}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 font-mono">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-neutral-300 px-1 font-bold min-w-[36px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN INTERACTIVE 2D FLOOR PLAN STAGE (SVG CAD ENGINE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Floor Plan Canvas Container (8 to 9 cols depending on drawer) */}
        <div className={`${selectedAsset ? "lg:col-span-8" : "lg:col-span-12"} transition-all duration-300`}>
          <div 
            ref={svgContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className="w-full h-[540px] sm:h-[620px] rounded-3xl bg-[#08080a] border border-white/10 relative overflow-hidden select-none cursor-grab active:cursor-grabbing shadow-2xl"
          >
            {/* Architectural Grid Background */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`,
                backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
              }}
            />

            {/* Compass / Orientation Indicator in Canvas Corner */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 p-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-mono pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-white">{currentFloor.name}</span>
              <span className="text-neutral-500">• {currentFacility.city}</span>
            </div>

            {/* Legend Overlay in Canvas Bottom Left */}
            <div className="absolute bottom-4 left-4 z-10 hidden sm:flex flex-wrap items-center gap-3 p-2.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 text-[10px] font-mono pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
                <span className="text-neutral-300">Nominal (&lt;24°C)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/30" />
                <span className="text-neutral-300">Elevated (25-28°C)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/40 animate-pulse" />
                <span className="text-neutral-300">Critical / Alert (&gt;28°C)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-neutral-300">Maintenance</span>
              </div>
            </div>

            {/* Interactive SVG Floor Plan Canvas */}
            <svg
              className="w-full h-full"
              viewBox={`0 0 ${currentFloor.width} ${currentFloor.height}`}
              preserveAspectRatio="xMidYMid meet"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.15s ease-out"
              }}
            >
              <defs>
                {/* Cold Airflow Gradient */}
                <linearGradient id="coldAisleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0.06" />
                </linearGradient>

                {/* Hot Aisle Gradient */}
                <linearGradient id="hotAisleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#E11D48" stopOpacity="0.08" />
                </linearGradient>

                {/* Thermal Heatmap Filter Gradients */}
                <radialGradient id="hotspotGrad-1" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.65" />
                  <stop offset="50%" stopColor="#F97316" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="coldspotGrad-1" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.5" />
                  <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                </radialGradient>

                {/* Drop shadow for nodes */}
                <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.6" />
                </filter>
              </defs>

              {/* 1. ARCHITECTURAL ROOM BOUNDARIES */}
              {currentFloor.rooms.map(room => (
                <g key={room.id}>
                  {/* Room Floor Rectangle */}
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.width}
                    height={room.height}
                    rx={12}
                    fill={room.type === "datacenter" ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.01)"}
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1.5"
                    strokeDasharray={room.type === "storage" ? "4 4" : undefined}
                  />

                  {/* Room Structural Corner Accents */}
                  <line x1={room.x} y1={room.y} x2={room.x + 15} y2={room.y} stroke="#F97316" strokeWidth="2" />
                  <line x1={room.x} y1={room.y} x2={room.x} y2={room.y + 15} stroke="#F97316" strokeWidth="2" />

                  {/* Room Label & Thermal Badge */}
                  {showRoomLabels && (
                    <g>
                      <rect
                        x={room.x + 12}
                        y={room.y + 12}
                        width={Math.min(room.width - 24, 210)}
                        height={24}
                        rx={6}
                        fill="rgba(0,0,0,0.75)"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                      />
                      <text
                        x={room.x + 20}
                        y={room.y + 28}
                        fill="#FFFFFF"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {room.name}
                      </text>
                      <text
                        x={room.x + room.width - 20}
                        y={room.y + 28}
                        fill={room.currentTemp > 24 ? "#F43F5E" : "#34D399"}
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="end"
                        fontWeight="bold"
                      >
                        {room.currentTemp}°C • {room.humidity}% RH
                      </text>
                    </g>
                  )}
                </g>
              ))}

              {/* 2. CONTAINMENT AISLES & AIRFLOW VECTORS */}
              {showAirflowVectors && (
                <g>
                  {/* Cold Aisle A (Supply) */}
                  <rect
                    x={80}
                    y={145}
                    width={230}
                    height={35}
                    rx={6}
                    fill="url(#coldAisleGrad)"
                    stroke="rgba(56, 189, 248, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={195}
                    y={166}
                    fill="#38BDF8"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="bold"
                    letterSpacing="1"
                  >
                    ❄ CONTAINED COLD AISLE A (20.5°C) ❄
                  </text>

                  {/* Hot Aisle B (Exhaust) in DC-B1 */}
                  <rect
                    x={540}
                    y={145}
                    width={200}
                    height={35}
                    rx={6}
                    fill="url(#hotAisleGrad)"
                    stroke="rgba(244, 63, 94, 0.4)"
                    strokeWidth="1"
                  />
                  <text
                    x={640}
                    y={166}
                    fill="#F43F5E"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="bold"
                    letterSpacing="1"
                  >
                    🔥 HOT AISLE EXHAUST B (31.2°C) 🔥
                  </text>
                </g>
              )}

              {/* 3. HEATMAP OVERLAY LAYER (THERMAL / POWER DENSITY) */}
              {heatmapMode === "thermal" && (
                <g pointerEvents="none">
                  {/* Dynamic Radial Hotspots around high-temp nodes */}
                  {visibleAssets.filter(a => a.temperature > 26).map(asset => (
                    <circle
                      key={`heat-${asset.id}`}
                      cx={asset.x + (asset.width || 30) / 2}
                      cy={asset.y + (asset.height || 40) / 2}
                      r={asset.temperature > 30 ? 110 : 70}
                      fill="url(#hotspotGrad-1)"
                    />
                  ))}
                  {/* Dynamic Cold spots around CRAC units */}
                  {visibleAssets.filter(a => a.category === "cooling").map(asset => (
                    <circle
                      key={`cold-${asset.id}`}
                      cx={asset.x + (asset.width || 30) / 2}
                      cy={asset.y + (asset.height || 40) / 2}
                      r={85}
                      fill="url(#coldspotGrad-1)"
                    />
                  ))}
                </g>
              )}

              {heatmapMode === "power" && (
                <g pointerEvents="none">
                  {visibleAssets.filter(a => a.powerKw > 10).map(asset => (
                    <circle
                      key={`pwr-${asset.id}`}
                      cx={asset.x + (asset.width || 30) / 2}
                      cy={asset.y + (asset.height || 40) / 2}
                      r={Math.min(asset.powerKw * 2.5, 90)}
                      fill="#F59E0B"
                      fillOpacity="0.25"
                    />
                  ))}
                </g>
              )}

              {/* 4. COLOR-CODED ASSET NODES (INTERACTIVE OBJECTS) */}
              {visibleAssets.map(asset => {
                const color = getStatusColor(asset.status);
                const isSelected = selectedAsset?.id === asset.id;
                const nodeW = asset.width || 34;
                const nodeH = asset.height || 48;

                return (
                  <g
                    key={asset.id}
                    onClick={() => {
                      setSelectedAsset(asset);
                      if (asset.linkedEdgeNodeId && onSelectNode) {
                        const matched = nodes.find(n => n.id === asset.linkedEdgeNodeId);
                        if (matched) onSelectNode(matched);
                      }
                    }}
                    className="cursor-pointer transition-transform duration-150 hover:opacity-90"
                    filter="url(#nodeShadow)"
                  >
                    {/* Selected / Pulsing Ring on Critical Alert */}
                    {asset.status === "critical" && (
                      <circle
                        cx={asset.x + nodeW / 2}
                        cy={asset.y + nodeH / 2}
                        r={Math.max(nodeW, nodeH) * 0.8}
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="2"
                        className="animate-ping opacity-75"
                        strokeDasharray="4 2"
                      />
                    )}

                    {isSelected && (
                      <rect
                        x={asset.x - 4}
                        y={asset.y - 4}
                        width={nodeW + 8}
                        height={nodeH + 8}
                        rx={8}
                        fill="none"
                        stroke="#F97316"
                        strokeWidth="2.5"
                        className="animate-pulse"
                      />
                    )}

                    {/* Node Body Card */}
                    <rect
                      x={asset.x}
                      y={asset.y}
                      width={nodeW}
                      height={nodeH}
                      rx={6}
                      fill="#121216"
                      stroke={isSelected ? "#F97316" : color.border}
                      strokeWidth={isSelected ? "2" : "1.5"}
                    />

                    {/* Category Top Color Bar Accent */}
                    <rect
                      x={asset.x}
                      y={asset.y}
                      width={nodeW}
                      height={4}
                      rx={2}
                      fill={color.bg}
                    />

                    {/* Node Status Dot Indicator */}
                    <circle
                      cx={asset.x + 8}
                      cy={asset.y + 12}
                      r={3.5}
                      fill={color.bg}
                    />

                    {/* Asset Code Tag */}
                    <text
                      x={asset.x + nodeW / 2}
                      y={asset.y + nodeH / 2 + 2}
                      fill="#FFFFFF"
                      fontSize="7.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {asset.code}
                    </text>

                    {/* Asset Live Metric (Temp / Load) */}
                    <text
                      x={asset.x + nodeW / 2}
                      y={asset.y + nodeH - 6}
                      fill={color.bg}
                      fontSize="7"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {asset.temperature}°C
                    </text>

                    {/* Work Order Pin Marker */}
                    {showWorkOrderPins && asset.activeWorkOrderId && (
                      <g transform={`translate(${asset.x + nodeW - 6}, ${asset.y - 6})`}>
                        <circle cx={6} cy={6} r={6} fill="#F97316" stroke="#FFFFFF" strokeWidth="1.5" />
                        <text x={6} y={9} fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">!</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* 5. ASSET SPATIAL INSPECTOR DRAWER / DETAIL PANEL */}
        {selectedAsset && (
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-5 rounded-3xl bg-[#0c0c0e]/95 border border-white/10 space-y-4 shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedAsset(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header Badge */}
              <div className="space-y-1 pr-8">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getStatusColor(selectedAsset.status).badge}`}>
                    {selectedAsset.status}
                  </span>
                  <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                    {getCategoryIcon(selectedAsset.category)}
                    {selectedAsset.category.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white leading-tight">
                  {selectedAsset.name}
                </h3>
                <div className="text-xs font-mono text-orange-400">
                  Code: {selectedAsset.code} • Room: {currentFloor.rooms.find(r => r.id === selectedAsset.roomId)?.name || "N/A"}
                </div>
              </div>

              {/* Real-Time Telemetry Gauges Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                    <span>Thermal</span>
                    <Thermometer className="w-3 h-3 text-cyan-400" />
                  </div>
                  <div className={`text-lg font-bold font-mono mt-1 ${selectedAsset.temperature > selectedAsset.tempThreshold ? "text-rose-400" : "text-white"}`}>
                    {selectedAsset.temperature}°C
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono">
                    Max threshold: {selectedAsset.tempThreshold}°C
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                    <span>Power kW</span>
                    <Zap className="w-3 h-3 text-amber-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-white mt-1">
                    {selectedAsset.powerKw} kW
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono">
                    Capacity: {selectedAsset.powerCapacityKw} kW
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                    <span>Load / CPU</span>
                    <Gauge className="w-3 h-3 text-blue-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-white mt-1">
                    {selectedAsset.loadPercentage}%
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${selectedAsset.loadPercentage}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                    <span>{selectedAsset.fanRpm ? "Fan Speed" : "Redundancy"}</span>
                    {selectedAsset.fanRpm ? <Fan className="w-3 h-3 text-emerald-400" /> : <Shield className="w-3 h-3 text-purple-400" />}
                  </div>
                  <div className="text-lg font-bold font-mono text-white mt-1">
                    {selectedAsset.fanRpm ? `${selectedAsset.fanRpm} RPM` : selectedAsset.specs.redundancy}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono">
                    {selectedAsset.fanRpm ? "Regulated loop" : "2N Architecture"}
                  </div>
                </div>
              </div>

              {/* Hardware Specifications Table */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5 text-xs font-mono">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Hardware Specifications
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Model:</span>
                  <span className="text-neutral-200 font-bold truncate max-w-[170px]">{selectedAsset.specs.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Manufacturer:</span>
                  <span className="text-neutral-200">{selectedAsset.specs.manufacturer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Serial No:</span>
                  <span className="text-neutral-300">{selectedAsset.specs.serial}</span>
                </div>
                {selectedAsset.specs.ipAddress && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">IP Address:</span>
                    <span className="text-orange-400">{selectedAsset.specs.ipAddress}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-500">Last Maintenance:</span>
                  <span className="text-neutral-300">{selectedAsset.lastMaintenance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Next Scheduled:</span>
                  <span className="text-neutral-300">{selectedAsset.nextScheduled}</span>
                </div>
              </div>

              {/* Diagnostic Test Output if Triggered */}
              {diagnosticResult && (
                <div className={`p-3 rounded-xl border text-xs font-mono ${
                  diagnosticResult.includes("ALERT") 
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-300" 
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                }`}>
                  {diagnosticResult}
                </div>
              )}

              {/* Interactive Actions CTA */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleRunDiagnostic}
                    disabled={isDiagnosticRunning}
                    className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isDiagnosticRunning ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
                        Running test...
                      </>
                    ) : (
                      <>
                        <Activity className="w-3.5 h-3.5 text-orange-400" />
                        AI Diagnostic
                      </>
                    )}
                  </button>

                  {selectedAsset.category === "cooling" ? (
                    <button
                      onClick={() => handleToggleFanBoost(selectedAsset)}
                      className="w-full px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Fan className="w-3.5 h-3.5" />
                      Fan Boost
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (onCreateWorkOrderForAsset) {
                          onCreateWorkOrderForAsset(selectedAsset);
                        }
                      }}
                      className="w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Create Work Order
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleFocusAsset(selectedAsset)}
                  className="w-full px-3 py-1.5 text-neutral-400 hover:text-white text-xs font-mono flex items-center justify-center gap-1 transition-colors"
                >
                  <Maximize2 className="w-3 h-3" /> Center on map
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* 6. SPATIAL ASSET DIRECTORY LIST & QUICK-JUMP TABLE */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0c0c0e]/90 border border-white/[0.08] space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-orange-400" />
            Spatial Asset Directory ({visibleAssets.length} localized items)
          </h4>
          <span className="text-xs font-mono text-neutral-400">
            {currentFacility.name} • {currentFloor.level}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="text-[10px] text-neutral-400 uppercase tracking-wider border-b border-white/[0.06]">
                <th className="pb-2.5 font-semibold">Code / Equipment</th>
                <th className="pb-2.5 font-semibold">Category</th>
                <th className="pb-2.5 font-semibold">Zone / Room</th>
                <th className="pb-2.5 font-semibold">Temperature</th>
                <th className="pb-2.5 font-semibold">Power (kW)</th>
                <th className="pb-2.5 font-semibold">Health Status</th>
                <th className="pb-2.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {visibleAssets.map(asset => {
                const color = getStatusColor(asset.status);
                const room = currentFloor.rooms.find(r => r.id === asset.roomId);

                return (
                  <tr 
                    key={asset.id} 
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    onClick={() => handleFocusAsset(asset)}
                  >
                    <td className="py-2.5">
                      <div className="font-bold text-white font-sans flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.bg }} />
                        {asset.code}
                        <span className="text-neutral-400 text-xs font-normal">({asset.name})</span>
                      </div>
                    </td>
                    <td className="py-2.5 capitalize text-neutral-300">
                      {asset.category}
                    </td>
                    <td className="py-2.5 text-neutral-400 font-sans">
                      {room?.name || "Main Room"}
                    </td>
                    <td className="py-2.5">
                      <span className={`font-bold ${asset.temperature > asset.tempThreshold ? "text-rose-400 font-bold" : "text-white"}`}>
                        {asset.temperature}°C
                      </span>
                    </td>
                    <td className="py-2.5 text-neutral-200">
                      {asset.powerKw} kW
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${color.badge}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFocusAsset(asset);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-orange-500 hover:text-white text-neutral-300 text-[11px] font-sans font-medium transition-all"
                      >
                        Locate →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
