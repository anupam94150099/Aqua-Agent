import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// =========================================================================
// Minimal Pure Node.js ZIP Generator (PKZip Specification)
// =========================================================================
class SimpleZip {
  constructor() {
    this.files = [];
  }

  addFile(filename, content) {
    const data = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
    const compressed = zlib.deflateRawSync(data);
    const crc = this.calculateCRC32(data);
    this.files.push({
      name: filename.replace(/\\/g, '/'),
      uncompressedSize: data.length,
      compressedSize: compressed.length,
      compressedData: compressed,
      crc32: crc,
    });
  }

  calculateCRC32(buf) {
    let crc = ~0;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ ~0) >>> 0;
  }

  generateBuffer() {
    const localHeaders = [];
    const centralDirs = [];
    let offset = 0;

    for (const f of this.files) {
      const nameBuf = Buffer.from(f.name, 'utf8');

      // Local File Header (30 bytes + name + data)
      const lh = Buffer.alloc(30 + nameBuf.length);
      lh.writeUInt32LE(0x04034b50, 0); // Local header signature
      lh.writeUInt16LE(20, 4);          // Version needed (2.0)
      lh.writeUInt16LE(0, 6);           // General purpose bit flag
      lh.writeUInt16LE(8, 8);           // Compression method (8 = Deflate)
      lh.writeUInt16LE(0, 10);          // Last mod time
      lh.writeUInt16LE(0, 12);          // Last mod date
      lh.writeUInt32LE(f.crc32, 14);    // CRC-32
      lh.writeUInt32LE(f.compressedSize, 18);   // Compressed size
      lh.writeUInt32LE(f.uncompressedSize, 22); // Uncompressed size
      lh.writeUInt16LE(nameBuf.length, 26);     // File name length
      lh.writeUInt16LE(0, 28);                  // Extra field length
      nameBuf.copy(lh, 30);

      localHeaders.push(lh, f.compressedData);

      // Central Directory Header (46 bytes + name)
      const cd = Buffer.alloc(46 + nameBuf.length);
      cd.writeUInt32LE(0x02014b50, 0); // Central dir signature
      cd.writeUInt16LE(20, 4);          // Version made by
      cd.writeUInt16LE(20, 6);          // Version needed
      cd.writeUInt16LE(0, 8);           // General purpose bit flag
      cd.writeUInt16LE(8, 10);          // Compression method (Deflate)
      cd.writeUInt16LE(0, 12);          // Last mod time
      cd.writeUInt16LE(0, 14);          // Last mod date
      cd.writeUInt32LE(f.crc32, 16);    // CRC-32
      cd.writeUInt32LE(f.compressedSize, 20);   // Compressed size
      cd.writeUInt32LE(f.uncompressedSize, 24); // Uncompressed size
      cd.writeUInt16LE(nameBuf.length, 28);     // File name length
      cd.writeUInt16LE(0, 30);                  // Extra field length
      cd.writeUInt16LE(0, 32);                  // File comment length
      cd.writeUInt16LE(0, 34);                  // Disk number start
      cd.writeUInt16LE(0, 36);                  // Internal file attributes
      cd.writeUInt32LE(0, 38);                  // External file attributes
      cd.writeUInt32LE(offset, 42);             // Relative offset of local header
      nameBuf.copy(cd, 46);

      centralDirs.push(cd);
      offset += lh.length + f.compressedData.length;
    }

    const centralDirStart = offset;
    const centralDirSize = centralDirs.reduce((acc, b) => acc + b.length, 0);

    // End of Central Directory Record (22 bytes)
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0); // EOCD signature
    eocd.writeUInt16LE(0, 4);          // Number of this disk
    eocd.writeUInt16LE(0, 6);          // Disk with central dir
    eocd.writeUInt16LE(this.files.length, 8);  // Total entries on disk
    eocd.writeUInt16LE(this.files.length, 10); // Total entries
    eocd.writeUInt32LE(centralDirSize, 12);    // Central dir size
    eocd.writeUInt32LE(centralDirStart, 16);   // Offset of central dir
    eocd.writeUInt16LE(0, 20);                 // Comment length

    return Buffer.concat([...localHeaders, ...centralDirs, eocd]);
  }
}

