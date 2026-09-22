import React from 'react';
import { Shipment, ShipmentFilterOptions } from '../types/shipment';
import {
  Search,
  Bell,
  BellOff,
  RotateCw,
  SquarePen,
  Trash2,
  ChevronDown,
} from 'lucide-react';

interface ShipmentQueueProps {
  shipments: Shipment[];
  selectedId: string | null;
  onSelectShipment: (id: string) => void;
  filters: ShipmentFilterOptions;
  onFilterChange: (filters: Partial<ShipmentFilterOptions>) => void;
  detachmentOptions: string[];
  statusOptions: string[];
  onToggleNotification: (id: string, e: React.MouseEvent) => void;
  onOpenStatusUpdate: (shipment: Shipment, e: React.MouseEvent) => void;
  onOpenEditModal: (shipment: Shipment, e: React.MouseEvent) => void;
  onOpenDeleteModal: (shipment: Shipment, e: React.MouseEvent) => void;
}

export const ShipmentQueue: React.FC<ShipmentQueueProps> = ({
  shipments,
  selectedId,
  onSelectShipment,
  filters,
  onFilterChange,
  detachmentOptions,
  statusOptions,
  onToggleNotification,
  onOpenStatusUpdate,
  onOpenEditModal,
  onOpenDeleteModal,
}) => {
  // Status Badge styling lookup
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending Airwaybill':
        return 'bg-[#D6ECFA] text-[#155A8A] font-medium';
      case 'Delayed':
        return 'bg-[#9E0000] text-white font-semibold';
      case 'Pending Custom Clearance Letter':
        return 'bg-[#D6EAFA] text-[#105080] font-medium';
      case 'In-Transit (Air-I)':
        return 'bg-[#CFECF0] text-[#0C5460] font-medium';
      case 'Delivered':
        return 'bg-[#D4EDDA] text-[#155724] font-medium';
      default:
        return 'bg-slate-100 text-slate-700 font-medium';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-[#E2E9F0] shadow-sm mb-5">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900 leading-snug">Shipment queue</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Search by IOD, airwaybill, tail number, MPN, or NSN.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-5">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search shipments"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Detachment Filter */}
        <div className="relative w-full sm:w-56">
          <select
            value={filters.detachment}
            onChange={(e) => onFilterChange({ detachment: e.target.value })}
            className="w-full appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700 cursor-pointer"
          >
            <option value="">All Detachments</option>
            {detachmentOptions.map((det) => (
              <option key={det} value={det}>
                {det}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="relative w-full sm:w-48">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="w-full appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700 cursor-pointer"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Queue Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700">
              <th className="py-3 px-4 w-44">IOD / Tail</th>
              <th className="py-3 px-4 w-52">Status</th>
              <th className="py-3 px-4">Destination</th>
              <th className="py-3 px-4 w-48">ETA</th>
              <th className="py-3 px-4 text-right w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {shipments.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No shipments found matching filters.
                </td>
              </tr>
            ) : (
              shipments.map((item) => {
                const isSelected = item.id === selectedId;
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectShipment(item.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-sky-50/60 font-normal'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* IOD / Tail */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="font-bold text-slate-900 leading-tight">{item.iodNumber}</div>
                      <div className="text-xs text-slate-500 font-normal mt-0.5">{item.tailNo}</div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4 align-middle">
                      <span
                        className={`inline-block px-3 py-1 text-xs rounded-full max-w-[210px] truncate ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Destination */}
                    <td className="py-3.5 px-4 align-middle text-slate-700 font-normal">
                      {item.destination}
                    </td>

                    {/* ETA */}
                    <td className="py-3.5 px-4 align-middle text-slate-700 font-normal">
                      {item.eta}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 align-middle text-right">
                      <div className="inline-flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {/* Bell Icon */}
                        <button
                          onClick={(e) => onToggleNotification(item.id, e)}
                          title={item.notificationActive ? 'Disable Notification' : 'Enable Notification'}
                          className={`p-1.5 rounded-md hover:bg-slate-200 transition-colors ${
                            item.notificationActive ? 'text-slate-700' : 'text-slate-400'
                          }`}
                        >
                          {item.notificationActive ? (
                            <Bell className="w-4 h-4" />
                          ) : (
                            <BellOff className="w-4 h-4" />
                          )}
                        </button>

                        {/* Quick status update button */}
                        <button
                          onClick={(e) => onOpenStatusUpdate(item, e)}
                          title="Update Status / Log Event"
                          className="p-1.5 rounded-md text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>

                        {/* Edit button */}
                        <button
                          onClick={(e) => onOpenEditModal(item, e)}
                          title="Edit Shipment"
                          className="p-1.5 rounded-md text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          <SquarePen className="w-4 h-4" />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={(e) => onOpenDeleteModal(item, e)}
                          title="Delete Shipment"
                          className="p-1.5 rounded-md text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
