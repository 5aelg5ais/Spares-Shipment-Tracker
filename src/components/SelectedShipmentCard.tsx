import React from 'react';
import { Shipment } from '../types/shipment';
import { PackageX } from 'lucide-react';

interface SelectedShipmentCardProps {
  shipment: Shipment | null;
}

export const SelectedShipmentCard: React.FC<SelectedShipmentCardProps> = ({ shipment }) => {
  if (!shipment) {
    return (
      <div className="bg-white rounded-xl p-8 border border-[#E2E9F0] shadow-sm mb-5 text-center">
        <PackageX className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-500 font-medium text-sm">No shipment selected</p>
        <p className="text-slate-400 text-xs mt-1">Select a shipment from the queue below to view details.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-[#E2E9F0] shadow-sm mb-5">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-slate-900 leading-snug">Selected shipment</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          {shipment.iodNumber} / {shipment.airwaybill || 'N/A'}
        </p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-6">
        {/* Row 1 */}
        <div>
          <span className="block text-xs font-medium text-slate-400">IOD Number</span>
          <span className="block text-sm font-bold text-slate-900 mt-1">{shipment.iodNumber}</span>
        </div>

        <div>
          <span className="block text-xs font-medium text-slate-400">A/C Tail No.</span>
          <span className="block text-sm font-bold text-slate-900 mt-1">{shipment.tailNo}</span>
        </div>

        <div>
          <span className="block text-xs font-medium text-slate-400">Airwaybill</span>
          <span className="block text-sm font-bold text-slate-900 mt-1">
            {shipment.airwaybill || '—'}
          </span>
        </div>

        <div>
          <span className="block text-xs font-medium text-slate-400">Status</span>
          <span className="block text-sm font-bold text-slate-900 mt-1">{shipment.status}</span>
        </div>

        {/* Row 2 */}
        <div>
          <span className="block text-xs font-medium text-slate-400">Destination Detachment</span>
          <span className="block text-sm font-bold text-slate-900 mt-1">{shipment.destination}</span>
        </div>

        <div>
          <span className="block text-xs font-medium text-slate-400">Demand Date & Time</span>
          <span className="block text-sm font-bold text-slate-900 mt-1">
            {shipment.demandDateTime}
          </span>
        </div>

        <div>
          <span className="block text-xs font-medium text-slate-400">ETD</span>
          <span className="block text-sm font-bold text-slate-900 mt-1">{shipment.etd}</span>
        </div>

        <div>
          <span className="block text-xs font-medium text-slate-400">ETA</span>
          <span className="block text-sm font-bold text-slate-900 mt-1">{shipment.eta}</span>
        </div>

        {/* Row 3 */}
        <div>
          <span className="block text-xs font-medium text-slate-400">MPN</span>
          <span className="block text-sm font-bold text-slate-900 mt-1">{shipment.mpn}</span>
        </div>

        <div>
          <span className="block text-xs font-medium text-slate-400">NSN</span>
          <span className="block text-sm font-bold text-slate-900 mt-1">{shipment.nsn}</span>
        </div>

        <div className="sm:col-span-2">
          <span className="block text-xs font-medium text-slate-400">Spares Description</span>
          <span className="block text-sm font-bold text-slate-900 mt-1">{shipment.description}</span>
        </div>

        {/* Row 4 */}
        <div>
          <span className="block text-xs font-medium text-slate-400">Quantity</span>
          <span className="block text-sm font-bold text-slate-900 mt-1">{shipment.quantity}</span>
        </div>

        <div className="sm:col-span-3">
          <span className="block text-xs font-medium text-slate-400">Remarks</span>
          <span className="block text-sm font-bold text-slate-900 mt-1 leading-relaxed">
            {shipment.remarks || '—'}
          </span>
        </div>
      </div>
    </div>
  );
};
