import React from 'react';
import { Truck, Plus, Download, Database } from 'lucide-react';
import { BackendConfig } from '../types/shipment';

interface HeaderProps {
  onOpenNewModal: () => void;
  onExportCSV: () => void;
  onOpenConfigModal: () => void;
  config: BackendConfig;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewModal,
  onExportCSV,
  onOpenConfigModal,
  config,
}) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-[#E2E9F0] shadow-sm mb-5 transition-all">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Left column: Title & Badge */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF5FC] text-[#004B87] text-xs font-semibold mb-3 border border-[#D0E6F7]">
            <Truck className="w-3.5 h-3.5 text-[#004B87]" />
            <span>Logistics command</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight leading-tight">
            Shipment Tracker
          </h1>

          {/* Subtitle */}
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Manage aircraft spares shipments and operational timings. Signed in as{' '}
            <span className="font-medium text-slate-700">SEAH CHIN YEONG, EDWARD ..</span>
          </p>
        </div>

        {/* Right column: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenConfigModal}
            title="Configure SharePoint backend connection"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Mode:</span>
            <span className="font-semibold uppercase text-sky-700">{config.mode}</span>
          </button>

          <button
            onClick={onOpenNewModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A2540] hover:bg-[#13355A] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New shipment</span>
          </button>

          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
