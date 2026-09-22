/**
 * Spares Shipment Tracker - Vanilla JavaScript Application
 */

const LOCAL_STORAGE_KEY = 'spares_shipments_vanilla_data_v1';
const CONFIG_STORAGE_KEY = 'spares_vanilla_config_v1';

// Initial Mock Seed Data matching Screenshots
const INITIAL_SHIPMENTS = [
  {
    id: 'ship-005',
    iodNumber: 'IOD-2026-005',
    tailNo: 'G-LMNP',
    airwaybill: 'AWB-881249',
    status: 'Pending Airwaybill',
    destination: 'Coastal Air Detachment',
    demandDateTime: 'Aug 24, 2026, 7:45 PM',
    etd: 'Aug 25, 2026, 3:30 PM',
    eta: 'Aug 26, 2026, 12:15 AM',
    mpn: '00072-ACT-6',
    nsn: '1680-00-897-3356',
    description: 'Flight control actuator assemblies with mounting brackets.',
    quantity: 3,
    remarks: 'Awaiting initial carrier acceptance and departure confirmation.',
    notificationActive: false,
    history: [
      {
        id: 'hist-005-1',
        status: 'Pending Airwaybill',
        timestamp: 'Aug 24, 2026, 8:00 PM',
        description: 'New shipment is pending airwaybill confirmation.',
      }
    ]
  },
  {
    id: 'ship-004',
    iodNumber: 'IOD-2026-004',
    tailNo: 'N905TR',
    airwaybill: 'AWB-774120',
    status: 'Delayed',
    destination: 'Southern Field Detachment',
    demandDateTime: 'Aug 20, 2026, 2:15 PM',
    etd: 'Aug 21, 2026, 08:00 AM',
    eta: 'Aug 21, 2026, 10:40 PM',
    mpn: '88210-PMP-2',
    nsn: '2915-01-445-9821',
    description: 'Hydraulic main pump assembly.',
    quantity: 1,
    remarks: 'Flight delayed due to adverse weather at transit hub.',
    notificationActive: true,
    history: [
      {
        id: 'hist-004-2',
        status: 'Delayed',
        timestamp: 'Aug 21, 2026, 9:15 PM',
        description: 'Carrier notified flight delay due to storm system.',
      }
    ]
  },
  {
    id: 'ship-002',
    iodNumber: 'IOD-2026-002',
    tailNo: 'C-GKLM',
    airwaybill: 'AWB-653901',
    status: 'Pending Custom Clearance Letter',
    destination: 'Eastern Port Detachment',
    demandDateTime: 'Aug 18, 2026, 10:30 AM',
    etd: 'Aug 19, 2026, 1:00 PM',
    eta: 'Aug 20, 2026, 9:20 PM',
    mpn: '44301-AV-09',
    nsn: '5841-01-209-1144',
    description: 'Radar transmitter receiver module.',
    quantity: 2,
    remarks: 'Customs documentation verification in progress.',
    notificationActive: true,
    history: [
      {
        id: 'hist-002-1',
        status: 'Pending Custom Clearance Letter',
        timestamp: 'Aug 20, 2026, 5:00 PM',
        description: 'Awaiting end-user certification letter from port authorities.',
      }
    ]
  },
  {
    id: 'ship-001',
    iodNumber: 'IOD-2026-001',
    tailNo: 'N482LX',
    airwaybill: 'AWB-541890',
    status: 'In-Transit (Air-I)',
    destination: 'North Hub Detachment',
    demandDateTime: 'Aug 17, 2026, 8:00 AM',
    etd: 'Aug 18, 2026, 6:30 AM',
    eta: 'Aug 19, 2026, 3:45 AM',
    mpn: '11029-GEAR-1',
    nsn: '1620-00-512-8871',
    description: 'Nose landing gear cylinder assembly.',
    quantity: 1,
    remarks: 'Air freight departing transit sector 4.',
    notificationActive: true,
    history: [
      {
        id: 'hist-001-1',
        status: 'In-Transit (Air-I)',
        timestamp: 'Aug 18, 2026, 7:00 AM',
        description: 'Flight departed origin airfield on schedule.',
      }
    ]
  },
  {
    id: 'ship-003',
    iodNumber: 'IOD-2026-003',
    tailNo: 'N731QF',
    airwaybill: 'AWB-320912',
    status: 'Delivered',
    destination: 'Central Depot Detachment',
    demandDateTime: 'Aug 14, 2026, 4:20 PM',
    etd: 'Aug 15, 2026, 11:00 AM',
    eta: 'Aug 16, 2026, 5:10 AM',
    mpn: '99120-VAL-4',
    nsn: '4820-01-331-0092',
    description: 'Bleed air valve controller.',
    quantity: 4,
    remarks: 'Received at central warehouse and signed off.',
    notificationActive: false,
    history: [
      {
        id: 'hist-003-1',
        status: 'Delivered',
        timestamp: 'Aug 16, 2026, 5:10 AM',
        description: 'Shipment accepted and verified by depot receiving officer.',
      }
    ]
  }
];

