import React, { useState } from 'react';
import { Shipment, ShipmentStatus } from '../types/shipment';
import { X, Clock } from 'lucide-react';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: Shipment | null;
  statusOptions: string[];
  onSaveStatus: (shipmentId: string, newStatus: ShipmentStatus, eventDescription: string) => void;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  onClose,
  shipment,
  statusOptions,
  onSaveStatus,
}) => {
  if (!isOpen || !shipment) return null;

  const [selectedStatus, setSelectedStatus] = useState<ShipmentStatus>(shipment.status);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveStatus(
      shipment.id,
      selectedStatus,
      description.trim() || `Status updated to ${selectedStatus}`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-700" />
            <h3 className="text-base font-bold text-slate-900">Update Status & Log Event</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <span className="text-xs font-medium text-slate-400">Target Shipment</span>
            <p className="text-sm font-bold text-slate-900">
              {shipment.iodNumber} ({shipment.tailNo})
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white font-medium text-slate-800"
            >
              {statusOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Event Log Details / Remarks
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Carrier accepted shipment; departed transit hub."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#0A2540] hover:bg-[#13355A] rounded-lg shadow-sm"
            >
              Record Status Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
