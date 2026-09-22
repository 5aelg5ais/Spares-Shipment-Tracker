import React from 'react';

interface MetricCardsProps {
  totalCount: number;
  activeCount: number;
  delayedCount: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalCount,
  activeCount,
  delayedCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
      {/* Total Shipments Card */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E9F0] shadow-sm flex flex-col justify-between min-h-[108px] transition-all hover:border-slate-300">
        <span className="text-sm font-medium text-slate-600">Total shipments</span>
        <span className="text-2xl font-bold text-slate-900 mt-2">{totalCount}</span>
      </div>

      {/* Active Card */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E9F0] shadow-sm flex flex-col justify-between min-h-[108px] transition-all hover:border-slate-300">
        <span className="text-sm font-medium text-slate-600">Active</span>
        <span className="text-2xl font-bold text-slate-900 mt-2">{activeCount}</span>
      </div>

      {/* Delayed Card */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E9F0] shadow-sm flex flex-col justify-between min-h-[108px] transition-all hover:border-slate-300">
        <span className="text-sm font-medium text-slate-600">Delayed</span>
        <span className="text-2xl font-bold text-slate-900 mt-2">{delayedCount}</span>
      </div>
    </div>
  );
};
