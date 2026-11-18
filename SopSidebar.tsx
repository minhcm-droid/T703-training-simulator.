"use client";

import React from "react";
import { SOP_STEPS } from "@/data/sopSteps";
import { ProcessState } from "@/types/process";
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, UserCheck } from "lucide-react";

interface SopSidebarProps {
  state: ProcessState;
  currentStepIdx: number;
  onSelectStep: (idx: number) => void;
}

export default function SopSidebar({ state, currentStepIdx, onSelectStep }: SopSidebarProps) {
  const currentStep = SOP_STEPS[currentStepIdx];
  const isCurrentCompleted = currentStep.checkCondition(state);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-4 bg-slate-800/80 border-b border-slate-700 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
            BƯỚC {currentStep.stepCode} • {currentStep.phaseTitle}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-amber-300 font-medium">
            <UserCheck className="w-3.5 h-3.5" /> {currentStep.role}
          </span>
        </div>

        <h3 className="text-sm font-bold text-white leading-snug">{currentStep.titleVi}</h3>
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          {currentStep.detailVi}
        </p>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs">
            {isCurrentCompleted ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Đã đạt điều kiện bước này
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400">
                <Circle className="w-4 h-4 animate-pulse" /> Đang chờ thao tác trên PFD...
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentStepIdx === 0}
              onClick={() => onSelectStep(currentStepIdx - 1)}
              className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentStepIdx === SOP_STEPS.length - 1}
              onClick={() => onSelectStep(currentStepIdx + 1)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-semibold"
            >
              Tiếp theo <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {SOP_STEPS.map((step, index) => {
          const done = step.checkCondition(state);
          const active = index === currentStepIdx;
          return (
            <div
              key={step.id}
              onClick={() => onSelectStep(index)}
              className={`p-2.5 rounded-lg border cursor-pointer transition ${
                active
                  ? "bg-cyan-950/40 border-cyan-500"
                  : done
                  ? "bg-emerald-950/20 border-emerald-800/50 hover:border-emerald-700"
                  : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className={`w-4 h-4 shrink-0 mt-0.5 ${active ? "text-cyan-400" : "text-slate-600"}`} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-400">Step {step.stepCode}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">
                      {step.role}
                    </span>
                  </div>
                  <p className={`text-xs font-medium mt-0.5 ${active ? "text-white" : "text-slate-300"}`}>
                    {step.titleVi}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
