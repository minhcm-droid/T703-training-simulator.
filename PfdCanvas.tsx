"use client";

import React from "react";
import { ProcessState } from "@/types/process";

interface PfdCanvasProps {
  state: ProcessState;
  highlightedIds: string[];
  onToggleManualValve: (valveId: string) => void;
  onSelectControlValve: (valveId: string) => void;
  onTogglePump: (pumpId: string) => void;
}

export default function PfdCanvas({
  state,
  highlightedIds,
  onToggleManualValve,
  onSelectControlValve,
  onTogglePump,
}: PfdCanvasProps) {
  const isHighlighted = (id: string) => highlightedIds.includes(id);

  const flowTk703ToD701 = state.controlValves["FIC-713"].pv > 0.1;
  const flowTk702ToD701 = state.manualValves["V26"].open && state.manualValves["V14"].open;
  const flowD701ToT703 = state.controlValves["FIC-712"].pv > 0.1;
  const flowRefluxToT703 = state.controlValves["FIC-736"].pv > 0.1;
  const flowVaporOverhead = state.vessels["T-703"].temperature > 85 && state.controlValves["PV-721"].mv > 0;
  const flowReboilerLoop = state.pumps["P-705A"].running && state.manualValves["V20"].open && state.manualValves["V24"].open;
  const flowSteamE703 = state.controlValves["FV-721"].mv > 0 && !state.esd.i705Tripped;
  const flowT703ToD711 = state.controlValves["FIC-722"].pv > 0.1;
  const flowSteamE711 = state.controlValves["TIC-724"].mv > 0;
  const flowSteamD711 = state.manualValves["V25"].open;

  const renderManualValve = (id: string, x: number, y: number, vertical = false) => {
    const v = state.manualValves[id];
    if (!v) return null;
    const hl = isHighlighted(id);
    return (
      <g
        key={id}
        transform={`translate(${x}, ${y})`}
        onClick={() => onToggleManualValve(id)}
        className="cursor-pointer group"
      >
        {hl && (
          <circle r="16" fill="none" stroke="#facc15" strokeWidth="2.5" className="animate-ping" />
        )}
        <g transform={vertical ? "rotate(90)" : ""}>
          <polygon
            points="-8,-6 0,0 -8,6"
            fill={v.open ? "#22c55e" : "#ef4444"}
            stroke="#f8fafc"
            strokeWidth="1"
          />
          <polygon
            points="8,-6 0,0 8,6"
            fill={v.open ? "#22c55e" : "#ef4444"}
            stroke="#f8fafc"
            strokeWidth="1"
          />
        </g>
        <text
          y={vertical ? 4 : -10}
          x={vertical ? 14 : 0}
          textAnchor={vertical ? "start" : "middle"}
          className={`text-[10px] font-bold select-none ${
            hl ? "fill-yellow-300" : v.open ? "fill-emerald-300" : "fill-rose-400"
          }`}
        >
          {v.name}
        </text>
      </g>
    );
  };

  const renderControlValve = (id: string, x: number, y: number) => {
    const cv = state.controlValves[id];
    if (!cv) return null;
    const hl = isHighlighted(id);
    const isOpen = cv.mv > 0 && !cv.esdClosed;
    return (
      <g
        key={id}
        transform={`translate(${x}, ${y})`}
        onClick={() => onSelectControlValve(id)}
        className="cursor-pointer"
      >
        {hl && (
          <rect
            x="-22"
            y="-22"
            width="44"
            height="44"
            rx="6"
            fill="none"
            stroke="#facc15"
            strokeWidth="2.5"
            className="animate-pulse"
          />
        )}
        <path d="M -8 -12 A 8 8 0 0 1 8 -12 Z" fill={cv.mode === "AUTO" ? "#38bdf8" : "#f59e0b"} />
        <line x1="0" y1="-12" x2="0" y2="0" stroke="#cbd5e1" strokeWidth="1.5" />
        <polygon points="-9,-6 0,0 -9,6" fill={isOpen ? "#22c55e" : "#ef4444"} stroke="#fff" strokeWidth="1" />
        <polygon points="9,-6 0,0 9,6" fill={isOpen ? "#22c55e" : "#ef4444"} stroke="#fff" strokeWidth="1" />
        <rect x="-26" y="9" width="52" height="22" rx="3" fill="#0f172a" stroke={hl ? "#facc15" : "#475569"} strokeWidth="1" />
        <text y="18" textAnchor="middle" className="text-[8.5px] font-bold fill-slate-200 select-none">
          {cv.tag}
        </text>
        <text y="27" textAnchor="middle" className="text-[8px] fill-cyan-300 select-none">
          {cv.mode === "AUTO" ? `${cv.pv.toFixed(1)} ${cv.unit}` : `${cv.mv}%`}
        </text>
      </g>
    );
  };

  const renderPump = (id: string, x: number, y: number) => {
    const p = state.pumps[id];
    if (!p) return null;
    const hl = isHighlighted(id);
    const fill = p.cavitation ? "#f59e0b" : p.running ? "#22c55e" : "#ef4444";
    return (
      <g
        key={id}
        transform={`translate(${x}, ${y})`}
        onClick={() => onTogglePump(id)}
        className="cursor-pointer"
      >
        {hl && (
          <circle r="22" fill="none" stroke="#facc15" strokeWidth="2.5" className="animate-ping" />
        )}
        <rect x="0" y="-15" width="16" height="7" fill={fill} stroke="#fff" strokeWidth="1" />
        <circle r="15" fill={fill} stroke="#f8fafc" strokeWidth="1.5" />
        <g className={p.running ? "impeller-spin" : ""}>
          <line x1="-9" y1="0" x2="9" y2="0" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="0" y1="-9" x2="0" y2="9" stroke="#0f172a" strokeWidth="2.5" />
        </g>
        <text y="26" textAnchor="middle" className="text-[10px] font-bold fill-white select-none">
          {p.id}
        </text>
        <text y="36" textAnchor="middle" className="text-[8.5px] fill-amber-300 select-none">
          {p.cavitation ? "CAVITATION!" : p.running ? `${p.currentAmp}A` : "STOP"}
        </text>
      </g>
    );
  };

  const renderVessel = (
    id: string,
    x: number,
    y: number,
    w: number,
    h: number,
    liquidColor = "#a855f7",
    isTower = false
  ) => {
    const v = state.vessels[id];
    if (!v) return null;
    const hl = isHighlighted(id);
    const fillHeight = (Math.min(100, Math.max(0, v.level)) / 100) * (h - 8);
    return (
      <g key={id} transform={`translate(${x}, ${y})`}>
        {hl && (
          <rect
            x={-6}
            y={-6}
            width={w + 12}
            height={h + 12}
            rx={14}
            fill="none"
            stroke="#facc15"
            strokeWidth="2.5"
            className="animate-pulse"
          />
        )}
        <rect
          width={w}
          height={h}
          rx={isTower ? 22 : 12}
          fill="#1e293b"
          stroke="#94a3b8"
          strokeWidth="2"
        />
        {isTower &&
          [0.2, 0.3, 0.4, 0.5, 0.6].map((ratio, idx) => (
            <line
              key={idx}
              x1="6"
              y1={h * ratio}
              x2={w - 6}
              y2={h * ratio}
              stroke="#475569"
              strokeDasharray="4 2"
              strokeWidth="1.5"
            />
          ))}
        <rect
          x="4"
          y={h - 4 - fillHeight}
          width={w - 8}
          height={fillHeight}
          rx="6"
          fill={liquidColor}
          fillOpacity="0.65"
        />
        <text x={w / 2} y={18} textAnchor="middle" className="text-[11px] font-bold fill-white">
          {v.id}
        </text>
        <text x={w / 2} y={h / 2 + 4} textAnchor="middle" className="text-[11px] font-mono font-bold fill-emerald-300">
          {v.level.toFixed(1)}%
        </text>
        <text x={w / 2} y={h / 2 + 17} textAnchor="middle" className="text-[9.5px] font-mono fill-amber-200">
          {v.temperature.toFixed(0)}°C
        </text>
        {v.pressTag && (
          <text x={w / 2} y={h / 2 + 29} textAnchor="middle" className="text-[9px] font-mono fill-cyan-300">
            {v.pressure.toFixed(2)}k
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="w-full h-full bg-[#0b1120] border border-slate-800 rounded-xl overflow-auto flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-purple-300">
            <span className="w-4 h-1 bg-purple-500 inline-block rounded" /> Hexane / ML Liquid
          </span>
          <span className="flex items-center gap-1.5 text-emerald-300">
            <span className="w-4 h-1 bg-emerald-400 inline-block rounded" /> Hexane Vapor
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-4 h-1 bg-amber-500 inline-block rounded" /> Steam (LS/MS/HS) & Condensate
          </span>
        </div>
        <div className="text-slate-400">
          💡 Click <strong className="text-slate-200">Van tay</strong> để Đóng/Mở • Click{" "}
          <strong className="text-slate-200">Bơm</strong> để Start/Stop • Click{" "}
          <strong className="text-slate-200">Van điều khiển</strong> để mở Faceplate
        </div>
      </div>

      <div className="flex-1 min-w-[1050px] min-h-[620px] p-2">
        <svg viewBox="0 0 1120 640" className="w-full h-full">
          <path
            d="M 85 450 L 85 520 L 210 520"
            fill="none"
            stroke="#a855f7"
            strokeWidth="3.5"
            className={flowTk703ToD701 ? "pipe-flow" : ""}
          />
          <line x1="175" y1="520" x2="175" y2="495" stroke="#a855f7" strokeWidth="2" />
          <path
            d="M 225 505 L 225 360 L 340 360 L 340 280"
            fill="none"
            stroke="#a855f7"
            strokeWidth="3.5"
            className={flowTk703ToD701 ? "pipe-flow" : ""}
          />
          <path d="M 275 360 L 275 110 L 660 110" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" />

          <path
            d="M 260 440 L 365 440 L 365 415"
            fill="none"
            stroke="#a855f7"
            strokeWidth="3"
            className={flowTk702ToD701 ? "pipe-flow" : ""}
          />
          <text x="230" y="435" className="text-[9px] fill-purple-300">FROM TK-702</text>

          <path
            d="M 365 340 L 365 470 L 450 470"
            fill="none"
            stroke="#a855f7"
            strokeWidth="3.5"
            className={flowD701ToT703 ? "pipe-flow" : ""}
          />
          <path
            d="M 465 455 L 465 290 L 570 290"
            fill="none"
            stroke="#a855f7"
            strokeWidth="3.5"
            className={flowD701ToT703 ? "pipe-flow" : ""}
          />
          <path d="M 310 250 L 330 250" fill="none" stroke="#a855f7" strokeWidth="2" />

          <path
            d="M 605 150 L 605 55 L 730 55"
            fill="none"
            stroke="#34d399"
            strokeWidth="4"
            className={flowVaporOverhead ? "pipe-flow-fast" : ""}
          />
          <rect x="730" y="38" width="50" height="34" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
          <text x="755" y="59" textAnchor="middle" className="text-[10px] font-bold fill-sky-300">E-704</text>
          <path
            d="M 780 55 L 835 55 L 835 90"
            fill="none"
            stroke="#34d399"
            strokeWidth="3.5"
            className={flowVaporOverhead ? "pipe-flow" : ""}
          />

          <path
            d="M 835 190 L 835 235 L 770 235"
            fill="none"
            stroke="#a855f7"
            strokeWidth="3"
            className={flowRefluxToT703 ? "pipe-flow" : ""}
          />
          <path
            d="M 740 235 L 640 235"
            fill="none"
            stroke="#a855f7"
            strokeWidth="3.5"
            className={flowRefluxToT703 ? "pipe-flow" : ""}
          />

          <path
            d="M 590 390 L 590 520 L 660 520"
            fill="none"
            stroke="#a855f7"
            strokeWidth="3.5"
            className={flowReboilerLoop ? "pipe-flow" : ""}
          />
          <path
            d="M 675 505 L 675 430 L 725 430"
            fill="none"
            stroke="#a855f7"
            strokeWidth="3.5"
            className={flowReboilerLoop ? "pipe-flow" : ""}
          />
          <rect x="725" y="395" width="44" height="55" rx="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
          <text x="747" y="426" textAnchor="middle" className="text-[10px] font-bold fill-amber-300">E-703A</text>
          <path
            d="M 725 405 L 640 405 L 640 340"
            fill="none"
            stroke="#34d399"
            strokeWidth="3.5"
            className={flowReboilerLoop && flowSteamE703 ? "pipe-flow-fast" : ""}
          />
          <path
            d="M 850 410 L 769 410"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            className={flowSteamE703 ? "pipe-flow" : ""}
          />
          <text x="860" y="413" className="text-[9px] font-bold fill-amber-400">MS STEAM</text>
          <path
            d="M 747 450 L 747 510 L 790 510"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            className={flowSteamE703 ? "pipe-flow" : ""}
          />

          <path
            d="M 620 390 L 620 595 L 875 595"
            fill="none"
            stroke="#a855f7"
            strokeWidth="3.5"
            className={flowT703ToD711 ? "pipe-flow" : ""}
          />
          <path
            d="M 890 580 L 890 360 L 965 360 L 965 240 L 1015 240"
            fill="none"
            stroke="#a855f7"
            strokeWidth="3.5"
            className={flowT703ToD711 ? "pipe-flow" : ""}
          />
          <rect x="945" y="275" width="40" height="45" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
          <text x="965" y="301" textAnchor="middle" className="text-[10px] font-bold fill-amber-300">E-711</text>
          <path
            d="M 900 285 L 945 285"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            className={flowSteamE711 ? "pipe-flow" : ""}
          />
          <path
            d="M 965 320 L 965 385 L 1015 385"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            className={flowSteamE711 ? "pipe-flow" : ""}
          />
          <path
            d="M 1050 135 L 1050 185"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            className={flowSteamD711 ? "pipe-flow" : ""}
          />

          {renderVessel("TK-703", 45, 290, 75, 160, "#a855f7")}
          {renderVessel("D-701", 330, 210, 65, 130, "#a855f7")}
          {renderVessel("T-703", 570, 150, 70, 240, "#a855f7", true)}
          {renderVessel("D-702", 805, 90, 65, 100, "#38bdf8")}
          {renderVessel("D-784A", 790, 480, 48, 70, "#f59e0b")}
          {renderVessel("D-711", 1015, 185, 65, 130, "#a855f7")}
          {renderVessel("D-715", 1015, 360, 48, 70, "#f59e0b")}

          {renderPump("P-703", 215, 520)}
          {renderPump("P-702A", 455, 470)}
          {renderPump("P-705A", 665, 520)}
          {renderPump("P-708A", 755, 235)}
          {renderPump("P-711A", 880, 595)}

          {renderManualValve("HV-713", 85, 480, true)}
          {renderManualValve("V6", 125, 520)}
          {renderManualValve("V7", 155, 520)}
          {renderManualValve("V8", 175, 495)}
          {renderManualValve("V9", 225, 470, true)}
          {renderManualValve("V10", 250, 485)}
          {renderManualValve("V3", 275, 210, true)}
          {renderManualValve("V5", 330, 110)}
          {renderManualValve("V4", 310, 360)}
          {renderManualValve("V26", 295, 440)}
          {renderManualValve("V12a", 310, 240)}
          {renderManualValve("V13a", 310, 265)}
          {renderManualValve("V14", 365, 380, true)}
          {renderManualValve("V15", 410, 470)}
          {renderManualValve("V18", 435, 445)}
          {renderManualValve("V16", 465, 415, true)}
          {renderManualValve("V19", 545, 175)}
          {renderManualValve("V20", 590, 440, true)}
          {renderManualValve("V21", 625, 520)}
          {renderManualValve("V23", 645, 495)}
          {renderManualValve("V22", 675, 475, true)}
          {renderManualValve("V24", 685, 405)}
          {renderManualValve("V1", 814, 565, true)}
          {renderManualValve("V2", 1039, 445, true)}
          {renderManualValve("V25", 1050, 155, true)}

          {renderControlValve("FIC-713", 225, 405)}
          {renderControlValve("FIC-712", 515, 290)}
          {renderControlValve("FIC-736", 695, 235)}
          {renderControlValve("PV-721", 670, 55)}
          {renderControlValve("PIC-721", 670, 125)}
          {renderControlValve("PIC-731", 910, 110)}
          {renderControlValve("FV-721", 815, 410)}
          {renderControlValve("LV-725A", 870, 535)}
          {renderControlValve("PIC-723", 890, 515)}
          {renderControlValve("TIC-724", 910, 285)}
          {renderControlValve("FIC-722", 890, 425)}
          {renderControlValve("TV-727", 1050, 115)}
          {renderControlValve("LV-727", 1090, 410)}
        </svg>
      </div>
    </div>
  );
}