// App State
let shipments = loadShipments();
let selectedId = 'ship-005';
let activeFilters = { searchQuery: '', detachment: '', status: '' };
let backendConfig = loadConfig();
let pendingDeleteId = null;

// --- Helper Functions ---
function loadShipments() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_SHIPMENTS;
  } catch {
    return INITIAL_SHIPMENTS;
  }
}

function saveShipments() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(shipments));
  } catch (err) {
    console.error('Error saving shipments:', err);
  }
}

function loadConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { mode: 'mock', siteUrl: '', listName: '' };
  } catch {
    return { mode: 'mock', siteUrl: '', listName: '' };
  }
}

function saveConfig() {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(backendConfig));
  } catch (err) {
    console.error('Error saving config:', err);
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Pending Airwaybill': return 'status-pending-airwaybill';
    case 'Delayed': return 'status-delayed';
    case 'Pending Custom Clearance Letter': return 'status-pending-custom';
    case 'In-Transit (Air-I)': return 'status-in-transit';
    case 'Delivered': return 'status-delivered';
    default: return 'status-default';
  }
}

function getCurrentTimestamp() {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ', ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// --- Render Engine ---
function renderApp() {
  renderHeaderAndMetrics();
  populateDropdownFilters();
  renderSelectedShipmentCard();
  renderQueueTable();
  renderHistoryTimeline();
}

function renderHeaderAndMetrics() {
  document.getElementById('current-mode-label').textContent = backendConfig.mode.toUpperCase();
  document.getElementById('metric-total').textContent = shipments.length;
  document.getElementById('metric-active').textContent = shipments.filter(s => s.status !== 'Delivered').length;
  document.getElementById('metric-delayed').textContent = shipments.filter(s => s.status === 'Delayed').length;
}

function populateDropdownFilters() {
  const detSelect = document.getElementById('filter-detachment');
  const currentDet = detSelect.value;
  const detachments = Array.from(new Set(shipments.map(s => s.destination).filter(Boolean))).sort();

  detSelect.innerHTML = '<option value="">All Detachments</option>' +
    detachments.map(d => `<option value="${d}" ${d === currentDet ? 'selected' : ''}>${d}</option>`).join('');

  const statusSelect = document.getElementById('filter-status');
  const currentSt = statusSelect.value;
  const statuses = ['Pending Airwaybill', 'Delayed', 'Pending Custom Clearance Letter', 'In-Transit (Air-I)', 'Delivered'];

  statusSelect.innerHTML = '<option value="">All Statuses</option>' +
    statuses.map(s => `<option value="${s}" ${s === currentSt ? 'selected' : ''}>${s}</option>`).join('');
}

function getFilteredShipments() {
  return shipments.filter(s => {
    if (activeFilters.searchQuery) {
      const q = activeFilters.searchQuery.toLowerCase().trim();
      const match = s.iodNumber.toLowerCase().includes(q) ||
        s.tailNo.toLowerCase().includes(q) ||
        s.airwaybill.toLowerCase().includes(q) ||
        s.mpn.toLowerCase().includes(q) ||
        s.nsn.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (activeFilters.detachment && s.destination !== activeFilters.detachment) return false;
    if (activeFilters.status && s.status !== activeFilters.status) return false;
    return true;
  });
}

function renderSelectedShipmentCard() {
  const sel = shipments.find(s => s.id === selectedId);
  const subtitleEl = document.getElementById('selected-shipment-subtitle');
  const bodyEl = document.getElementById('selected-shipment-body');

  if (!sel) {
    subtitleEl.textContent = 'No shipment selected';
    bodyEl.innerHTML = '<div style="grid-column: span 4; text-align: center; color: #94a3b8; padding: 20px;">Select a shipment from the queue below.</div>';
    return;
  }

  subtitleEl.textContent = `${sel.iodNumber} / ${sel.airwaybill || 'N/A'}`;

  bodyEl.innerHTML = `
    <div className="detail-item">
      <span className="detail-label">IOD Number</span>
      <span className="detail-value">${sel.iodNumber}</span>
    </div>
    <div className="detail-item">
      <span className="detail-label">A/C Tail No.</span>
      <span className="detail-value">${sel.tailNo}</span>
    </div>
    <div className="detail-item">
      <span className="detail-label">Airwaybill</span>
      <span className="detail-value">${sel.airwaybill || '—'}</span>
    </div>
    <div className="detail-item">
      <span className="detail-label">Status</span>
      <span className="detail-value">${sel.status}</span>
    </div>
    <div className="detail-item">
      <span className="detail-label">Destination Detachment</span>
      <span className="detail-value">${sel.destination}</span>
    </div>
    <div className="detail-item">
      <span className="detail-label">Demand Date & Time</span>
      <span className="detail-value">${sel.demandDateTime}</span>
    </div>
    <div className="detail-item">
      <span className="detail-label">ETD</span>
      <span className="detail-value">${sel.etd}</span>
    </div>
    <div className="detail-item">
      <span className="detail-label">ETA</span>
      <span className="detail-value">${sel.eta}</span>
    </div>
    <div className="detail-item">
      <span className="detail-label">MPN</span>
      <span className="detail-value">${sel.mpn}</span>
    </div>
    <div className="detail-item">
      <span className="detail-label">NSN</span>
      <span className="detail-value">${sel.nsn}</span>
    </div>
    <div className="detail-item span-2">
      <span className="detail-label">Spares Description</span>
      <span className="detail-value">${sel.description}</span>
    </div>
    <div className="detail-item">
      <span className="detail-label">Quantity</span>
      <span className="detail-value">${sel.quantity}</span>
    </div>
    <div className="detail-item span-3">
      <span className="detail-label">Remarks</span>
      <span className="detail-value">${sel.remarks || '—'}</span>
    </div>
  `;
}

function renderQueueTable() {
  const tbody = document.getElementById('queue-table-body');
  const filtered = getFilteredShipments();

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 24px;">No matching shipments found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const isSelected = item.id === selectedId;
    const badgeClass = getStatusBadgeClass(item.status);
    const bellIcon = item.notificationActive ? '🔔' : '🔕';

    return `
      <tr class="${isSelected ? 'selected-row' : ''}" data-id="${item.id}">
        <td>
          <div className="iod-cell-main">${item.iodNumber}</div>
          <div className="iod-cell-sub">${item.tailNo}</div>
        </td>
        <td>
          <span className="status-pill ${badgeClass}">${item.status}</span>
        </td>
        <td>${item.destination}</td>
        <td>${item.eta}</td>
        <td className="text-right">
          <div className="action-btn-group" data-id="${item.id}">
            <button className="btn-icon-action btn-act-bell" title="Toggle Notification">${bellIcon}</button>
            <button className="btn-icon-action btn-act-status" title="Update Status">🔄</button>
            <button className="btn-icon-action btn-act-edit" title="Edit Shipment">✏️</button>
            <button className="btn-icon-action btn-icon-action danger btn-act-delete" title="Delete Shipment">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderHistoryTimeline() {
  const container = document.getElementById('history-timeline-body');
  const sel = shipments.find(s => s.id === selectedId);

  if (!sel || !sel.history || sel.history.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 16px;">No history recorded for this shipment.</div>';
    return;
  }

  container.innerHTML = sel.history.map(e => `
    <div className="history-item">
      <div className="history-header">
        <span className="history-status-title">${e.status}</span>
        <span className="history-timestamp">${e.timestamp}</span>
      </div>
      <p className="history-desc">${e.description}</p>
    </div>
  `).join('');
}

// --- Event Handlers & Modal Binding ---
function setupEventListeners() {
  // Search & Filters
  document.getElementById('search-input').addEventListener('input', (e) => {
    activeFilters.searchQuery = e.target.value;
    renderQueueTable();
  });

  document.getElementById('filter-detachment').addEventListener('change', (e) => {
    activeFilters.detachment = e.target.value;
    renderQueueTable();
  });

  document.getElementById('filter-status').addEventListener('change', (e) => {
    activeFilters.status = e.target.value;
    renderQueueTable();
  });

  // Table row click & table actions
  document.getElementById('queue-table-body').addEventListener('click', (e) => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    const id = tr.getAttribute('data-id');

    // Handle action buttons
    const btnBell = e.target.closest('.btn-act-bell');
    const btnStatus = e.target.closest('.btn-act-status');
    const btnEdit = e.target.closest('.btn-act-edit');
    const btnDelete = e.target.closest('.btn-act-delete');

    if (btnBell) {
      const item = shipments.find(s => s.id === id);
      if (item) item.notificationActive = !item.notificationActive;
      saveShipments();
      renderQueueTable();
      return;
    }

    if (btnStatus) {
      openStatusUpdateModal(id);
      return;
    }

    if (btnEdit) {
      openShipmentModal(id);
      return;
    }

    if (btnDelete) {
      openDeleteModal(id);
      return;
    }

    // Select row
    selectedId = id;
    renderApp();
  });

  // Header Buttons
  document.getElementById('btn-new-shipment').addEventListener('click', () => openShipmentModal(null));
  document.getElementById('btn-export-csv').addEventListener('click', exportCSV);
  document.getElementById('btn-mode-config').addEventListener('click', () => openModal('modal-config'));
  document.getElementById('btn-add-event').addEventListener('click', () => {
    if (selectedId) openStatusUpdateModal(selectedId);
  });

  // Close modals
  document.querySelectorAll('.modal-close-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
    });
  });

  // Shipment Form submit
  document.getElementById('form-shipment').addEventListener('submit', (e) => {
    e.preventDefault();
    saveShipmentFromForm();
  });

  // Status Update Form submit
  document.getElementById('form-status-update').addEventListener('submit', (e) => {
    e.preventDefault();
    saveStatusUpdateFromForm();
  });

  // Delete Confirm
  document.getElementById('btn-confirm-delete').addEventListener('click', () => {
    if (!pendingDeleteId) return;
    shipments = shipments.filter(s => s.id !== pendingDeleteId);
    if (selectedId === pendingDeleteId) selectedId = shipments[0]?.id || null;
    saveShipments();
    closeModal('modal-delete');
    renderApp();
  });

  // Config save
  document.getElementById('btn-save-config').addEventListener('click', () => {
    const selectedMode = document.querySelector('input[name="backend-mode"]:checked')?.value || 'mock';
    backendConfig.mode = selectedMode;
    saveConfig();
    closeModal('modal-config');
    renderHeaderAndMetrics();
  });
}

function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function openShipmentModal(shipmentId) {
  const isEdit = !!shipmentId;
  document.getElementById('modal-shipment-title').textContent = isEdit ? 'Edit Shipment' : 'Create New Shipment';
  document.getElementById('shipment-id').value = shipmentId || '';

  if (isEdit) {
    const s = shipments.find(item => item.id === shipmentId);
    if (!s) return;
    document.getElementById('field-iod').value = s.iodNumber;
    document.getElementById('field-tail').value = s.tailNo;
    document.getElementById('field-airwaybill').value = s.airwaybill;
    document.getElementById('field-status').value = s.status;
    document.getElementById('field-destination').value = s.destination;
    document.getElementById('field-quantity').value = s.quantity;
    document.getElementById('field-mpn').value = s.mpn;
    document.getElementById('field-nsn').value = s.nsn;
    document.getElementById('field-demand').value = s.demandDateTime;
    document.getElementById('field-etd').value = s.etd;
    document.getElementById('field-eta').value = s.eta;
    document.getElementById('field-description').value = s.description;
    document.getElementById('field-remarks').value = s.remarks;
  } else {
    document.getElementById('field-iod').value = `IOD-2026-00${Math.floor(Math.random() * 900 + 100)}`;
    document.getElementById('field-tail').value = '';
    document.getElementById('field-airwaybill').value = '';
    document.getElementById('field-status').value = 'Pending Airwaybill';
    document.getElementById('field-destination').value = 'Coastal Air Detachment';
    document.getElementById('field-quantity').value = 1;
    document.getElementById('field-mpn').value = '';
    document.getElementById('field-nsn').value = '';
    document.getElementById('field-demand').value = getCurrentTimestamp();
    document.getElementById('field-etd').value = getCurrentTimestamp();
    document.getElementById('field-eta').value = getCurrentTimestamp();
    document.getElementById('field-description').value = '';
    document.getElementById('field-remarks').value = '';
  }

  openModal('modal-shipment');
}

function saveShipmentFromForm() {
  const id = document.getElementById('shipment-id').value;
  const isEdit = !!id;
  const timeStr = getCurrentTimestamp();

  const formData = {
    iodNumber: document.getElementById('field-iod').value,
    tailNo: document.getElementById('field-tail').value,
    airwaybill: document.getElementById('field-airwaybill').value,
    status: document.getElementById('field-status').value,
    destination: document.getElementById('field-destination').value,
    quantity: parseInt(document.getElementById('field-quantity').value) || 1,
    mpn: document.getElementById('field-mpn').value,
    nsn: document.getElementById('field-nsn').value,
    demandDateTime: document.getElementById('field-demand').value,
    etd: document.getElementById('field-etd').value,
    eta: document.getElementById('field-eta').value,
    description: document.getElementById('field-description').value,
    remarks: document.getElementById('field-remarks').value,
  };

  if (isEdit) {
    shipments = shipments.map(s => {
      if (s.id === id) {
        const statusChanged = s.status !== formData.status;
        const newHistory = statusChanged
          ? [{ id: `hist-${Date.now()}`, status: formData.status, timestamp: timeStr, description: `Status updated to ${formData.status}.` }, ...s.history]
          : s.history;
        return { ...s, ...formData, history: newHistory };
      }
      return s;
    });
  } else {
    const newId = `ship-${Date.now()}`;
    const newShipment = {
      ...formData,
      id: newId,
      notificationActive: false,
      history: [{ id: `hist-${Date.now()}`, status: formData.status, timestamp: timeStr, description: `New shipment created.` }]
    };
    shipments.unshift(newShipment);
    selectedId = newId;
  }

  saveShipments();
  closeModal('modal-shipment');
  renderApp();
}

function openStatusUpdateModal(shipmentId) {
  const s = shipments.find(item => item.id === shipmentId);
  if (!s) return;
  document.getElementById('status-update-shipment-id').value = shipmentId;
  document.getElementById('status-update-target-label').textContent = `${s.iodNumber} (${s.tailNo})`;
  document.getElementById('status-update-select').value = s.status;
  document.getElementById('status-update-remarks').value = '';
  openModal('modal-status-update');
}

function saveStatusUpdateFromForm() {
  const id = document.getElementById('status-update-shipment-id').value;
  const newStatus = document.getElementById('status-update-select').value;
  const remarks = document.getElementById('status-update-remarks').value.trim() || `Status updated to ${newStatus}`;
  const timeStr = getCurrentTimestamp();

  shipments = shipments.map(s => {
    if (s.id === id) {
      return {
        ...s,
        status: newStatus,
        history: [{ id: `hist-${Date.now()}`, status: newStatus, timestamp: timeStr, description: remarks }, ...s.history]
      };
    }
    return s;
  });

  saveShipments();
  closeModal('modal-status-update');
  renderApp();
}

function openDeleteModal(shipmentId) {
  const s = shipments.find(item => item.id === shipmentId);
  if (!s) return;
  pendingDeleteId = shipmentId;
  document.getElementById('delete-confirm-text').textContent = `Are you sure you want to delete shipment ${s.iodNumber} (${s.tailNo})? This action cannot be undone.`;
  openModal('modal-delete');
}

function exportCSV() {
  const filtered = getFilteredShipments();
  const headers = ['IOD Number', 'Tail Number', 'Airwaybill', 'Status', 'Destination', 'Demand Date/Time', 'ETD', 'ETA', 'MPN', 'NSN', 'Quantity', 'Description', 'Remarks'];
  const rows = filtered.map(s => [
    `"${s.iodNumber}"`, `"${s.tailNo}"`, `"${s.airwaybill}"`, `"${s.status}"`,
    `"${s.destination}"`, `"${s.demandDateTime}"`, `"${s.etd}"`, `"${s.eta}"`,
    `"${s.mpn}"`, `"${s.nsn}"`, s.quantity, `"${s.description}"`, `"${s.remarks}"`
  ]);
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Aircraft_Spares_Shipments_Vanilla_2026.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  renderApp();
});
