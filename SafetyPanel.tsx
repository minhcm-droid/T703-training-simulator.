"use client";

import React, { useState } from "react";
import { HAZOP_DEVIATIONS, SAFE_OPERATING_LIMITS } from "@/data/hazopData";
import { ProcessState } from "@/types/process";
import { AlertTriangle, Flame, ShieldAlert } from "lucide-react";

interface SafetyPanelProps {
  state: ProcessState;
  mode: "LIMITS" | "HAZOP";
  onTriggerScenario: (scenarioId: string) => void;
}

export default function SafetyPanel({ state, mode, onTriggerScenario }: SafetyPanelProps) {
  const [selectedEq, setSelectedEq] = useState<string>("ALL");

  if (mode === "LIMITS") {
    return (
      <div className="h-full overflow-y-auto bg-slate-900 border border-slate-800 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-cyan-300 uppercase">
          <ShieldAlert className="w-4 h-4" /> Giới hạn vận hành an toàn (Safe Operating Limits)
        </div>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-[11px]">
              <th className="py-1.5">Tag</th>
              <th className="py-1.5">Hiện tại</th>
              <th className="py-1.5">Bình thường</th>
              <th className="py-1.5">L / H / HH</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {SAFE_OPERATING_LIMITS.map((item) => {
              const val = item.getCurrentValue(state);
              const isHigh = (item.hAlarm !== undefined && val >= item.hAlarm) || (item.hhEsd !== undefined && val >= item.hhEsd);
              const isLow = item.lAlarm !== undefined && val <= item.lAlarm;
              return (
                <tr key={item.tag} className="hover:bg-slate-800/40">
                  <td className="py-2 pr-2">
                    <div className="font-mono font-bold text-slate-200">{item.tag}</div>
                    <div className="text-[10px] text-slate-400">{item.parameter}</div>
                  </td>
                  <td className={`py-2 font-mono font-bold ${isHigh || isLow ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
                    {val.toFixed(1)} {item.unit}
                  </td>
                  <td className="py-2 font-mono text-slate-300">{item.normalRange}</td>
                  <td className="py-2 font-mono text-[10px] text-amber-300">
                    {item.lAlarm ?? "-"} / {item.hAlarm ?? "-"} / {item.hhEsd ?? "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  const equipments = ["ALL", ...Array.from(new Set(HAZOP_DEVIATIONS.map((d) => d.equipment)))];
  const filtered = selectedEq === "ALL" ? HAZOP_DEVIATIONS : HAZOP_DEVIATIONS.filter((d) => d.equipment === selectedEq);

  return (
    <div className="h-full flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-3 bg-slate-800/70 border-b border-slate-700 flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" /> Xử lý Sai lệch (HAZOP)
        </span>
        <select
          value={selectedEq}
          onChange={(e) => setSelectedEq(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
        >
          {equipments.map((eq) => (
            <option key={eq} value={eq}>
              Thiết bị: {eq}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filtered.map((dev) => (
          <div key={dev.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded">
                  {dev.equipment} • {dev.tag}
                </span>
                <h4 className="text-xs font-bold text-white mt-1">{dev.deviationVi}</h4>
              </div>
              {dev.triggerScenario && (
                <button
                  onClick={() => onTriggerScenario(dev.id)}
                  className="flex items-center gap-1 px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold rounded shrink-0"
                >
                  <Flame className="w-3 h-3" /> Giả lập lỗi
                </button>
              )}
            </div>

            <div className="text-[11px] space-y-1 text-slate-300">
              <p>
                <strong className="text-slate-400">Nguyên nhân:</strong> {dev.causeVi}
              </p>
              <p>
                <strong className="text-rose-400">Hậu quả:</strong> {dev.consequenceVi}
              </p>
              <div className="pt-1">
                <strong className="text-emerald-400">Hành động khắc phục:</strong>
                <ul className="list-disc list-inside text-slate-200 mt-0.5 space-y-0.5">
                  {dev.correctiveActionVi.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
