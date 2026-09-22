import React, { useState, useEffect } from 'react';
import { Shipment, ShipmentStatus } from '../types/shipment';
import { X } from 'lucide-react';

interface ShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shipmentData: Omit<Shipment, 'id' | 'history'> & { id?: string }) => void;
  initialData?: Shipment | null;
  detachmentOptions: string[];
  statusOptions: string[];
}

export const ShipmentModal: React.FC<ShipmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  detachmentOptions,
  statusOptions,
}) => {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    iodNumber: '',
    tailNo: '',
    airwaybill: '',
    status: 'Pending Airwaybill' as ShipmentStatus,
    destination: 'Coastal Air Detachment',
    demandDateTime: '',
    etd: '',
    eta: '',
    mpn: '',
    nsn: '',
    quantity: 1,
    description: '',
    remarks: '',
    notificationActive: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        iodNumber: initialData.iodNumber,
        tailNo: initialData.tailNo,
        airwaybill: initialData.airwaybill,
        status: initialData.status,
        destination: initialData.destination,
        demandDateTime: initialData.demandDateTime,
        etd: initialData.etd,
        eta: initialData.eta,
        mpn: initialData.mpn,
        nsn: initialData.nsn,
        quantity: initialData.quantity,
        description: initialData.description,
        remarks: initialData.remarks,
        notificationActive: initialData.notificationActive,
      });
    } else {
      // Defaults for new shipment
      const now = new Date();
      const formatStr = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) + ', ' + now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });

      setFormData({
        iodNumber: `IOD-2026-00${Math.floor(Math.random() * 900 + 100)}`,
        tailNo: '',
        airwaybill: '',
        status: 'Pending Airwaybill',
        destination: detachmentOptions[0] || 'Coastal Air Detachment',
        demandDateTime: formatStr,
        etd: formatStr,
        eta: formatStr,
        mpn: '',
        nsn: '',
        quantity: 1,
        description: '',
        remarks: '',
        notificationActive: false,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(initialData ? { id: initialData.id } : {}),
      ...formData,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">
            {isEdit ? 'Edit Shipment' : 'Create New Shipment'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* IOD Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                IOD Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.iodNumber}
                onChange={(e) => setFormData({ ...formData, iodNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="e.g. IOD-2026-006"
              />
            </div>

            {/* A/C Tail No */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                A/C Tail No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.tailNo}
                onChange={(e) => setFormData({ ...formData, tailNo: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="e.g. G-LMNP"
              />
            </div>

            {/* Airwaybill */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Airwaybill</label>
              <input
                type="text"
                value={formData.airwaybill}
                onChange={(e) => setFormData({ ...formData, airwaybill: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="e.g. AWB-881249"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              >
                {statusOptions.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Detachment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination Detachment
              </label>
              <input
                type="text"
                list="detachment-options"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="e.g. Coastal Air Detachment"
              />
              <datalist id="detachment-options">
                {detachmentOptions.map((det) => (
                  <option key={det} value={det} />
                ))}
              </datalist>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            {/* MPN */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">MPN</label>
              <input
                type="text"
                value={formData.mpn}
                onChange={(e) => setFormData({ ...formData, mpn: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="e.g. 00072-ACT-6"
              />
            </div>

            {/* NSN */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NSN</label>
              <input
                type="text"
                value={formData.nsn}
                onChange={(e) => setFormData({ ...formData, nsn: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="e.g. 1680-00-897-3356"
              />
            </div>

            {/* Demand Date & Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Demand Date & Time
              </label>
              <input
                type="text"
                value={formData.demandDateTime}
                onChange={(e) => setFormData({ ...formData, demandDateTime: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="e.g. Aug 24, 2026, 7:45 PM"
              />
            </div>

            {/* ETD */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ETD</label>
              <input
                type="text"
                value={formData.etd}
                onChange={(e) => setFormData({ ...formData, etd: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="e.g. Aug 25, 2026, 3:30 PM"
              />
            </div>

            {/* ETA */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">ETA</label>
              <input
                type="text"
                value={formData.eta}
                onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="e.g. Aug 26, 2026, 12:15 AM"
              />
            </div>
          </div>

          {/* Spares Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Spares Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="e.g. Flight control actuator assemblies with mounting brackets."
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
            <textarea
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="e.g. Awaiting initial carrier acceptance and departure confirmation."
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#0A2540] hover:bg-[#13355A] rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              {isEdit ? 'Save Changes' : 'Create Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