// CRC32 Table
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c;
}

// =========================================================================
// PowerPoint XML Builders (16:9 12192000 x 6858000 EMU)
// =========================================================================
function buildSlideXML(slideData, slideIndex) {
  const { title, badge, subtitle, boxes } = slideData;

  const boxElements = boxes.map((box, idx) => {
    const x = box.x;
    const y = box.y;
    const cx = box.cx;
    const cy = box.cy;
    const bg = box.bg || '111827';
    const border = box.border || '38BDF8';
    const boxTitle = box.title || '';
    const points = box.points || [];

    const bulletsXML = points.map(p => `
      <a:p>
        <a:pPr lvl="0"><a:buChar char="▹"/></a:pPr>
        <a:r>
          <a:rPr lang="en-US" sz="1300" b="0"><a:solidFill><a:srgbClr val="D1D5DB"/></a:solidFill><a:latin typeface="Inter"/></a:rPr>
          <a:t>${escapeXML(p)}</a:t>
        </a:r>
      </a:p>
    `).join('');

    return `
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="${10 + idx}" name="Box_${idx}"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="${x}" y="${y}"/>
            <a:ext cx="${cx}" cy="${cy}"/>
          </a:xfrm>
          <a:prstGeom prst="roundRect">
            <a:avLst><a:gd name="adj" fmla="val 2500"/></a:avLst>
          </a:prstGeom>
          <a:solidFill><a:srgbClr val="${bg}"/></a:solidFill>
          <a:ln w="25400"><a:solidFill><a:srgbClr val="${border}"/></a:solidFill></a:ln>
        </p:spPr>
        <p:txBody>
          <a:bodyPr lIns="182880" rIns="182880" tIns="182880" bIns="182880"/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="1600" b="1"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:latin typeface="Inter"/></a:rPr>
              <a:t>${escapeXML(boxTitle)}</a:t>
            </a:r>
          </a:p>
          <a:p><a:endParaRPr sz="600"/></a:p>
          ${bulletsXML}
        </p:txBody>
      </p:sp>
    `;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg>
      <p:bgPr>
        <a:solidFill><a:srgbClr val="090D16"/></a:solidFill>
        <a:effectLst/>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>

      <!-- Badge -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Badge"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="800000" y="450000"/><a:ext cx="4000000" cy="350000"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/>
        </p:spPr>
        <p:txBody>
          <a:bodyPr lIns="0" rIns="0" tIns="0" bIns="0"/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="1100" b="1"><a:solidFill><a:srgbClr val="38BDF8"/></a:solidFill><a:latin typeface="JetBrains Mono"/></a:rPr>
              <a:t>${escapeXML(badge)}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>

      <!-- Title -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Title"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="800000" y="780000"/><a:ext cx="10500000" cy="700000"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/>
        </p:spPr>
        <p:txBody>
          <a:bodyPr lIns="0" rIns="0" tIns="0" bIns="0"/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="2800" b="1"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:latin typeface="Inter"/></a:rPr>
              <a:t>${escapeXML(title)}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>

      <!-- Subtitle -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="4" name="Subtitle"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="800000" y="1480000"/><a:ext cx="10500000" cy="400000"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/>
        </p:spPr>
        <p:txBody>
          <a:bodyPr lIns="0" rIns="0" tIns="0" bIns="0"/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="1300" b="0"><a:solidFill><a:srgbClr val="9CA3AF"/></a:solidFill><a:latin typeface="Inter"/></a:rPr>
              <a:t>${escapeXML(subtitle)}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>

      <!-- Boxes / Cards -->
      ${boxElements}

      <!-- Footer -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="5" name="Footer"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="800000" y="6250000"/><a:ext cx="10500000" cy="300000"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/>
        </p:spPr>
        <p:txBody>
          <a:bodyPr lIns="0" rIns="0" tIns="0" bIns="0"/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="950" b="0"><a:solidFill><a:srgbClr val="64748B"/></a:solidFill><a:latin typeface="Inter"/></a:rPr>
              <a:t>AquaAgent • Autonomous Smart Water Infrastructure Control • Slide ${slideIndex + 1} of 8</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>

    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
}

function escapeXML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// 8 Slides Data Definition
const SLIDES = [
  {
    badge: 'AUTONOMOUS AGENTIC IOT SOLUTION',
    title: 'AquaAgent',
    subtitle: 'Autonomous AI Agent for Smart Water Leakage Detection & Real-Time Adaptive Response',
    boxes: [
      {
        x: 800000, y: 2200000, cx: 3300000, cy: 3700000,
        bg: '111827', border: '38BDF8',
        title: '🤖 Real Agentic AI',
        points: [
          'Closed-loop control loop: OBSERVE → DECIDE → ACT → EVALUATE → ADAPT.',
          'Dynamic re-planning when hardware actuators jam or fail.',
          'Maintains persistent episodic memory and audit logs.',
        ]
      },
      {
        x: 4400000, y: 2200000, cx: 3300000, cy: 3700000,
        bg: '111827', border: 'A855F7',
        title: '⚡ 100% TS/JS Stack',
        points: [
          'Zero Python dependencies.',
          'Node.js & Express async backend.',
          'React 18 + Vite + Recharts live frontend.',
          'ESP32 C++/Arduino IoT telemetry firmware.',
        ]
      },
      {
        x: 8000000, y: 2200000, cx: 3300000, cy: 3700000,
        bg: '111827', border: '10B981',
        title: '🛡️ Deterministic Safety',
        points: [
          '100% offline operational guarantee.',
          'Mass-balance conservation physics rules.',
          'Optional LLM tactical explanation layer without blackbox hazards.',
        ]
      },
    ]
  },
  {
    badge: 'THE GLOBAL WATER CRISIS',
    title: 'Problem: Water Loss & Fragile Automation',
    subtitle: 'Why traditional SCADA systems and static scripts fail during critical pipeline ruptures.',
    boxes: [
      {
        x: 800000, y: 2200000, cx: 5100000, cy: 3700000,
        bg: '111827', border: 'EF4444',
        title: '❌ The Non-Revenue Water (NRW) Crisis',
        points: [
          '20% to 40% Water Loss: Millions of liters lost to unseen underground bursts before manual detection.',
          'SCADA Alert Fatigue: Traditional systems trigger raw alarms without executing remedial action.',
          'Manual Response Delay: Field dispatch crews take hours to physically reach remote isolation valves.',
        ]
      },
      {
        x: 6200000, y: 2200000, cx: 5100000, cy: 3700000,
        bg: '111827', border: '38BDF8',
        title: '💡 Why Scripts Fail & Agents Succeed',
        points: [
          'No Verification: Scripts assume a valve closed successfully without checking post-action pressure.',
          'Crash on Jam: If Valve 1 mechanically jams, static automation crashes.',
          'AquaAgent Solution: Real-time autonomous agent that detects fault, re-plans to backup valves, and proves recovery.',
        ]
      }
    ]
  },
  {
    badge: 'THE AGENTIC LIFECYCLE',
    title: 'How AquaAgent Works: 6-Step Loop',
    subtitle: 'Autonomous progression from telemetry intake to verified physical hydraulic recovery.',
    boxes: [
      {
        x: 800000, y: 2200000, cx: 3300000, cy: 3700000,
        bg: '111827', border: '38BDF8',
        title: '1. OBSERVE & ANALYZE',
        points: [
          'Pulls live Inflow, Outflow, Line Pressure, and Valve states.',
          'Computes differential mass balance deficit: Loss = Flow_In - Flow_Out.',
          'Classifies severity: NORMAL, MEDIUM, or HIGH rupture.',
        ]
      },
      {
        x: 4400000, y: 2200000, cx: 3300000, cy: 3700000,
        bg: '111827', border: 'F59E0B',
        title: '2. DECIDE & ACT',
        points: [
          'Selects optimal isolation strategy.',
          'Executes commands strictly through typed Tool Registry.',
          'Dispatches motor-driven valve control (e.g. Valve 1 -> CLOSE).',
        ]
      },
      {
        x: 8000000, y: 2200000, cx: 3300000, cy: 3700000,
        bg: '111827', border: '10B981',
        title: '3. EVALUATE & ADAPT',
        points: [
          'Queries fresh telemetry via verifyRecovery().',
          'Checks pressure stabilization and loss reduction.',
          'If primary valve fails, AdaptationEngine switches to redundant backup Valve 2.',
        ]
      }
    ]
  },
  {
    badge: 'SYSTEM ENGINEERING',
    title: 'System Architecture & Clean Tech Stack',
    subtitle: 'Modular 3-tier architecture with full type safety and zero Python dependencies.',
    boxes: [
      {
        x: 800000, y: 2200000, cx: 3300000, cy: 3700000,
        bg: '111827', border: '38BDF8',
        title: '1. IoT Hardware (ESP32)',
        points: [
          'ESP32 NodeMCU Controller Node.',
          'Dual YF-S201 Pulse Flow Sensors.',
          '0-1.2 MPa Analog Pressure Transducer.',
          'HTTP REST JSON Telemetry Dispatch.',
        ]
      },
      {
        x: 4400000, y: 2200000, cx: 3300000, cy: 3700000,
        bg: '111827', border: 'A855F7',
        title: '2. Agent Core (Node.js)',
        points: [
          'AgentController (Loop Orchestrator).',
          'DecisionEngine & AdaptationEngine.',
          'Safe ToolRegistry with JSON Schemas.',
          'SQLite Persistent Audit Database.',
        ]
      },
      {
        x: 8000000, y: 2200000, cx: 3300000, cy: 3700000,
        bg: '111827', border: '10B981',
        title: '3. Operations UI (React)',
        points: [
          'React 18 + Vite + Tailwind/CSS.',
          'Server-Sent Events (SSE Live Stream).',
          'Dynamic SVG Pipeline Schematic.',
          'Real-time Recharts Telemetry Charts.',
        ]
      }
    ]
  },
  {
    badge: 'PHYSICS & ACTUATION BOUNDARY',
    title: 'Leakage Logic & Structured Tool Registry',
    subtitle: 'Mathematical thresholds driving safe, typed tool execution without blackbox hazards.',
    boxes: [
      {
        x: 800000, y: 2200000, cx: 5100000, cy: 3700000,
        bg: '111827', border: '38BDF8',
        title: '📐 Mathematical Decision Engine',
        points: [
          'Loss Percentage = (Flow_In - Flow_Out) / Flow_In',
          '🟢 NORMAL: Loss < 10% AND Pressure >= 2.5 bar (Monitor)',
          '🟡 MEDIUM: Loss >= 10% (Planned Valve Isolation)',
          '🔴 HIGH: Loss >= 25% OR Pressure < 2.0 bar (Emergency Isolation)',
        ]
      },
      {
        x: 6200000, y: 2200000, cx: 5100000, cy: 3700000,
        bg: '111827', border: 'A855F7',
        title: '⚙️ Typed Tool Registry',
        points: [
          'getSensorData(): Queries live flow & pressure readings.',
          'analyzeLeakage(): Computes mass balance and loss deficit.',
          'controlValve(id, action): Actuates isolation valves.',
          'verifyRecovery(): Verifies hydraulic pressure restoration.',
          'sendAlert(msg, severity): Dispatches emergency alerts.',
        ]
      }
    ]
  },
  {
    badge: 'FLAGSHIP CAPABILITY',
    title: 'Failure Detection + Dynamic Adaptation',
    subtitle: 'Demonstrating how AquaAgent autonomously recovers when physical actuators fail.',
    boxes: [
      {
        x: 800000, y: 2200000, cx: 5100000, cy: 3700000,
        bg: '111827', border: 'EF4444',
        title: 'Phase 1: Actuator Mechanical Jam',
        points: [
          'Acute Rupture: Flow In 100 L/s, Out 58 L/s, Pressure 1.6 bar.',
          'Agent analyzes HIGH severity and commands Valve 1 to close.',
          'Valve 1 mechanically jams and returns hardware fault error.',
          'Agent intercepts fault, emits FAILURE, and prevents crash.',
        ]
      },
      {
        x: 6200000, y: 2200000, cx: 5100000, cy: 3700000,
        bg: '111827', border: '10B981',
        title: 'Phase 2: Dynamic Re-Planning & Recovery',
        points: [
          'AdaptationEngine re-plans isolation using backup Valve 2.',
          'Valve 2 closes successfully -> pipe isolated.',
          'Agent executes verifyRecovery(): loss drops to 2.5%, pressure recovers to 3.15 bar.',
          'Final Outcome: ADAPTED_AND_RESOLVED.',
        ]
      }
    ]
  },
  {
    badge: 'FAIL-SAFE & QUALITY ASSURANCE',
    title: 'Fail-Safe Human Escalation & Testing',
    subtitle: 'Guaranteed safety boundaries and comprehensive automated test validation.',
    boxes: [
      {
        x: 800000, y: 2200000, cx: 5100000, cy: 3700000,
        bg: '111827', border: 'EF4444',
        title: '🚨 Both Valves Failed Protocol',
        points: [
          'Valve 1 fails -> Agent adapts to Valve 2 -> Valve 2 also fails.',
          'Agent recognizes automated isolation is physically impossible.',
          'Prevents infinite loops and dispatches emergency alert to field crews.',
          'Logs incident to SQLite database -> Status: ESCALATED.',
        ]
      },
      {
        x: 6200000, y: 2200000, cx: 5100000, cy: 3700000,
        bg: '111827', border: '38BDF8',
        title: '🧪 100% Vitest Automated Test Suite',
        points: [
          '✅ Normal baseline flow monitoring test.',
          '✅ Medium & High leak detection tests.',
          '✅ Actuator fault injection & handling tests.',
          '✅ Full Failure + Adaptation cycle test.',
          '✅ Multi-actuator failure human escalation test.',
        ]
      }
    ]
  },
  {
    badge: 'SUMMARY & PITCH CLOSE',
    title: 'AquaAgent: Impact & Future Roadmap',
    subtitle: 'Autonomous water infrastructure defense — saving clean water and preventing flooding.',
    boxes: [
      {
        x: 800000, y: 2200000, cx: 5100000, cy: 3700000,
        bg: '111827', border: '38BDF8',
        title: '🏆 Key Hackathon Achievements',
        points: [
          'Real Agentic AI: Closed-loop Observe-Decide-Act-Evaluate-Adapt.',
          '100% TypeScript/JS: Modern full-stack with zero Python.',
          'Fault-Tolerant: Self-healing on actuator mechanical jam.',
          'Hardware-Ready: Complete ESP32 C++ firmware included.',
        ]
      },
      {
        x: 6200000, y: 2200000, cx: 5100000, cy: 3700000,
        bg: '111827', border: 'A855F7',
        title: '🚀 Future Commercial Scope',
        points: [
          'LoRaWAN Mesh Network for long-range cross-country mains.',
          'Acoustic Hydrophone sensor integration for +-50cm pinpointing.',
          'Edge AI inference directly on ESP32-S3 microcontrollers.',
          'Thank You! Open for Live Demo & Judge Q&A.',
        ]
      }
    ]
  }
];

// =========================================================================
// Main Execution: Assemble PPTX
// =========================================================================
function generatePPTX() {
  console.log('[AquaAgent PPTX Generator] Assembling PowerPoint Presentation...');
  const zip = new SimpleZip();

  // 1. [Content_Types].xml
  const slideOverrides = SLIDES.map((_, i) =>
    `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
  ).join('');

  zip.addFile('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  ${slideOverrides}
</Types>`);

  // 2. _rels/.rels
  zip.addFile('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);

  // 3. ppt/_rels/presentation.xml.rels
  const slideRels = SLIDES.map((_, i) =>
    `<Relationship Id="rId${i + 4}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`
  ).join('');

  zip.addFile('ppt/_rels/presentation.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
  ${slideRels}
</Relationships>`);

  // 4. ppt/presentation.xml
  const sldIdLst = SLIDES.map((_, i) =>
    `<p:sldId id="${256 + i}" r:id="rId${i + 4}"/>`
  ).join('');

  zip.addFile('ppt/presentation.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    ${sldIdLst}
  </p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`);

  // 5. ppt/theme/theme1.xml
  zip.addFile('ppt/theme/theme1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="AquaAgent Theme">
  <a:themeElements>
    <a:clrScheme name="AquaAgent">
      <a:dk1><a:srgbClr val="090D16"/></a:dk1>
      <a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="111827"/></a:dk2>
      <a:lt2><a:srgbClr val="F3F4F6"/></a:lt2>
      <a:accent1><a:srgbClr val="38BDF8"/></a:accent1>
      <a:accent2><a:srgbClr val="A855F7"/></a:accent2>
      <a:accent3><a:srgbClr val="10B981"/></a:accent3>
      <a:accent4><a:srgbClr val="EF4444"/></a:accent4>
      <a:accent5><a:srgbClr val="F59E0B"/></a:accent5>
      <a:accent6><a:srgbClr val="64748B"/></a:accent6>
      <a:hlink><a:srgbClr val="38BDF8"/></a:hlink>
      <a:folHlink><a:srgbClr val="A855F7"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="InterScheme">
      <a:majorFont><a:latin typeface="Inter"/></a:majorFont>
      <a:minorFont><a:latin typeface="Inter"/></a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="FormatScheme">
      <a:fillStyleLst><a:solidFill><a:srgbClr val="111827"/></a:solidFill></a:fillStyleLst>
      <a:lnStyleLst><a:ln w="12700"><a:solidFill><a:srgbClr val="1F2937"/></a:solidFill></a:ln></a:lnStyleLst>
      <a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
      <a:bgFillStyleLst><a:solidFill><a:srgbClr val="090D16"/></a:solidFill></a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
</a:theme>`);

  // 6. ppt/slideMasters/slideMaster1.xml
  zip.addFile('ppt/slideMasters/slideMaster1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
             xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
             xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="090D16"/></a:solidFill></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="dk1" tx1="lt1" bg2="dk2" tx2="lt2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
  </p:sldLayoutIdLst>
</p:sldMaster>`);

  zip.addFile('ppt/slideMasters/_rels/slideMaster1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`);

  // 7. ppt/slideLayouts/slideLayout1.xml
  zip.addFile('ppt/slideLayouts/slideLayout1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
             xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
             xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    </p:spTree>
  </p:cSld>
</p:sldLayout>`);

  zip.addFile('ppt/slideLayouts/_rels/slideLayout1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`);

  // 8. Individual Slides
  SLIDES.forEach((slide, idx) => {
    zip.addFile(`ppt/slides/slide${idx + 1}.xml`, buildSlideXML(slide, idx));
    zip.addFile(`ppt/slides/_rels/slide${idx + 1}.xml.rels`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);
  });

  // Generate buffer
  const pptxBuffer = zip.generateBuffer();

  const outPath = path.resolve('c:/Users/Asus/Desktop/AquaAgent/AquaAgent_Presentation.pptx');
  fs.writeFileSync(outPath, pptxBuffer);
  console.log(`[AquaAgent PPTX Generator] SUCCESS! PowerPoint created at: ${outPath} (${pptxBuffer.length} bytes)`);
}

generatePPTX();
