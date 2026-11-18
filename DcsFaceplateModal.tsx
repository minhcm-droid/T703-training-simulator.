"use client";

import React, { useState } from "react";
import { ControlMode, ControlValve } from "@/types/process";
import { Sliders, X } from "lucide-react";

interface DcsFaceplateModalProps {
  valve: ControlValve | null;
  onClose: () => void;
  onUpdate: (id: string, mode: ControlMode, sv: number, mv: number) => void;
}

export default function DcsFaceplateModal({ valve, onClose, onUpdate }: DcsFaceplateModalProps) {
  if (!valve) return null;

  const [mode, setMode] = useState<ControlMode>(valve.mode);
  const [sv, setSv] = useState<number>(valve.sv);
  const [mv, setMv] = useState<number>(valve.mv);

  const handleApply = () => {
    onUpdate(valve.id, mode, sv, mv);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-80 bg-slate-900 border-2 border-slate-600 rounded-xl shadow-2xl overflow-hidden text-slate-100">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="font-mono font-bold text-sm">{valve.tag} FACEPLATE</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-xs text-slate-400">{valve.name}</div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1">
              Control Mode (Chế độ)
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["MAN", "AUTO", "CAS"] as ControlMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-1.5 rounded text-xs font-bold border ${
                    mode === m
                      ? "bg-cyan-600 border-cyan-400 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded border border-slate-800">
            <span className="text-xs text-slate-400">PV (Giá trị đo):</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {valve.pv.toFixed(2)} {valve.unit}
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">SV (Giá trị đặt - {valve.unit}):</span>
              <span className="font-mono text-cyan-300">{sv}</span>
            </div>
            <input
              type="range"
              min={valve.minSv}
              max={valve.maxSv}
              step={0.1}
              value={sv}
              disabled={mode === "MAN"}
              onChange={(e) => setSv(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 disabled:opacity-40"
            />
            <input
              type="number"
              step={0.1}
              value={sv}
              disabled={mode === "MAN"}
              onChange={(e) => setSv(parseFloat(e.target.value) || 0)}
              className="mt-1 w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-cyan-300 disabled:opacity-40"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">MV (Độ mở van %):</span>
              <span className="font-mono text-amber-300">{mv}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={mv}
              disabled={mode !== "MAN"}
              onChange={(e) => setMv(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 disabled:opacity-40"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleApply}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition"
            >
              Xác nhận (Apply)
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
