import React, { useState, useMemo, useEffect } from 'react';
import { Shipment, ShipmentFilterOptions, BackendConfig, ShipmentStatus } from './types/shipment';
import {
  loadShipmentsFromStorage,
  saveShipmentsToStorage,
  loadBackendConfig,
  saveBackendConfig,
  generateCSV,
  downloadCSV,
} from './services/shipmentService';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { SelectedShipmentCard } from './components/SelectedShipmentCard';
import { ShipmentQueue } from './components/ShipmentQueue';
import { StatusHistoryCard } from './components/StatusHistoryCard';
import { ShipmentModal } from './components/ShipmentModal';
import { StatusUpdateModal } from './components/StatusUpdateModal';
import { SharePointConfigModal } from './components/SharePointConfigModal';
import { AlertTriangle, Trash2 } from 'lucide-react';

export const App: React.FC = () => {
  // --- Main State ---
  const [shipments, setShipments] = useState<Shipment[]>(() => loadShipmentsFromStorage());
  const [selectedId, setSelectedId] = useState<string | null>('ship-005'); // Default to IOD-2026-005 as in screenshot
  const [config, setConfig] = useState<BackendConfig>(() => loadBackendConfig());

  // --- Filter State ---
  const [filters, setFilters] = useState<ShipmentFilterOptions>({
    searchQuery: '',
    detachment: '',
    status: '',
  });

  // --- Modals State ---
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [statusUpdateTarget, setStatusUpdateTarget] = useState<Shipment | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [deletingShipment, setDeletingShipment] = useState<Shipment | null>(null);

  // Sync to LocalStorage on change
  useEffect(() => {
    saveShipmentsToStorage(shipments);
  }, [shipments]);

  useEffect(() => {
    saveBackendConfig(config);
  }, [config]);

  // Derived metrics
  const totalCount = shipments.length;
  const activeCount = useMemo(
    () => shipments.filter((s) => s.status !== 'Delivered').length,
    [shipments]
  );
  const delayedCount = useMemo(
    () => shipments.filter((s) => s.status === 'Delayed').length,
    [shipments]
  );

  // Filter options for dropdowns
  const detachmentOptions = useMemo(() => {
    const set = new Set<string>();
    shipments.forEach((s) => {
      if (s.destination) set.add(s.destination);
    });
    return Array.from(set).sort();
  }, [shipments]);

  const statusOptions = useMemo(() => {
    const list = [
      'Pending Airwaybill',
      'Delayed',
      'Pending Custom Clearance Letter',
      'In-Transit (Air-I)',
      'Delivered',
    ];
    shipments.forEach((s) => {
      if (s.status && !list.includes(s.status)) {
        list.push(s.status);
      }
    });
    return list;
  }, [shipments]);

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      // Search text match
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const match =
          s.iodNumber.toLowerCase().includes(q) ||
          s.airwaybill.toLowerCase().includes(q) ||
          s.tailNo.toLowerCase().includes(q) ||
          s.mpn.toLowerCase().includes(q) ||
          s.nsn.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.destination.toLowerCase().includes(q);
        if (!match) return false;
      }
      // Detachment filter
      if (filters.detachment && s.destination !== filters.detachment) {
        return false;
      }
      // Status filter
      if (filters.status && s.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [shipments, filters]);

  // Currently selected shipment object
  const selectedShipment = useMemo(() => {
    if (!selectedId) return null;
    return shipments.find((s) => s.id === selectedId) || null;
  }, [shipments, selectedId]);

  // --- Handlers ---
  const handleFilterChange = (partial: Partial<ShipmentFilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleToggleNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShipments((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, notificationActive: !s.notificationActive } : s
      )
    );
  };

  const handleOpenNewModal = () => {
    setEditingShipment(null);
    setIsShipmentModalOpen(true);
  };

  const handleOpenEditModal = (shipment: Shipment, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingShipment(shipment);
    setIsShipmentModalOpen(true);
  };

  const handleOpenStatusUpdate = (shipment: Shipment, e: React.MouseEvent) => {
    e.stopPropagation();
    setStatusUpdateTarget(shipment);
  };

  const handleOpenDeleteModal = (shipment: Shipment, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingShipment(shipment);
  };

  const handleSaveShipment = (
    data: Omit<Shipment, 'id' | 'history'> & { id?: string }
  ) => {
    const now = new Date();
    const timeStr =
      now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) +
      ', ' +
      now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });

    if (data.id) {
      // Edit existing
      setShipments((prev) =>
        prev.map((s) => {
          if (s.id === data.id) {
            const statusChanged = s.status !== data.status;
            const updatedHistory = statusChanged
              ? [
                  {
                    id: `hist-${Date.now()}`,
                    status: data.status,
                    timestamp: timeStr,
                    description: `Status updated to ${data.status}.`,
                  },
                  ...s.history,
                ]
              : s.history;

            return {
              ...s,
              ...data,
              history: updatedHistory,
            };
          }
          return s;
        })
      );
    } else {
      // Create new
      const newId = `ship-${Date.now()}`;
      const newShipment: Shipment = {
        ...data,
        id: newId,
        history: [
          {
            id: `hist-${Date.now()}`,
            status: data.status,
            timestamp: timeStr,
            description: `New shipment recorded. Status set to ${data.status}.`,
          },
        ],
      };
      setShipments((prev) => [newShipment, ...prev]);
      setSelectedId(newId);
    }
  };

  const handleSaveStatusUpdate = (
    shipmentId: string,
    newStatus: ShipmentStatus,
    eventDescription: string
  ) => {
    const now = new Date();
    const timeStr =
      now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) +
      ', ' +
      now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });

    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === shipmentId) {
          return {
            ...s,
            status: newStatus,
            history: [
              {
                id: `hist-${Date.now()}`,
                status: newStatus,
                timestamp: timeStr,
                description: eventDescription,
              },
              ...s.history,
            ],
          };
        }
        return s;
      })
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingShipment) return;
    setShipments((prev) => prev.filter((s) => s.id !== deletingShipment.id));
    if (selectedId === deletingShipment.id) {
      setSelectedId(null);
    }
    setDeletingShipment(null);
  };

  const handleExportCSV = () => {
    const csvStr = generateCSV(filteredShipments);
    downloadCSV('Aircraft_Spares_Shipments_2026.csv', csvStr);
  };

  return (
    <div className="min-h-screen bg-[#EFF6FC] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 1. Header Section */}
      <Header
        onOpenNewModal={handleOpenNewModal}
        onExportCSV={handleExportCSV}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        config={config}
      />

      {/* 2. Metrics Summary Row */}
      <MetricCards
        totalCount={totalCount}
        activeCount={activeCount}
        delayedCount={delayedCount}
      />

      {/* 3. Selected Shipment Card */}
      <SelectedShipmentCard shipment={selectedShipment} />

      {/* 4. Shipment Queue Table */}
      <ShipmentQueue
        shipments={filteredShipments}
        selectedId={selectedId}
        onSelectShipment={(id) => setSelectedId(id)}
        filters={filters}
        onFilterChange={handleFilterChange}
        detachmentOptions={detachmentOptions}
        statusOptions={statusOptions}
        onToggleNotification={handleToggleNotification}
        onOpenStatusUpdate={handleOpenStatusUpdate}
        onOpenEditModal={handleOpenEditModal}
        onOpenDeleteModal={handleOpenDeleteModal}
      />

      {/* 5. Status History Timeline Card */}
      <StatusHistoryCard
        shipment={selectedShipment}
        onAddEventClick={() => {
          if (selectedShipment) setStatusUpdateTarget(selectedShipment);
        }}
      />

      {/* --- MODALS --- */}
      {/* New / Edit Modal */}
      <ShipmentModal
        isOpen={isShipmentModalOpen}
        onClose={() => setIsShipmentModalOpen(false)}
        onSave={handleSaveShipment}
        initialData={editingShipment}
        detachmentOptions={detachmentOptions}
        statusOptions={statusOptions}
      />

      {/* Status Update Quick Modal */}
      <StatusUpdateModal
        isOpen={!!statusUpdateTarget}
        onClose={() => setStatusUpdateTarget(null)}
        shipment={statusUpdateTarget}
        statusOptions={statusOptions}
        onSaveStatus={handleSaveStatusUpdate}
      />

      {/* SharePoint / Dataverse Config Modal */}
      <SharePointConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={config}
        onSaveConfig={(newCfg) => setConfig(newCfg)}
      />

      {/* Delete Confirmation Modal */}
      {deletingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Shipment?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to delete shipment{' '}
              <span className="font-semibold text-slate-800">
                {deletingShipment.iodNumber} ({deletingShipment.tailNo})
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setDeletingShipment(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
