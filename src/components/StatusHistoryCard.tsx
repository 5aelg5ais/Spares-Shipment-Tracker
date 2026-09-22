import React from 'react';
import { Shipment } from '../types/shipment';
import { Clock, Plus } from 'lucide-react';

interface StatusHistoryCardProps {
  shipment: Shipment | null;
  onAddEventClick: () => void;
}

export const StatusHistoryCard: React.FC<StatusHistoryCardProps> = ({
  shipment,
  onAddEventClick,
}) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-[#E2E9F0] shadow-sm mb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 leading-snug">Status history</h2>
          <p className="text-xs text-slate-500 mt-0.5">Events for the selected shipment.</p>
        </div>
        {shipment && (
          <button
            onClick={onAddEventClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        )}
      </div>

      {/* History Items */}
      {!shipment ? (
        <div className="py-6 text-center text-slate-400 text-sm">
          Select a shipment to view status history.
        </div>
      ) : shipment.history.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-sm flex flex-col items-center">
          <Clock className="w-8 h-8 text-slate-300 mb-2" />
          <p>No status history recorded for this shipment yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shipment.history.map((event) => (
            <div
              key={event.id}
              className="relative p-4 rounded-r-lg border border-slate-200 border-l-[4px] border-l-[#0A3D62] bg-white shadow-2xs transition-all hover:border-slate-300"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="font-bold text-slate-900 text-sm">{event.status}</span>
                <span className="text-xs text-slate-500 font-normal whitespace-nowrap">
                  {event.timestamp}
                </span>
              </div>
              <p className="text-sm text-slate-600 font-normal mt-1 leading-relaxed">
                {event.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
