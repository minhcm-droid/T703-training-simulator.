"use client";

import React, { useEffect, useState } from "react";
import PfdCanvas from "@/components/PfdCanvas";
import DcsFaceplateModal from "@/components/DcsFaceplateModal";
import SopSidebar from "@/components/SopSidebar";
import SafetyPanel from "@/components/SafetyPanel";
import { INITIAL_PROCESS_STATE, stepSimulation } from "@/engine/processEngine";
import { SOP_STEPS } from "@/data/sopSteps";
import { HAZOP_DEVIATIONS } from "@/data/hazopData";
import { ControlMode, ProcessState } from "@/types/process";
import {
  Activity,
  AlertOctagon,
  Clock,
  FastForward,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

export default function SimulatorPage() {
  const [state, setState] = useState<ProcessState>(INITIAL_PROCESS_STATE);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [selectedValveId, setSelectedValveId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<"SOP" | "LIMITS" | "HAZOP">("SOP");

  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => stepSimulation(prev));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const handleToggleManualValve = (valveId: string) => {
    setState((prev) => ({
      ...prev,
      manualValves: {
        ...prev.manualValves,
        [valveId]: {
          ...prev.manualValves[valveId],
          open: !prev.manualValves[valveId].open,
        },
      },
    }));
  };

  const handleUpdateControlValve = (id: string, mode: ControlMode, sv: number, mv: number) => {
    setState((prev) => ({
      ...prev,
      controlValves: {
        ...prev.controlValves,
        [id]: {
          ...prev.controlValves[id],
          mode,
          sv,
          mv,
        },
      },
    }));
  };

  const handleTogglePump = (pumpId: string) => {
    setState((prev) => {
      const pump = prev.pumps[pumpId];
      if (!pump) return prev;
      if (prev.esd.i705Tripped && (pumpId === "P-702A" || pumpId === "P-711A")) {
        return prev;
      }
      return {
        ...prev,
        pumps: {
          ...prev.pumps,
          [pumpId]: {
            ...pump,
            running: !pump.running,
            tripped: false,
          },
        },
      };
    });
  };

  const handleResetEsd = () => {
    setState((prev) => ({
      ...prev,
      activeScenarioId: null,
      esd: {
        i705Tripped: false,
        i706Tripped: false,
        tripReason: null,
      },
      controlValves: {
        ...prev.controlValves,
        "FV-721": { ...prev.controlValves["FV-721"], esdClosed: false },
        "FIC-736": { ...prev.controlValves["FIC-736"], esdClosed: false },
        "FIC-712": { ...prev.controlValves["FIC-712"], esdClosed: false },
        "FIC-722": { ...prev.controlValves["FIC-722"], esdClosed: false },
      },
    }));
  };

  const handleTriggerScenario = (scenarioId: string) => {
    const scenario = HAZOP_DEVIATIONS.find((d) => d.id === scenarioId);
    if (scenario?.triggerScenario) {
      setState((prev) => scenario.triggerScenario!(prev));
    }
  };

  const highlightedIds = rightTab === "SOP" ? SOP_STEPS[currentStepIdx].highlightIds : [];
  const selectedControlValve = selectedValveId ? state.controlValves[selectedValveId] : null;

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#0f172a] text-slate-100 overflow-x-hidden">
      <header className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950 border border-cyan-700 rounded-lg">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold tracking-tight text-white">
              HDPE PLANT • SECTION 700: LOOP T-703 START-UP SIMULATOR
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              SOP: HD-W-7200-02-001 • Hexane Stripping Unit (T-703 / D-701 / E-703 / D-711)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-slate-300">Warmup: {state.warmupHours.toFixed(1)}h</span>
            <button
              onClick={() =>
                setState((p) => ({ ...p, timeAcceleration: p.timeAcceleration === 1 ? 300 : 1 }))
              }
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                state.timeAcceleration > 1
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <FastForward className="w-3 h-3" /> {state.timeAcceleration > 1 ? "x300 ON" : "x1"}
            </button>
          </div>

          <button
            onClick={handleResetEsd}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              state.esd.i705Tripped
                ? "bg-rose-600 border-rose-400 text-white animate-bounce"
                : "bg-emerald-950/60 border-emerald-700 text-emerald-300 hover:bg-emerald-900/60"
            }`}
          >
            {state.esd.i705Tripped ? (
              <>
                <AlertOctagon className="w-4 h-4" /> RESET ESD (I-705/I-706)
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" /> ESD I-705/I-706 OK
              </>
            )}
          </button>

          <button
            onClick={() => {
              setState(INITIAL_PROCESS_STATE);
              setCurrentStepIdx(0);
            }}
            title="Khởi động lại từ đầu"
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {state.activeAlarms.length > 0 && (
        <div className="px-4 py-1.5 bg-rose-950/90 border-b border-rose-800 flex items-center gap-3 overflow-x-auto text-xs">
          <span className="font-bold text-rose-300 shrink-0 animate-pulse">⚠️ ACTIVE ALARMS:</span>
          {state.activeAlarms.map((a) => (
            <span
              key={a.id}
              className="px-2 py-0.5 bg-rose-900/80 border border-rose-600 rounded text-rose-100 font-mono shrink-0"
            >
              [{a.tag}] {a.message}
            </span>
          ))}
        </div>
      )}

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-hidden">
        <div className="lg:col-span-8 h-[580px] lg:h-full">
          <PfdCanvas
            state={state}
            highlightedIds={highlightedIds}
            onToggleManualValve={handleToggleManualValve}
            onSelectControlValve={(id) => setSelectedValveId(id)}
            onTogglePump={handleTogglePump}
          />
        </div>

        <div className="lg:col-span-4 flex flex-col h-[600px] lg:h-full overflow-hidden">
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-2">
            <button
              onClick={() => setRightTab("SOP")}
              className={`py-1.5 rounded-lg text-xs font-bold transition ${
                rightTab === "SOP" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              1. Quy trình SOP
            </button>
            <button
              onClick={() => setRightTab("LIMITS")}
              className={`py-1.5 rounded-lg text-xs font-bold transition ${
                rightTab === "LIMITS" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              2. Giới hạn SOL
            </button>
            <button
              onClick={() => setRightTab("HAZOP")}
              className={`py-1.5 rounded-lg text-xs font-bold transition ${
                rightTab === "HAZOP" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              3. Xử lý Sự cố
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {rightTab === "SOP" && (
              <SopSidebar
                state={state}
                currentStepIdx={currentStepIdx}
                onSelectStep={setCurrentStepIdx}
              />
            )}
            {rightTab === "LIMITS" && (
              <SafetyPanel
                state={state}
                mode="LIMITS"
                onTriggerScenario={handleTriggerScenario}
              />
            )}
            {rightTab === "HAZOP" && (
              <SafetyPanel
                state={state}
                mode="HAZOP"
                onTriggerScenario={handleTriggerScenario}
              />
            )}
          </div>
        </div>
      </main>

      <DcsFaceplateModal
        valve={selectedControlValve}
        onClose={() => setSelectedValveId(null)}
        onUpdate={handleUpdateControlValve}
      />
    </div>
  );
}
