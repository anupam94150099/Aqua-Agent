# 💧 AquaAgent - Concise 8-Slide Pitch Deck & Presentation Guide

> **Quick 5-Minute Hackathon Pitch Deck**
> 
> 💡 **PDF / Fullscreen Presentation**: Open **`docs/presentation.html`** in any browser and press **`Ctrl + P`** to export a clean 8-page PDF, or press **`F`** for fullscreen presentation mode!

---

## 📑 Slide-by-Slide Outline (8 Slides Total)

| Slide | Title | Key Talking Point / Message |
|:---:|---|---|
| **1** | **Title Slide** | AquaAgent: Autonomous AI Agent for Smart Water Leakage Detection & Response |
| **2** | **The Crisis & The Need** | 20–40% Water loss, SCADA alert fatigue, why static automation scripts fail on jammed valves |
| **3** | **The Agentic Loop** | 6-Stage Loop: `OBSERVE` → `ANALYZE` → `DECIDE` → `ACT` → `EVALUATE` → `ADAPT` |
| **4** | **Architecture & Tech Stack** | 3-Tier modular architecture: ESP32 IoT → Node.js/Express Core → React Dashboard (Zero Python) |
| **5** | **Leakage Logic & Tools** | Mass balance physics formula ($\text{Loss} = \text{Flow In} - \text{Flow Out}$) & Safe Tool Registry |
| **6** | **🔥 Flagship Demo: Failure + Adaptation** | Valve 1 Jam $\rightarrow$ Agent catches failure $\rightarrow$ Re-plans to Valve 2 $\rightarrow$ Recovers pipeline (`ADAPTED_AND_RESOLVED`) |
| **7** | **Fail-Safe Protocol & Testing** | Double valve failure $\rightarrow$ Human Emergency Escalation (`ESCALATED`) + 100% Vitest test suite |
| **8** | **Impact & Conclusion** | Summary of achievements, live dashboard demo, and open for Judge Q&A |

---

## 🎤 5-Minute Speaker Script (Slide by Slide)

### Slide 1: Introduction
> *"Good morning judges. We present **AquaAgent** — an autonomous agentic AI control system designed to detect, isolate, and adaptively recover from municipal water pipeline leakages in real-time with zero human delay."*

### Slide 2: The Problem
> *"Municipal grids lose over 30% of treated clean water annually to unseen underground bursts. Traditional SCADA alarms only alert operators; they don't take action. And if a script tries to close a valve that happens to be mechanically jammed, static automation crashes. We built AquaAgent to bring true closed-loop, self-healing intelligence to water infrastructure."*

### Slide 3: The 6-Step Agentic Cycle
> *"AquaAgent operates on an autonomous 6-step loop: It **Observes** flow and pressure telemetry, **Analyzes** mass balance deficits, **Decides** the optimal isolation valve, **Acts** through safe tools, **Evaluates** post-action pressure recovery, and **Adapts** dynamically if hardware fails."*

### Slide 4: Architecture & 100% TypeScript Stack
> *"Our system is 100% JavaScript and TypeScript with zero Python. We have an ESP32 IoT node streaming telemetry over HTTP, a Node.js Express backend managing the agent state machine and SQLite persistence, and a real-time React dashboard streaming events via Server-Sent Events."*

### Slide 5: Physics Logic & Tool Registry
> *"We use mass balance conservation: whenever flow outflow drops below inflow by more than 10%, a leak is detected. If loss exceeds 25% or pressure drops below 2.0 bar, it's classified as High severity. Every command runs through our typed Tool Registry, ensuring no blackbox hallucinations."*

### Slide 6: Flagship Demo — Failure & Autonomous Adaptation
> *"Here is our core innovation: When an acute pipe rupture happens, the agent commands Valve 1 to close. If Valve 1 mechanically jams, AquaAgent catches the fault, immediately triggers its Adaptation Engine, routes the command to redundant Valve 2, closes it, and verifies that pressure has fully normalized — reaching status **ADAPTED_AND_RESOLVED**."*

### Slide 7: Double Failure Protocol & Testing
> *"What if all valves fail? AquaAgent safely prevents infinite loops, triggers high-priority alerts to municipal dispatch crews, and logs the incident to SQLite. Everything is backed by a 100% passing Vitest test suite."*

### Slide 8: Conclusion & Live Demo
> *"AquaAgent delivers autonomous, fault-tolerant water defense — saving water, protecting infrastructure, and eliminating manual response delay. Thank you, and we are ready for the live demonstration and Q&A!"*

---

## 📥 PDF Export Instructions
1. Open `AquaAgent/docs/presentation.html` in Chrome or Edge.
2. Click **📥 Save as PDF** or press `Ctrl + P`.
3. Set **Layout: Landscape** & enable **Background graphics**.
4. Click **Save** $\rightarrow$ Exactly **8 clean, widescreen slides** in your PDF!
