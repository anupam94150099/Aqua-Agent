import React, { useState } from 'react';
import { SensorData, ValveId, ValveStatus, PipelineZone } from '../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  Eye, 
  Lock, 
  Unlock, 
  Map, 
  Cpu, 
  Layers, 
  Navigation, 
  Activity, 
  Radio, 
  Info,
  Droplets,
  Gauge,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface ValveDiagramProps {
  sensorData: SensorData;
  onToggleValve?: (valveId: ValveId, currentStatus: ValveStatus) => void;
}

interface SelectedNodeInfo {
  id: string;
  name: string;
  type: string;
  diameter: string;
  material: string;
  flow: number;
  pressure: number;
  loss: number;
  status: string;
  valve?: { id: ValveId; status: ValveStatus };
}

export const ValveDiagram: React.FC<ValveDiagramProps> = ({ sensorData, onToggleValve }) => {
  const [viewMode, setViewMode] = useState<'gis' | 'schematic'>('gis');
  const [selectedNode, setSelectedNode] = useState<SelectedNodeInfo | null>(null);

  const v1Status: ValveStatus = sensorData.valve_status?.['Valve 1'] || 'OPEN';
  const v2Status: ValveStatus = sensorData.valve_status?.['Valve 2'] || 'OPEN';
  const v3Status: ValveStatus = sensorData.valve_status?.['Valve 3'] || 'OPEN';
  const v4Status: ValveStatus = sensorData.valve_status?.['Valve 4'] || 'OPEN';

  const anomalyType = sensorData.anomalyType || 'NONE';
  const isLeak = anomalyType === 'LEAK_RUPTURE';
  const isTheft = anomalyType === 'WATER_THEFT';

  const getValveColor = (status: ValveStatus) => {
    if (status === 'FAULT') return '#ef4444';
    if (status === 'CLOSED') return '#3b82f6';
    return '#10b981';
  };

  const handleNodeClick = (info: SelectedNodeInfo) => {
    setSelectedNode(info);
  };

  return (
    <div className="pipeline-diagram" style={{ padding: '1.25rem' }}>
      {/* Topology Header & View Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Map size={18} color="#38bdf8" />
            <span>Full Municipal Pipeline Network & GIS Digital Twin</span>
          </span>

          {isTheft && (
            <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', borderColor: '#f59e0b', animation: 'pulse 1.5s infinite' }}>
              🚨 WATER THEFT / ILLEGAL TAP DETECTED (Zone 2)
            </span>
          )}
          {isLeak && (
            <span className="badge badge-high" style={{ animation: 'pulse 1.5s infinite' }}>
              💥 PHYSICAL PIPE RUPTURE ACTIVE (Zone 3)
            </span>
          )}
          {!isLeak && !isTheft && (
            <span className="badge badge-normal">
              🟢 ALL PIPELINE SECTORS NOMINAL
            </span>
          )}
        </div>

        {/* View Switcher Buttons */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#0f172a', padding: '3px', borderRadius: '6px', border: '1px solid #334155' }}>
          <button
            onClick={() => setViewMode('gis')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0.3rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'gis' ? '#0284c7' : 'transparent',
              color: viewMode === 'gis' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.2s ease',
            }}
          >
            <Map size={13} />
            <span>🗺️ City GIS Pipeline Map</span>
          </button>

          <button
            onClick={() => setViewMode('schematic')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0.3rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'schematic' ? '#0284c7' : 'transparent',
              color: viewMode === 'schematic' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.2s ease',
            }}
          >
            <Cpu size={13} />
            <span>⚡ SCADA P&ID Schematic</span>
          </button>
        </div>
      </div>

      {/* Main Map / SVG Schematic Container */}
      <div 
        className="pipeline-svg-container" 
        style={{ 
          height: '380px', 
          backgroundColor: '#070b14', 
          borderRadius: '8px', 
          border: '1px solid #1f2937', 
          position: 'relative',
          overflow: 'hidden' 
        }}
      >
        {/* Helper Hint Badge */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(4px)',
          border: '1px solid #334155',
          borderRadius: '4px',
          padding: '0.25rem 0.5rem',
          fontSize: '0.7rem',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          zIndex: 10,
        }}>
          <Info size={12} color="#38bdf8" />
          <span>Click any <strong>Valve</strong> to toggle OPEN/CLOSE or click <strong>Junctions</strong> to inspect node parameters</span>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: FULL CITY GIS GEOSPATIAL PIPELINE NETWORK MAP     */}
        {/* ======================================================== */}
        {viewMode === 'gis' && (
          <svg width="100%" height="100%" viewBox="0 0 960 380" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="gisWaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>

              <linearGradient id="riverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0369a1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.15" />
              </linearGradient>

              <pattern id="gisWaterDash" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="2" fill="#bae6fd" />
              </pattern>

              {/* Glowing animated pulse filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* City Background & District Zones Map Grid */}
            <rect x="0" y="0" width="960" height="380" fill="#070b14" />
            
            {/* Background Grid Lines */}
            <g opacity="0.08" stroke="#38bdf8" strokeWidth="1">
              {Array.from({ length: 24 }).map((_, i) => (
                <line key={`vg-${i}`} x1={i * 40} y1="0" x2={i * 40} y2="380" />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <line key={`hg-${i}`} x1="0" y1={i * 40} x2="960" y2={i * 40} />
              ))}
            </g>

            {/* River Source & Water Treatment Plant Area (Top Left) */}
            <path d="M 0 30 Q 80 50, 140 30 T 260 40 L 260 0 L 0 0 Z" fill="url(#riverGrad)" />
            <text x="70" y="20" fill="#38bdf8" fontSize="9" fontWeight="bold" opacity="0.8">RIVER INTAKE RESERVOIR</text>

            {/* District Boundary Polygons */}
            {/* Zone 1: Residential Sector (North-East) */}
            <rect x="520" y="25" width="410" height="95" rx="8" fill="#0f172a" fillOpacity="0.6" stroke="#34d399" strokeWidth="1" strokeDasharray="4 3" />
            <text x="535" y="44" fill="#34d399" fontSize="10" fontWeight="bold">DISTRICT NORTH: Residential Sector (DMA-01)</text>
            <text x="535" y="58" fill="#64748b" fontSize="8">3,400 Household Connections • School & Civic Infrastructure</text>

            {/* Zone 2: Commercial Sector (Center-East) */}
            <rect x="520" y="135" width="410" height="100" rx="8" fill="#0f172a" fillOpacity="0.6" stroke={isTheft ? '#f59e0b' : '#38bdf8'} strokeWidth="1.2" strokeDasharray="4 3" />
            <text x="535" y="154" fill={isTheft ? '#fbbf24' : '#38bdf8'} fontSize="10" fontWeight="bold">DISTRICT EAST: Commercial District & Hospitals (DMA-02)</text>
            <text x="535" y="168" fill="#64748b" fontSize="8">Metro Hospital, Business Tech Parks, Shopping Malls</text>

            {/* Zone 3: Industrial SEZ (South-East) */}
            <rect x="520" y="250" width="410" height="105" rx="8" fill="#0f172a" fillOpacity="0.6" stroke={isLeak ? '#ef4444' : '#a855f7'} strokeWidth="1.2" strokeDasharray="4 3" />
            <text x="535" y="269" fill={isLeak ? '#f87171' : '#c084fc'} fontSize="10" fontWeight="bold">DISTRICT SOUTH: Industrial Park & Petrochemical SEZ (DMA-03)</text>
            <text x="535" y="283" fill="#64748b" fontSize="8">Refinery, Thermal Power Plant, Manufacturing Units</text>

            {/* ======================================================== */}
            {/* TRANSMISSION MAINS & DISTRIBUTION PIPELINES              */}
            {/* ======================================================== */}

            {/* 1. Primary Feeder Main (Intake -> Central WTP & Pump Station) */}
            <path d="M 90 40 L 90 190 L 190 190" fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
            <path d="M 90 40 L 90 190 L 190 190" fill="none" stroke="#0284c7" strokeWidth="8" strokeLinecap="round" />
            <path d="M 90 40 L 90 190 L 190 190" fill="none" stroke="#bae6fd" strokeWidth="3" strokeDasharray="8 6">
              <animate attributeName="stroke-dashoffset" values="28;0" dur="1s" repeatCount="indefinite" />
            </path>

            {/* 2. Main Distribution Header Trunk (Pump Station J0 -> Distributor J1, J2, J3) */}
            <path d="M 230 190 L 370 190" fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
            <path d="M 230 190 L 370 190" fill="none" stroke="#0284c7" strokeWidth="9" strokeLinecap="round" />
            <path d="M 230 190 L 370 190" fill="none" stroke="#e0f2fe" strokeWidth="3" strokeDasharray="10 6">
              <animate attributeName="stroke-dashoffset" values="32;0" dur="0.9s" repeatCount="indefinite" />
            </path>

            {/* 3. North Branch (To Residential Sector DMA-01) */}
            <path d="M 370 190 L 370 75 L 560 75 L 890 75" fill="none" stroke="#1e293b" strokeWidth="12" strokeLinejoin="round" />
            {v4Status === 'OPEN' ? (
              <>
                <path d="M 370 190 L 370 75 L 560 75 L 890 75" fill="none" stroke="#34d399" strokeWidth="6" strokeLinejoin="round" />
                <path d="M 370 190 L 370 75 L 560 75 L 890 75" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="8 6" strokeLinejoin="round">
                  <animate attributeName="stroke-dashoffset" values="28;0" dur="0.8s" repeatCount="indefinite" />
                </path>
              </>
            ) : (
              <path d="M 370 190 L 370 75 L 560 75 L 890 75" fill="none" stroke="#475569" strokeWidth="4" strokeLinejoin="round" strokeDasharray="3 3" />
            )}

            {/* 4. East Branch (To Commercial Sector DMA-02) */}
            <path d="M 370 190 L 890 190" fill="none" stroke="#1e293b" strokeWidth="12" strokeLinejoin="round" />
            {v3Status === 'OPEN' ? (
              <>
                <path d="M 370 190 L 890 190" fill="none" stroke={isTheft ? '#f59e0b' : '#38bdf8'} strokeWidth="6" strokeLinejoin="round" />
                <path d="M 370 190 L 890 190" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="8 6" strokeLinejoin="round">
                  <animate attributeName="stroke-dashoffset" values="28;0" dur="0.8s" repeatCount="indefinite" />
                </path>
              </>
            ) : (
              <path d="M 370 190 L 890 190" fill="none" stroke="#475569" strokeWidth="4" strokeLinejoin="round" strokeDasharray="3 3" />
            )}

            {/* 5. South Branch (To Industrial Sector DMA-03) */}
            <path d="M 370 190 L 370 310 L 890 310" fill="none" stroke="#1e293b" strokeWidth="14" strokeLinejoin="round" />
            {v1Status === 'OPEN' && v2Status === 'OPEN' ? (
              <>
                <path d="M 370 190 L 370 310 L 890 310" fill="none" stroke={isLeak ? '#ef4444' : '#a855f7'} strokeWidth="7" strokeLinejoin="round" />
                <path d="M 370 190 L 370 310 L 890 310" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="8 6" strokeLinejoin="round">
                  <animate attributeName="stroke-dashoffset" values="28;0" dur="0.75s" repeatCount="indefinite" />
                </path>
              </>
            ) : (
              <path d="M 370 190 L 370 310 L 890 310" fill="none" stroke="#475569" strokeWidth="4" strokeLinejoin="round" strokeDasharray="3 3" />
            )}

            {/* 6. Inter-District Emergency Bypass Loop */}
            <path d="M 890 75 L 920 75 L 920 310 L 890 310" fill="none" stroke="#64748b" strokeWidth="3" strokeDasharray="5 4" strokeLinejoin="round" />
            <text x="940" y="195" fill="#64748b" fontSize="7" transform="rotate(90, 940, 195)" textAnchor="middle">EMERGENCY BYPASS RING</text>

            {/* ======================================================== */}
            {/* GIS NODES, PUMP HOUSES, TANKS & SENSORS                  */}
            {/* ======================================================== */}

            {/* Node: Water Treatment Plant (WTP) */}
            <g 
              transform="translate(90, 80)"
              style={{ cursor: 'pointer' }}
              onClick={() => handleNodeClick({
                id: 'WTP-01',
                name: 'Central Water Treatment Plant (WTP)',
                type: 'Purification & Raw Water Intake',
                diameter: 'DN800 Trunk Main',
                material: 'Mild Steel Mortar Lined',
                flow: 100.0,
                pressure: 3.4,
                loss: 0.0,
                status: 'OPERATIONAL',
              })}
            >
              <rect x="-35" y="-22" width="70" height="44" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
              <text x="0" y="-6" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">WTP PLANT</text>
              <text x="0" y="8" fill="#e2e8f0" fontSize="8" textAnchor="middle">Filter Stage 3</text>
              <circle cx="0" cy="16" r="3" fill="#10b981" />
            </g>

            {/* Node: Central Reservoir & Booster Pump Station */}
            <g 
              transform="translate(200, 190)"
              style={{ cursor: 'pointer' }}
              onClick={() => handleNodeClick({
                id: 'PUMP-CENTRAL',
                name: 'Main Municipal Pump Station & ESR-01',
                type: 'Variable Frequency Drive (VFD) Multi-Pump',
                diameter: 'DN600 Header',
                material: 'Ductile Iron Class K9',
                flow: 100.0,
                pressure: 3.2,
                loss: 0.0,
                status: 'RUNNING @ 100 L/s',
              })}
            >
              <circle cx="0" cy="0" r="28" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" filter="url(#glow)" />
              <circle cx="0" cy="0" r="22" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.5" />
              <Droplets size={16} color="#38bdf8" style={{ transform: 'translate(-8px, -14px)' }} />
              <text x="0" y="8" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">PUMP 100</text>
              <text x="0" y="17" fill="#94a3b8" fontSize="7" textAnchor="middle">3.20 bar</text>
            </g>

            {/* Junction J0 (Main Manifold) */}
            <g 
              transform="translate(370, 190)"
              style={{ cursor: 'pointer' }}
              onClick={() => handleNodeClick({
                id: 'JUNC-J0',
                name: 'Primary Distribution Manifold (Junction J0)',
                type: 'Hydraulic Tee Distribution Node',
                diameter: 'DN600 -> 3x DN350',
                material: 'Ductile Iron K9',
                flow: 100.0,
                pressure: 3.18,
                loss: 0.0,
                status: 'BALANCED',
              })}
            >
              <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
              <text x="0" y="4" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">J0</text>
            </g>

            {/* ======================================================== */}
            {/* VALVES WITH ON-CLICK TOGGLE & HOVER                       */}
            {/* ======================================================== */}

            {/* Valve 4 (Residential Sector DMA-01 Isolation) */}
            <g 
              transform="translate(480, 75)"
              style={{ cursor: onToggleValve ? 'pointer' : 'default' }}
              onClick={() => onToggleValve && onToggleValve('Valve 4', v4Status)}
            >
              <circle cx="0" cy="0" r="16" fill="#0f172a" stroke={getValveColor(v4Status)} strokeWidth="2" />
              <polygon points="-8,8 8,16 -8,16 8,8" fill={getValveColor(v4Status)} stroke="#090d16" strokeWidth="1" />
              <text x="0" y="-12" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">Valve 4</text>
              <text x="0" y="27" fill={getValveColor(v4Status)} fontSize="8" fontWeight="bold" textAnchor="middle">[{v4Status}]</text>
            </g>

            {/* Valve 3 (Commercial Sector DMA-02 Isolation) */}
            <g 
              transform="translate(480, 190)"
              style={{ cursor: onToggleValve ? 'pointer' : 'default' }}
              onClick={() => onToggleValve && onToggleValve('Valve 3', v3Status)}
            >
              <circle cx="0" cy="0" r="16" fill="#0f172a" stroke={getValveColor(v3Status)} strokeWidth="2" />
              <polygon points="-8,8 8,16 -8,16 8,8" fill={getValveColor(v3Status)} stroke="#090d16" strokeWidth="1" />
              <text x="0" y="-12" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">Valve 3</text>
              <text x="0" y="27" fill={getValveColor(v3Status)} fontSize="8" fontWeight="bold" textAnchor="middle">[{v3Status}]</text>
            </g>

            {/* Valve 1 (Primary Industrial Isolation) */}
            <g 
              transform="translate(450, 310)"
              style={{ cursor: onToggleValve ? 'pointer' : 'default' }}
              onClick={() => onToggleValve && onToggleValve('Valve 1', v1Status)}
            >
              <circle cx="0" cy="0" r="16" fill="#0f172a" stroke={getValveColor(v1Status)} strokeWidth="2" />
              <polygon points="-8,8 8,16 -8,16 8,8" fill={getValveColor(v1Status)} stroke="#090d16" strokeWidth="1" />
              <text x="0" y="-12" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">Valve 1 (Pri)</text>
              <text x="0" y="27" fill={getValveColor(v1Status)} fontSize="8" fontWeight="bold" textAnchor="middle">[{v1Status}]</text>
            </g>

            {/* Valve 2 (Secondary Redundant Backup) */}
            <g 
              transform="translate(680, 310)"
              style={{ cursor: onToggleValve ? 'pointer' : 'default' }}
              onClick={() => onToggleValve && onToggleValve('Valve 2', v2Status)}
            >
              <circle cx="0" cy="0" r="16" fill="#0f172a" stroke={getValveColor(v2Status)} strokeWidth="2" />
              <polygon points="-8,8 8,16 -8,16 8,8" fill={getValveColor(v2Status)} stroke="#090d16" strokeWidth="1" />
              <text x="0" y="-12" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">Valve 2 (Sec)</text>
              <text x="0" y="27" fill={getValveColor(v2Status)} fontSize="8" fontWeight="bold" textAnchor="middle">[{v2Status}]</text>
            </g>

            {/* ======================================================== */}
            {/* ANOMALY VISUALIZERS: THEFT SIPHON & BURST RUPTURE        */}
            {/* ======================================================== */}

            {/* WATER THEFT IN COMMERCIAL SECTOR (Zone 2) */}
            <g transform="translate(640, 190)">
              {isTheft ? (
                <>
                  <line x1="0" y1="0" x2="0" y2="40" stroke="#ef4444" strokeWidth="4" strokeDasharray="4 2">
                    <animate attributeName="stroke-dashoffset" values="12;0" dur="0.8s" repeatCount="indefinite" />
                  </line>
                  <circle cx="0" cy="0" r="7" fill="#ef4444" />
                  <rect x="-55" y="40" width="110" height="32" rx="4" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="0" y="53" fill="#fca5a5" fontSize="8" fontWeight="bold" textAnchor="middle">⚠️ ILLEGAL TAP POINT</text>
                  <text x="0" y="65" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">-18.0 L/s SIPHONED</text>
                </>
              ) : (
                <circle cx="0" cy="0" r="4" fill="#10b981" />
              )}
            </g>

            {/* BURST RUPTURE IN INDUSTRIAL SECTOR (Zone 3) */}
            <g transform="translate(560, 310)">
              {isLeak ? (
                <>
                  <circle cx="0" cy="0" r="22" fill="#ef4444" opacity="0.3">
                    <animate attributeName="r" values="12;26;12" dur="1s" repeatCount="indefinite" />
                  </circle>
                  <path d="M -8 -8 L 8 8 M 8 -8 L -8 8" stroke="#ef4444" strokeWidth="3" />
                  <rect x="-60" y="-45" width="120" height="28" rx="4" fill="#991b1b" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="0" y="-33" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">💥 CRITICAL PIPE BURST</text>
                  <text x="0" y="-22" fill="#fecaca" fontSize="8" textAnchor="middle">-30.0 L/s Flow Loss</text>
                </>
              ) : (
                <circle cx="0" cy="0" r="4" fill="#10b981" />
              )}
            </g>

            {/* Sensor Telemetry Badges on Sectors */}
            {/* Zone 1 Meter */}
            <g 
              transform="translate(750, 75)"
              style={{ cursor: 'pointer' }}
              onClick={() => handleNodeClick({
                id: 'METER-Z1',
                name: 'Zone 1: Residential Sector Meter (DMA-01)',
                type: 'Electromagnetic Ultrasonic Flowmeter',
                diameter: 'DN300 Feeder',
                material: 'HDPE PE100 PN16',
                flow: 35.0,
                pressure: 3.10,
                loss: 0.8,
                status: 'NOMINAL CONSUMPTION',
                valve: { id: 'Valve 4', status: v4Status }
              })}
            >
              <rect x="-35" y="-18" width="70" height="36" rx="4" fill="#0f172a" stroke="#34d399" strokeWidth="1.5" />
              <text x="0" y="-4" fill="#34d399" fontSize="9" fontWeight="bold" textAnchor="middle">35.0 L/s</text>
              <text x="0" y="9" fill="#94a3b8" fontSize="8" textAnchor="middle">3.10 bar</text>
            </g>

            {/* Zone 2 Meter */}
            <g 
              transform="translate(770, 190)"
              style={{ cursor: 'pointer' }}
              onClick={() => handleNodeClick({
                id: 'METER-Z2',
                name: 'Zone 2: Commercial Sector Meter (DMA-02)',
                type: 'Smart AMR/AMI SCADA Node',
                diameter: 'DN350 Feeder',
                material: 'Ductile Iron K9',
                flow: isTheft ? 7.0 : 24.5,
                pressure: 2.85,
                loss: isTheft ? 18.0 : 0.5,
                status: isTheft ? 'THEFT / ILLEGAL SIPHONING' : 'NOMINAL',
                valve: { id: 'Valve 3', status: v3Status }
              })}
            >
              <rect x="-35" y="-18" width="70" height="36" rx="4" fill="#0f172a" stroke={isTheft ? '#f59e0b' : '#38bdf8'} strokeWidth="1.5" />
              <text x="0" y="-4" fill={isTheft ? '#fbbf24' : '#38bdf8'} fontSize="9" fontWeight="bold" textAnchor="middle">{isTheft ? '7.0 L/s' : '24.5 L/s'}</text>
              <text x="0" y="9" fill="#94a3b8" fontSize="8" textAnchor="middle">2.85 bar</text>
            </g>

            {/* Zone 3 Meter */}
            <g 
              transform="translate(790, 310)"
              style={{ cursor: 'pointer' }}
              onClick={() => handleNodeClick({
                id: 'METER-Z3',
                name: 'Zone 3: Industrial SEZ Meter (DMA-03)',
                type: 'Differential Pressure Orifice & Ultrasonic Meter',
                diameter: 'DN400 High Pressure Main',
                material: 'API 5L Carbon Steel / Epoxy Lined',
                flow: isLeak ? 10.0 : 38.5,
                pressure: isLeak ? 1.60 : 3.15,
                loss: isLeak ? 30.0 : 1.5,
                status: isLeak ? 'BURST LEAK DETECTED' : 'NOMINAL',
                valve: { id: 'Valve 1', status: v1Status }
              })}
            >
              <rect x="-35" y="-18" width="70" height="36" rx="4" fill="#0f172a" stroke={isLeak ? '#ef4444' : '#a855f7'} strokeWidth="1.5" />
              <text x="0" y="-4" fill={isLeak ? '#f87171' : '#c084fc'} fontSize="9" fontWeight="bold" textAnchor="middle">{isLeak ? '10.0 L/s' : '38.5 L/s'}</text>
              <text x="0" y="9" fill="#94a3b8" fontSize="8" textAnchor="middle">{isLeak ? '1.60 bar' : '3.15 bar'}</text>
            </g>
          </svg>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: DETAILED SCADA P&ID SCHEMATIC VIEW               */}
        {/* ======================================================== */}
        {viewMode === 'schematic' && (
          <svg width="100%" height="100%" viewBox="0 0 920 310" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="mainWaterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>

              <pattern id="flowPattern" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M 0 10 Q 10 5, 20 10 T 40 10" fill="none" stroke="#e0f2fe" strokeWidth="2.5" opacity="0.65">
                  <animate attributeName="d" dur="0.9s" repeatCount="indefinite"
                    values="M 0 10 Q 10 5, 20 10 T 40 10; M 0 10 Q 10 15, 20 10 T 40 10; M 0 10 Q 10 5, 20 10 T 40 10" />
                </path>
              </pattern>
            </defs>

            {/* Central Reservoir Tank */}
            <g transform="translate(45, 120)">
              <rect x="-35" y="-55" width="70" height="110" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
              <rect x="-32" y="-20" width="64" height="72" rx="3" fill="url(#mainWaterGrad)" opacity="0.8" />
              <text x="0" y="-35" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">CENTRAL</text>
              <text x="0" y="-23" fill="#e2e8f0" fontSize="9" fontWeight="600" textAnchor="middle">RESERVOIR</text>
              <text x="0" y="15" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">10,000 kL</text>
              <text x="0" y="30" fill="#94a3b8" fontSize="8" textAnchor="middle">P_head: 3.2 bar</text>

              <circle cx="65" cy="0" r="18" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
              <text x="65" y="4" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="middle">PUMP</text>
              <text x="65" y="30" fill="#94a3b8" fontSize="8" textAnchor="middle">100 L/s</text>
            </g>

            {/* Main Feed Pipe */}
            <rect x="130" y="112" width="110" height="16" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <rect x="130" y="114" width="110" height="12" fill="url(#mainWaterGrad)" opacity="0.85" />
            <rect x="130" y="114" width="110" height="12" fill="url(#flowPattern)" />

            {/* Header J0 */}
            <g transform="translate(240, 120)">
              <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
              <text x="0" y="4" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">J0</text>
              <text x="0" y="-18" fill="#e2e8f0" fontSize="9" fontWeight="bold" textAnchor="middle">Main Header</text>
              <text x="0" y="25" fill="#38bdf8" fontSize="8" fontWeight="600" textAnchor="middle">100 L/s</text>
            </g>

            <rect x="234" y="45" width="12" height="180" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <rect x="236" y="45" width="8" height="180" fill="url(#mainWaterGrad)" opacity="0.85" />

            {/* Branch 1: Zone 1 (Residential) */}
            <rect x="240" y="45" width="380" height="14" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            {v4Status === 'OPEN' && (
              <>
                <rect x="240" y="47" width="380" height="10" fill="url(#mainWaterGrad)" opacity="0.85" />
                <rect x="240" y="47" width="380" height="10" fill="url(#flowPattern)" />
              </>
            )}

            <g 
              transform="translate(380, 52)"
              style={{ cursor: onToggleValve ? 'pointer' : 'default' }}
              onClick={() => onToggleValve && onToggleValve('Valve 4', v4Status)}
            >
              <polygon points="-10,12 10,24 -10,24 10,12" fill={getValveColor(v4Status)} stroke="#0f172a" strokeWidth="1.5" />
              <rect x="-3" y="6" width="6" height="8" fill={getValveColor(v4Status)} />
              <text x="0" y="-4" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">Valve 4</text>
              <text x="0" y="36" fill={getValveColor(v4Status)} fontSize="9" fontWeight="bold" textAnchor="middle">[{v4Status}]</text>
            </g>

            <g transform="translate(510, 52)">
              <circle cx="0" cy="0" r="11" fill="#0f172a" stroke="#34d399" strokeWidth="2" />
              <text x="0" y="3" fill="#34d399" fontSize="8" fontWeight="bold" textAnchor="middle">F1</text>
              <text x="0" y="24" fill="#34d399" fontSize="9" fontWeight="600" textAnchor="middle">35.0 L/s</text>
              <text x="0" y="34" fill="#94a3b8" fontSize="8" textAnchor="middle">3.10 bar</text>
            </g>

            <g transform="translate(680, 52)">
              <rect x="0" y="-22" width="180" height="44" rx="6" fill="#1e293b" stroke="#34d399" strokeWidth="1.5" />
              <text x="10" y="-5" fill="#34d399" fontSize="11" fontWeight="bold">Zone 1: Residential Sector</text>
              <text x="10" y="10" fill="#cbd5e1" fontSize="9">Supply: 34.2 L/s • Loss: 0.8 L/s</text>
              <text x="10" y="20" fill="#64748b" fontSize="8">Homes, Schools, Domestic Grid</text>
            </g>

            {/* Branch 2: Zone 2 (Commercial) */}
            <rect x="240" y="112" width="380" height="14" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            {v3Status === 'OPEN' && (
              <>
                <rect x="240" y="114" width="380" height="10" fill="url(#mainWaterGrad)" opacity="0.85" />
                <rect x="240" y="114" width="380" height="10" fill="url(#flowPattern)" />
              </>
            )}

            <g 
              transform="translate(380, 119)"
              style={{ cursor: onToggleValve ? 'pointer' : 'default' }}
              onClick={() => onToggleValve && onToggleValve('Valve 3', v3Status)}
            >
              <polygon points="-10,12 10,24 -10,24 10,12" fill={getValveColor(v3Status)} stroke="#0f172a" strokeWidth="1.5" />
              <rect x="-3" y="6" width="6" height="8" fill={getValveColor(v3Status)} />
              <text x="0" y="-4" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">Valve 3</text>
              <text x="0" y="36" fill={getValveColor(v3Status)} fontSize="9" fontWeight="bold" textAnchor="middle">[{v3Status}]</text>
            </g>

            <g transform="translate(480, 119)">
              {isTheft ? (
                <>
                  <path d="M0,7 L0,35 L40,35" stroke="#ef4444" strokeWidth="3" fill="none" strokeDasharray="4 2">
                    <animate attributeName="stroke-dashoffset" values="12;0" dur="0.8s" repeatCount="indefinite" />
                  </path>
                  <circle cx="0" cy="7" r="6" fill="#ef4444" />
                  <rect x="45" y="24" width="90" height="24" rx="4" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="90" y="36" fill="#fca5a5" fontSize="8" fontWeight="bold" textAnchor="middle">ILLEGAL TAP</text>
                  <text x="90" y="45" fill="#ffffff" fontSize="7" textAnchor="middle">-18.0 L/s Siphoned</text>
                </>
              ) : (
                <circle cx="0" cy="0" r="4" fill="#10b981" />
              )}
            </g>

            <g transform="translate(560, 119)">
              <circle cx="0" cy="0" r="11" fill="#0f172a" stroke="#fbbf24" strokeWidth="2" />
              <text x="0" y="3" fill="#fbbf24" fontSize="8" fontWeight="bold" textAnchor="middle">F2</text>
              <text x="0" y="24" fill="#fbbf24" fontSize="9" fontWeight="600" textAnchor="middle">{isTheft ? '7.0 L/s' : '24.5 L/s'}</text>
              <text x="0" y="34" fill="#94a3b8" fontSize="8" textAnchor="middle">2.85 bar</text>
            </g>

            <g transform="translate(680, 119)">
              <rect x="0" y="-22" width="180" height="44" rx="6" fill="#1e293b" stroke={isTheft ? '#ef4444' : '#fbbf24'} strokeWidth={1.5} />
              <text x="10" y="-5" fill={isTheft ? '#f87171' : '#fbbf24'} fontSize="11" fontWeight="bold">Zone 2: Commercial District</text>
              <text x="10" y="10" fill="#cbd5e1" fontSize="9">{isTheft ? '⚠️ Unmetered Siphoning: 18 L/s' : 'Delivered: 24.5 L/s • Loss: 0.5 L/s'}</text>
              <text x="10" y="20" fill="#64748b" fontSize="8">Hospitals, Shopping Malls</text>
            </g>

            {/* Branch 3: Zone 3 (Industrial) */}
            <rect x="240" y="185" width="380" height="14" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            {v1Status === 'OPEN' && v2Status === 'OPEN' && (
              <>
                <rect x="240" y="187" width="380" height="10" fill="url(#mainWaterGrad)" opacity="0.85" />
                <rect x="240" y="187" width="380" height="10" fill="url(#flowPattern)" />
              </>
            )}

            <g 
              transform="translate(320, 192)"
              style={{ cursor: onToggleValve ? 'pointer' : 'default' }}
              onClick={() => onToggleValve && onToggleValve('Valve 1', v1Status)}
            >
              <polygon points="-10,12 10,24 -10,24 10,12" fill={getValveColor(v1Status)} stroke="#0f172a" strokeWidth="1.5" />
              <rect x="-3" y="6" width="6" height="8" fill={getValveColor(v1Status)} />
              <text x="0" y="-4" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">Valve 1 (Pri)</text>
              <text x="0" y="36" fill={getValveColor(v1Status)} fontSize="9" fontWeight="bold" textAnchor="middle">[{v1Status}]</text>
            </g>

            <g transform="translate(420, 192)">
              {isLeak && (
                <>
                  <circle cx="0" cy="0" r="16" fill="#ef4444" opacity="0.3">
                    <animate attributeName="r" values="8;20;8" dur="1s" repeatCount="indefinite" />
                  </circle>
                  <path d="M-6,-4 L6,14 M6,-4 L-6,14" stroke="#ef4444" strokeWidth="3" />
                  <path d="M0,12 L-8,30 L8,30 Z" fill="#ef4444" opacity="0.9" />
                  <text x="0" y="-10" fill="#f87171" fontSize="9" fontWeight="bold" textAnchor="middle">BURST RUPTURE</text>
                  <text x="0" y="42" fill="#fca5a5" fontSize="8" fontWeight="bold" textAnchor="middle">-30.0 L/s Loss</text>
                </>
              )}
              {!isLeak && <circle cx="0" cy="0" r="4" fill="#10b981" />}
            </g>

            <g 
              transform="translate(510, 192)"
              style={{ cursor: onToggleValve ? 'pointer' : 'default' }}
              onClick={() => onToggleValve && onToggleValve('Valve 2', v2Status)}
            >
              <polygon points="-10,12 10,24 -10,24 10,12" fill={getValveColor(v2Status)} stroke="#0f172a" strokeWidth="1.5" />
              <rect x="-3" y="6" width="6" height="8" fill={getValveColor(v2Status)} />
              <text x="0" y="-4" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">Valve 2 (Sec)</text>
              <text x="0" y="36" fill={getValveColor(v2Status)} fontSize="9" fontWeight="bold" textAnchor="middle">[{v2Status}]</text>
            </g>

            <g transform="translate(590, 192)">
              <circle cx="0" cy="0" r="11" fill="#0f172a" stroke="#f87171" strokeWidth="2" />
              <text x="0" y="3" fill="#f87171" fontSize="8" fontWeight="bold" textAnchor="middle">F3</text>
              <text x="0" y="24" fill={isLeak ? '#f87171' : '#34d399'} fontSize="9" fontWeight="600" textAnchor="middle">{isLeak ? '10.0 L/s' : '38.5 L/s'}</text>
              <text x="0" y="34" fill="#94a3b8" fontSize="8" textAnchor="middle">{isLeak ? '1.60 bar' : '3.15 bar'}</text>
            </g>

            <g transform="translate(680, 192)">
              <rect x="0" y="-22" width="180" height="44" rx="6" fill="#1e293b" stroke={isLeak ? '#ef4444' : '#38bdf8'} strokeWidth={1.5} />
              <text x="10" y="-5" fill={isLeak ? '#f87171' : '#38bdf8'} fontSize="11" fontWeight="bold">Zone 3: Industrial Sector</text>
              <text x="10" y="10" fill="#cbd5e1" fontSize="9">{isLeak ? '💥 Critical Rupture: 30 L/s Loss' : 'Supply: 38.5 L/s • Loss: 1.5 L/s'}</text>
              <text x="10" y="20" fill="#64748b" fontSize="8">Manufacturing, Power Plant, Refinery</text>
            </g>

            <path d="M 240 220 L 320 255 L 680 255" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 2" />
            <text x="460" y="270" fill="#64748b" fontSize="8" textAnchor="middle">Zone 4: Emergency Adaptive Bypass Line</text>
          </svg>
        )}
      </div>

      {/* Selected Node Detailed Inspection HUD (Pops up on node click) */}
      {selectedNode && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.85rem 1.15rem',
          backgroundColor: '#0c1322',
          border: '1px solid #0284c7',
          borderRadius: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={15} color="#38bdf8" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                {selectedNode.name} [{selectedNode.id}]
              </span>
              <span className="badge badge-normal" style={{ fontSize: '0.65rem' }}>
                {selectedNode.status}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
              Spec: {selectedNode.type} • Pipe: {selectedNode.diameter} ({selectedNode.material})
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>FLOW VELOCITY</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {selectedNode.flow.toFixed(1)} L/s
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>HYDRAULIC HEAD</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: selectedNode.pressure < 2.0 ? '#f87171' : '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                {selectedNode.pressure.toFixed(2)} bar
              </div>
            </div>

            {selectedNode.valve && onToggleValve && (
              <button
                onClick={() => onToggleValve(selectedNode.valve!.id, selectedNode.valve!.status)}
                style={{
                  background: selectedNode.valve.status === 'CLOSED' ? '#10b981' : '#ef4444',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.35rem 0.75rem',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {selectedNode.valve.status === 'CLOSED' ? <Unlock size={12} /> : <Lock size={12} />}
                <span>{selectedNode.valve.status === 'CLOSED' ? `Open ${selectedNode.valve.id}` : `Close ${selectedNode.valve.id}`}</span>
              </button>
            )}

            <button
              onClick={() => setSelectedNode(null)}
              style={{
                background: 'transparent',
                border: '1px solid #334155',
                borderRadius: '4px',
                padding: '0.25rem 0.5rem',
                color: '#94a3b8',
                fontSize: '0.7rem',
                cursor: 'pointer',
              }}
            >
              Close HUD
            </button>
          </div>
        </div>
      )}

      {/* Grid Status Legend & Sector Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
        {sensorData.zones?.map((zone) => (
          <div
            key={zone.id}
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '0.65rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>{zone.name.split(':')[0]}</span>
              <span
                className="badge"
                style={{
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.4rem',
                  backgroundColor:
                    zone.status === 'THEFT'
                      ? 'rgba(245, 158, 11, 0.2)'
                      : zone.status === 'LEAK'
                      ? 'rgba(239, 68, 68, 0.2)'
                      : zone.status === 'ISOLATED'
                      ? 'rgba(56, 189, 248, 0.2)'
                      : 'rgba(16, 185, 129, 0.2)',
                  color:
                    zone.status === 'THEFT'
                      ? '#fbbf24'
                      : zone.status === 'LEAK'
                      ? '#f87171'
                      : zone.status === 'ISOLATED'
                      ? '#38bdf8'
                      : '#34d399',
                  borderColor:
                    zone.status === 'THEFT'
                      ? '#f59e0b'
                      : zone.status === 'LEAK'
                      ? '#ef4444'
                      : zone.status === 'ISOLATED'
                      ? '#38bdf8'
                      : '#10b981',
                }}
              >
                {zone.status}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
              <span>Flow In / Out:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#f1f5f9' }}>{zone.flow_in.toFixed(1)} / {zone.flow_out.toFixed(1)} L/s</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
              <span>Line Pressure:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: zone.pressure < 2.0 ? '#f87171' : '#fbbf24' }}>{zone.pressure.toFixed(2)} bar</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.2rem' }}>
              <span>Actuator:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: getValveColor(zone.valveStatus), fontWeight: 600 }}>
                {zone.activeValve} ({zone.valveStatus})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

