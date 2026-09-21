import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import DashboardPage from './pages/DashboardPage';
import LiveNetworkPage from './pages/LiveNetworkPage';
import AIAgentPage from './pages/AIAgentPage';
import IncidentsPage from './pages/IncidentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SystemLogsPage from './pages/SystemLogsPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import WhyAquaAgent from './components/WhyAquaAgent';
import AgentExplainabilityModal from './components/AgentExplainabilityModal';
import GuidedHackathonDemo from './components/GuidedHackathonDemo';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [status, setStatus] = useState(null);
  const [sensors, setSensors] = useState(null);
  const [network, setNetwork] = useState(null);
  const [agentState, setAgentState] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeScenario, setActiveScenario] = useState('NORMAL');
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [isPitchDemoOpen, setIsPitchDemoOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Data fetching loop
  const refreshAllData = useCallback(async () => {
    try {
      const [sysStatus, sensData, netData, agState, incData, logData] = await Promise.all([
        api.getSystemStatus(),
        api.getSensors(),
        api.getNetwork(),
        api.getAgentState(),
        api.getIncidents(),
        api.getLogs(),
      ]);

      setStatus(sysStatus);
      setSensors(sensData);
      setNetwork(netData);
      setAgentState(agState);
      setIncidents(incData);
      setLogs(logData);
      if (sysStatus.scenario) {
        setActiveScenario(sysStatus.scenario);
      }
    } catch (err) {
      console.warn('Telemetry polling error (backend starting up):', err);
    }
  }, []);

  // Poll telemetry every 1.2 seconds
  useEffect(() => {
    refreshAllData();
    const interval = setInterval(refreshAllData, 1200);
    return () => clearInterval(interval);
  }, [refreshAllData]);

  // Scenario Triggers
  const handleTriggerScenario = async (scenarioId) => {
    setIsExecuting(true);
    setActiveScenario(scenarioId);
    try {
      if (scenarioId === 'NORMAL') await api.triggerNormal();
      else if (scenarioId === 'LEAK') await api.triggerLeak();
      else if (scenarioId === 'VALVE1_FAILURE') await api.triggerValve1Failure();
      else if (scenarioId === 'ADAPT_RECOVER') await api.triggerAdaptRecover();
      else if (scenarioId === 'BOTH_FAILED') await api.triggerBothValvesFailed();
      await refreshAllData();
    } catch (err) {
      console.error('Scenario error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReset = async () => {
    setIsExecuting(true);
    try {
      await api.resetSimulation();
      setActiveScenario('NORMAL');
      await refreshAllData();
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStepAI = async () => {
    setIsExecuting(true);
    try {
      await api.stepSimulation();
      await refreshAllData();
    } catch (err) {
      console.error('Step AI error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleToggleValve = async (valveId) => {
    if (!network?.valves?.[valveId]) return;
    const current = network.valves[valveId].status;
    try {
      if (current === 'OPEN') {
        await api.closeValve(valveId);
      } else {
        await api.openValve(valveId);
      }
      await refreshAllData();
    } catch (err) {
      console.error('Toggle valve error:', err);
    }
  };

  const handleToggleOverride = async (enabled) => {
    try {
      await api.toggleOverride(enabled);
      await refreshAllData();
    } catch (err) {
      console.error('Toggle override error:', err);
    }
  };

  const handleReplan = async () => {
    try {
      await api.triggerReplan();
      await refreshAllData();
    } catch (err) {
      console.error('Replan error:', err);
    }
  };

  const handleVerify = async () => {
    try {
      await api.triggerVerify();
      await refreshAllData();
    } catch (err) {
      console.error('Verify error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1120] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Header */}
      <Header
        status={status}
        onReset={handleReset}
        onToggleOverride={handleToggleOverride}
        onOpenPitchMode={() => setIsPitchDemoOpen(true)}
        onStepLoop={handleStepAI}
      />

      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        incidentCount={status?.active_incidents_count || 0}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardPage
            status={status}
            sensors={sensors}
            network={network}
            agentState={agentState}
            activeScenario={activeScenario}
            onTriggerScenario={handleTriggerScenario}
            onReset={handleReset}
            onStepAI={handleStepAI}
            onToggleValve={handleToggleValve}
            onOpenExplain={() => setIsExplainModalOpen(true)}
            onReplan={handleReplan}
            onVerify={handleVerify}
          />
        )}

        {activeTab === 'network' && (
          <LiveNetworkPage
            network={network}
            sensors={sensors}
            onToggleValve={handleToggleValve}
            status={status}
          />
        )}

        {activeTab === 'agent' && (
          <AIAgentPage
            agentState={agentState}
            onOpenExplain={() => setIsExplainModalOpen(true)}
            onReplan={handleReplan}
            onVerify={handleVerify}
            onStepAI={handleStepAI}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentsPage incidents={incidents} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPage status={status} sensors={sensors} />
        )}

        {activeTab === 'logs' && (
          <SystemLogsPage logs={logs} />
        )}

        {activeTab === 'why' && (
          <div className="space-y-6">
            <WhyAquaAgent />
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            status={status}
            onToggleOverride={handleToggleOverride}
          />
        )}

        {activeTab === 'about' && (
          <AboutPage />
        )}
      </main>

      {/* Explainability Drawer/Modal */}
      <AgentExplainabilityModal
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
        explanation={agentState?.active_decision_explanation}
        agentState={agentState}
        sensors={sensors}
      />

      {/* 8-Step Guided Hackathon Presentation Mode */}
      <GuidedHackathonDemo
        isOpen={isPitchDemoOpen}
        onClose={() => setIsPitchDemoOpen(false)}
        onRefreshData={refreshAllData}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AquaAgent v2.4 • Autonomous Water Intelligence Platform</span>
          <span className="text-cyan-400 font-semibold">Global Innovation Hackathon 2026 Submission</span>
        </div>
      </footer>

    </div>
  );
}
