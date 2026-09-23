/**
 * Spares Shipment Tracker - Vanilla JavaScript Application
 * Supports Local Mock (LocalStorage), SharePoint REST API, and M365 Dataverse Web API
 */

const LOCAL_STORAGE_KEY = 'spares_shipments_vanilla_data_v1';
const CONFIG_STORAGE_KEY = 'spares_vanilla_config_v1';

// Initial Mock Seed Data matching original Vite React prototype
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
let shipments = [];
let selectedId = 'ship-005';
let activeFilters = { searchQuery: '', detachment: '', status: '' };
let backendConfig = loadConfig();
let pendingDeleteId = null;
let isLoadingData = false;
let apiErrorMessage = null;

// --- Config Management ---
function loadConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {
      mode: 'mock',
      siteUrl: window.location.origin && window.location.origin !== 'null' ? `${window.location.origin}/sites/LogisticsHub` : 'https://tenant.sharepoint.com/sites/LogisticsHub',
      listName: 'AircraftSparesShipments',
      dataverseUrl: 'https://org.crm.dynamics.com/api/data/v9.2',
      dataverseTable: 'cr_spares_shipments'
    };
  } catch {
    return {
      mode: 'mock',
      siteUrl: 'https://tenant.sharepoint.com/sites/LogisticsHub',
      listName: 'AircraftSparesShipments',
      dataverseUrl: 'https://org.crm.dynamics.com/api/data/v9.2',
      dataverseTable: 'cr_spares_shipments'
    };
  }
}

function saveConfig() {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(backendConfig));
  } catch (err) {
    console.error('Error saving config:', err);
  }
}

function loadLocalStorageShipments() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_SHIPMENTS;
  } catch {
    return INITIAL_SHIPMENTS;
  }
}

function saveLocalStorageShipments(data) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving shipments to LocalStorage:', err);
  }
}

// --- SharePoint REST API Backend Service ---
const SharePointService = {
  async getRequestDigest(siteUrl) {
    if (window._spPageContextInfo && window._spPageContextInfo.formDigestValue) {
      return window._spPageContextInfo.formDigestValue;
    }
    const digestElem = document.getElementById('__REQUESTDIGEST');
    if (digestElem && digestElem.value) return digestElem.value;

    try {
      const url = `${siteUrl.replace(/\/$/, '')}/_api/contextinfo`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json;odata=verbose' }
      });
      if (resp.ok) {
        const data = await resp.json();
        return data.d?.GetContextWebInformation?.FormDigestValue || '';
      }
    } catch (e) {
      console.warn('Could not fetch SharePoint Request Digest:', e);
    }
    return '';
  },

  mapItemFromSP(spItem) {
    let history = [];
    if (spItem.StatusHistoryJSON) {
      try { history = JSON.parse(spItem.StatusHistoryJSON); } catch { history = []; }
    } else if (spItem.history) {
      try { history = typeof spItem.history === 'string' ? JSON.parse(spItem.history) : spItem.history; } catch { history = []; }
    }

    return {
      id: String(spItem.Id || spItem.ID || spItem.id),
      iodNumber: spItem.Title || spItem.iodNumber || spItem.IODNumber || '',
      tailNo: spItem.TailNo || spItem.tailNo || spItem.TailNumber || '',
      airwaybill: spItem.Airwaybill || spItem.airwaybill || '',
      status: spItem.Status || spItem.status || 'Pending Airwaybill',
      destination: spItem.Destination || spItem.destination || '',
      demandDateTime: spItem.DemandDateTime || spItem.demandDateTime || '',
      etd: spItem.ETD || spItem.etd || '',
      eta: spItem.ETA || spItem.eta || '',
      mpn: spItem.MPN || spItem.mpn || '',
      nsn: spItem.NSN || spItem.nsn || '',
      description: spItem.Description || spItem.description || spItem.SparesDescription || '',
      quantity: parseInt(spItem.Quantity || spItem.quantity) || 1,
      remarks: spItem.Remarks || spItem.remarks || '',
      notificationActive: !!(spItem.NotificationActive ?? spItem.notificationActive),
      history: Array.isArray(history) ? history : []
    };
  },

  mapItemToSP(shipment) {
    return {
      Title: shipment.iodNumber || '',
      TailNo: shipment.tailNo || '',
      Airwaybill: shipment.airwaybill || '',
      Status: shipment.status || 'Pending Airwaybill',
      Destination: shipment.destination || '',
      DemandDateTime: shipment.demandDateTime || '',
      ETD: shipment.etd || '',
      ETA: shipment.eta || '',
      MPN: shipment.mpn || '',
      NSN: shipment.nsn || '',
      Description: shipment.description || '',
      Quantity: shipment.quantity || 1,
      Remarks: shipment.remarks || '',
      NotificationActive: !!shipment.notificationActive,
      StatusHistoryJSON: JSON.stringify(shipment.history || [])
    };
  },

  async fetchShipments(config) {
    const siteUrl = (config.siteUrl || '').replace(/\/$/, '');
    const listName = config.listName || 'AircraftSparesShipments';
    const endpoint = `${siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(listName)}')/items?$top=500`;

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json;odata=nometadata' }
    });

    if (!res.ok) {
      throw new Error(`SharePoint API HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const rawItems = data.value || data.d?.results || [];
    return rawItems.map(item => this.mapItemFromSP(item));
  },

  async createShipment(config, shipment) {
    const siteUrl = (config.siteUrl || '').replace(/\/$/, '');
    const listName = config.listName || 'AircraftSparesShipments';
    const endpoint = `${siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(listName)}')/items`;
    const digest = await this.getRequestDigest(siteUrl);

    const payload = this.mapItemToSP(shipment);

    const headers = {
      'Accept': 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=nometadata'
    };
    if (digest) headers['X-RequestDigest'] = digest;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`SharePoint Create HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return this.mapItemFromSP(data);
  },

  async updateShipment(config, shipment) {
    const siteUrl = (config.siteUrl || '').replace(/\/$/, '');
    const listName = config.listName || 'AircraftSparesShipments';
    const endpoint = `${siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(listName)}')/items(${shipment.id})`;
    const digest = await this.getRequestDigest(siteUrl);

    const payload = this.mapItemToSP(shipment);

    const headers = {
      'Accept': 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=nometadata',
      'X-HTTP-Method': 'MERGE',
      'IF-MATCH': '*'
    };
    if (digest) headers['X-RequestDigest'] = digest;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok && res.status !== 204) {
      throw new Error(`SharePoint Update HTTP ${res.status}: ${res.statusText}`);
    }

    return shipment;
  },

  async deleteShipment(config, id) {
    const siteUrl = (config.siteUrl || '').replace(/\/$/, '');
    const listName = config.listName || 'AircraftSparesShipments';
    const endpoint = `${siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(listName)}')/items(${id})`;
    const digest = await this.getRequestDigest(siteUrl);

    const headers = {
      'Accept': 'application/json;odata=nometadata',
      'X-HTTP-Method': 'DELETE',
      'IF-MATCH': '*'
    };
    if (digest) headers['X-RequestDigest'] = digest;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: headers
    });

    if (!res.ok && res.status !== 204) {
      throw new Error(`SharePoint Delete HTTP ${res.status}: ${res.statusText}`);
    }
  }
};

// --- M365 Dataverse Web API Service ---
const DataverseService = {
  mapItemFromDV(dvItem) {
    let history = [];
    if (dvItem.cr_statushistoryjson) {
      try { history = JSON.parse(dvItem.cr_statushistoryjson); } catch { history = []; }
    }

    return {
      id: dvItem.cr_spares_shipmentid || dvItem.cr_shipmentid || dvItem.id,
      iodNumber: dvItem.cr_iodnumber || dvItem.cr_title || dvItem.name || '',
      tailNo: dvItem.cr_tailno || '',
      airwaybill: dvItem.cr_airwaybill || '',
      status: dvItem.cr_status || 'Pending Airwaybill',
      destination: dvItem.cr_destination || '',
      demandDateTime: dvItem.cr_demanddatetime || '',
      etd: dvItem.cr_etd || '',
      eta: dvItem.cr_eta || '',
      mpn: dvItem.cr_mpn || '',
      nsn: dvItem.cr_nsn || '',
      description: dvItem.cr_description || '',
      quantity: parseInt(dvItem.cr_quantity) || 1,
      remarks: dvItem.cr_remarks || '',
      notificationActive: !!dvItem.cr_notificationactive,
      history: Array.isArray(history) ? history : []
    };
  },

  mapItemToDV(shipment) {
    return {
      cr_iodnumber: shipment.iodNumber || '',
      cr_tailno: shipment.tailNo || '',
      cr_airwaybill: shipment.airwaybill || '',
      cr_status: shipment.status || 'Pending Airwaybill',
      cr_destination: shipment.destination || '',
      cr_demanddatetime: shipment.demandDateTime || '',
      cr_etd: shipment.etd || '',
      cr_eta: shipment.eta || '',
      cr_mpn: shipment.mpn || '',
      cr_nsn: shipment.nsn || '',
      cr_description: shipment.description || '',
      cr_quantity: shipment.quantity || 1,
      cr_remarks: shipment.remarks || '',
      cr_notificationactive: !!shipment.notificationActive,
      cr_statushistoryjson: JSON.stringify(shipment.history || [])
    };
  },

  async fetchShipments(config) {
    const orgUrl = (config.dataverseUrl || 'https://org.crm.dynamics.com/api/data/v9.2').replace(/\/$/, '');
    const tableName = config.dataverseTable || 'cr_spares_shipments';
    const endpoint = `${orgUrl}/${tableName}?$top=500`;

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0'
      }
    });

    if (!res.ok) {
      throw new Error(`Dataverse API HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const rawItems = data.value || [];
    return rawItems.map(item => this.mapItemFromDV(item));
  },

  async createShipment(config, shipment) {
    const orgUrl = (config.dataverseUrl || 'https://org.crm.dynamics.com/api/data/v9.2').replace(/\/$/, '');
    const tableName = config.dataverseTable || 'cr_spares_shipments';
    const endpoint = `${orgUrl}/${tableName}`;

    const payload = this.mapItemToDV(shipment);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Dataverse Create HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return this.mapItemFromDV(data);
  },

  async updateShipment(config, shipment) {
    const orgUrl = (config.dataverseUrl || 'https://org.crm.dynamics.com/api/data/v9.2').replace(/\/$/, '');
    const tableName = config.dataverseTable || 'cr_spares_shipments';
    const endpoint = `${orgUrl}/${tableName}(${shipment.id})`;

    const payload = this.mapItemToDV(shipment);

    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok && res.status !== 204) {
      throw new Error(`Dataverse Update HTTP ${res.status}: ${res.statusText}`);
    }

    return shipment;
  },

  async deleteShipment(config, id) {
    const orgUrl = (config.dataverseUrl || 'https://org.crm.dynamics.com/api/data/v9.2').replace(/\/$/, '');
    const tableName = config.dataverseTable || 'cr_spares_shipments';
    const endpoint = `${orgUrl}/${tableName}(${id})`;

    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0'
      }
    });

    if (!res.ok && res.status !== 204) {
      throw new Error(`Dataverse Delete HTTP ${res.status}: ${res.statusText}`);
    }
  }
};

// --- Unified Shipment Data Service ---
const ShipmentDataService = {
  async fetchAll(config) {
    const mode = config.mode || 'mock';
    if (mode === 'sharepoint') {
      return await SharePointService.fetchShipments(config);
    } else if (mode === 'dataverse') {
      return await DataverseService.fetchShipments(config);
    } else {
      return loadLocalStorageShipments();
    }
  },

  async save(config, shipmentData) {
    const mode = config.mode || 'mock';
    const isEdit = !!shipmentData.id;

    if (mode === 'sharepoint') {
      if (isEdit) {
        return await SharePointService.updateShipment(config, shipmentData);
      } else {
        return await SharePointService.createShipment(config, shipmentData);
      }
    } else if (mode === 'dataverse') {
      if (isEdit) {
        return await DataverseService.updateShipment(config, shipmentData);
      } else {
        return await DataverseService.createShipment(config, shipmentData);
      }
    } else {
      let list = loadLocalStorageShipments();
      if (isEdit) {
        list = list.map(s => s.id === shipmentData.id ? { ...s, ...shipmentData } : s);
      } else {
        const newId = `ship-${Date.now()}`;
        const newShipment = { ...shipmentData, id: newId };
        list.unshift(newShipment);
        shipmentData = newShipment;
      }
      saveLocalStorageShipments(list);
      return shipmentData;
    }
  },

  async delete(config, id) {
    const mode = config.mode || 'mock';
    if (mode === 'sharepoint') {
      await SharePointService.deleteShipment(config, id);
    } else if (mode === 'dataverse') {
      await DataverseService.deleteShipment(config, id);
    } else {
      let list = loadLocalStorageShipments();
      list = list.filter(s => s.id !== id);
      saveLocalStorageShipments(list);
    }
  },

  async testConnection(config) {
    const mode = config.mode || 'mock';
    if (mode === 'mock') {
      return { success: true, message: 'Local Mock mode active. Interactive prototype stored in LocalStorage.' };
    } else if (mode === 'sharepoint') {
      try {
        const list = await SharePointService.fetchShipments(config);
        return { success: true, message: `Successfully connected to SharePoint List "${config.listName || 'AircraftSparesShipments'}"! Loaded ${list.length} item(s).` };
      } catch (e) {
        return { success: false, message: `SharePoint Connection Error: ${e.message}` };
      }
    } else if (mode === 'dataverse') {
      try {
        const list = await DataverseService.fetchShipments(config);
        return { success: true, message: `Successfully connected to Dataverse Table "${config.dataverseTable || 'cr_spares_shipments'}"! Loaded ${list.length} item(s).` };
      } catch (e) {
        return { success: false, message: `Dataverse Connection Error: ${e.message}` };
      }
    }
  }
};

// --- Helper Utilities ---
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

// Icon SVG helper functions
function getBellIcon(active) {
  if (active) {
    return `<svg class="icon-sm text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`;
  }
  return `<svg class="icon-sm text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M4.2 4.2l15.6 15.6"/><path d="M6 8a6 6 0 0 1 8.6-5.4"/><path d="M18 8a6 6 0 0 1-.3 1.9"/><path d="M13.7 13.7A6 6 0 0 1 6 8"/><path d="M3 17h14"/></svg>`;
}

function getRotateCwIcon() {
  return `<svg class="icon-sm text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>`;
}

function getEditIcon() {
  return `<svg class="icon-sm text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 3a3 3 0 0 1 4.24 4.24L7.5 21.76 2 23l1.24-5.5L18 3z"/></svg>`;
}

function getTrashIcon() {
  return `<svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
}

// --- Main Application Data Loader & Renderer ---
async function loadApplicationData() {
  isLoadingData = true;
  apiErrorMessage = null;
  renderQueueTable();

  try {
    shipments = await ShipmentDataService.fetchAll(backendConfig);
    if (!selectedId || !shipments.find(s => s.id === selectedId)) {
      selectedId = shipments[0]?.id || null;
    }
  } catch (err) {
    console.error(`Error loading data in mode [${backendConfig.mode}]:`, err);
    apiErrorMessage = `${err.message || err}. Falling back to local data prototype.`;
    shipments = loadLocalStorageShipments();
    if (!selectedId || !shipments.find(s => s.id === selectedId)) {
      selectedId = shipments[0]?.id || null;
    }
  } finally {
    isLoadingData = false;
    renderApp();
  }
}

function renderApp() {
  renderHeaderAndMetrics();
  populateDropdownFilters();
  renderSelectedShipmentCard();
  renderQueueTable();
  renderHistoryTimeline();
}

function renderHeaderAndMetrics() {
  const modeLabel = document.getElementById('current-mode-label');
  if (modeLabel) modeLabel.textContent = (backendConfig.mode || 'mock').toUpperCase();

  const totalEl = document.getElementById('metric-total');
  const activeEl = document.getElementById('metric-active');
  const delayedEl = document.getElementById('metric-delayed');

  if (totalEl) totalEl.textContent = shipments.length;
  if (activeEl) activeEl.textContent = shipments.filter(s => s.status !== 'Delivered').length;
  if (delayedEl) delayedEl.textContent = shipments.filter(s => s.status === 'Delayed').length;
}

function populateDropdownFilters() {
  const detSelect = document.getElementById('filter-detachment');
  if (detSelect) {
    const currentDet = detSelect.value;
    const detachments = Array.from(new Set(shipments.map(s => s.destination).filter(Boolean))).sort();

    detSelect.innerHTML = '<option value="">All Detachments</option>' +
      detachments.map(d => `<option value="${d}" ${d === currentDet ? 'selected' : ''}>${d}</option>`).join('');
  }

  const statusSelect = document.getElementById('filter-status');
  if (statusSelect) {
    const currentSt = statusSelect.value;
    const statuses = ['Pending Airwaybill', 'Delayed', 'Pending Custom Clearance Letter', 'In-Transit (Air-I)', 'Delivered'];

    statusSelect.innerHTML = '<option value="">All Statuses</option>' +
      statuses.map(s => `<option value="${s}" ${s === currentSt ? 'selected' : ''}>${s}</option>`).join('');
  }
}

function getFilteredShipments() {
  return shipments.filter(s => {
    if (activeFilters.searchQuery) {
      const q = activeFilters.searchQuery.toLowerCase().trim();
      const match = (s.iodNumber || '').toLowerCase().includes(q) ||
        (s.tailNo || '').toLowerCase().includes(q) ||
        (s.airwaybill || '').toLowerCase().includes(q) ||
        (s.mpn || '').toLowerCase().includes(q) ||
        (s.nsn || '').toLowerCase().includes(q) ||
        (s.destination || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q);
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

  if (!bodyEl) return;

  if (!sel) {
    if (subtitleEl) subtitleEl.textContent = 'No shipment selected';
    bodyEl.innerHTML = '<div class="empty-state-card">Select a shipment from the queue below to inspect details.</div>';
    return;
  }

  if (subtitleEl) subtitleEl.textContent = `${sel.iodNumber} / ${sel.airwaybill || 'N/A'}`;

  bodyEl.innerHTML = `
    <div class="detail-item">
      <span class="detail-label">IOD Number</span>
      <span class="detail-value">${sel.iodNumber}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">A/C Tail No.</span>
      <span class="detail-value">${sel.tailNo}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Airwaybill</span>
      <span class="detail-value">${sel.airwaybill || '—'}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Status</span>
      <span class="detail-value">${sel.status}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Destination Detachment</span>
      <span class="detail-value">${sel.destination}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Demand Date & Time</span>
      <span class="detail-value">${sel.demandDateTime}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">ETD</span>
      <span class="detail-value">${sel.etd}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">ETA</span>
      <span class="detail-value">${sel.eta}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">MPN</span>
      <span class="detail-value">${sel.mpn}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">NSN</span>
      <span class="detail-value">${sel.nsn}</span>
    </div>
    <div class="detail-item span-2">
      <span class="detail-label">Spares Description</span>
      <span class="detail-value">${sel.description}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Quantity</span>
      <span class="detail-value">${sel.quantity}</span>
    </div>
    <div class="detail-item span-3">
      <span class="detail-label">Remarks</span>
      <span class="detail-value">${sel.remarks || '—'}</span>
    </div>
  `;
}

function renderQueueTable() {
  const tbody = document.getElementById('queue-table-body');
  if (!tbody) return;

  if (isLoadingData) {
    tbody.innerHTML = '<tr><td colspan="5" class="table-loading-cell"><span class="spinner"></span> Synchronizing with backend API...</td></tr>';
    return;
  }

  let errorBannerHtml = '';
  if (apiErrorMessage) {
    errorBannerHtml = `<tr><td colspan="5" class="table-error-cell"><div class="alert-banner error no-margin">⚠️ ${apiErrorMessage}</div></td></tr>`;
  }

  const filtered = getFilteredShipments();

  if (filtered.length === 0) {
    tbody.innerHTML = errorBannerHtml + '<tr><td colspan="5" class="table-empty-cell">No matching shipments found.</td></tr>';
    return;
  }

  tbody.innerHTML = errorBannerHtml + filtered.map(item => {
    const isSelected = item.id === selectedId;
    const badgeClass = getStatusBadgeClass(item.status);
    const bellSvg = getBellIcon(item.notificationActive);
    const rotateSvg = getRotateCwIcon();
    const editSvg = getEditIcon();
    const trashSvg = getTrashIcon();

    return `
      <tr class="${isSelected ? 'selected-row' : ''}" data-id="${item.id}">
        <td>
          <div class="iod-cell-main">${item.iodNumber}</div>
          <div class="iod-cell-sub">${item.tailNo}</div>
        </td>
        <td>
          <span class="status-pill ${badgeClass}">${item.status}</span>
        </td>
        <td>${item.destination}</td>
        <td>${item.eta}</td>
        <td class="text-right">
          <div class="action-btn-group" data-id="${item.id}">
            <button type="button" class="btn-icon-action btn-act-bell" title="${item.notificationActive ? 'Disable Notification' : 'Enable Notification'}">${bellSvg}</button>
            <button type="button" class="btn-icon-action btn-act-status" title="Update Status / Log Event">${rotateSvg}</button>
            <button type="button" class="btn-icon-action btn-act-edit" title="Edit Shipment">${editSvg}</button>
            <button type="button" class="btn-icon-action danger btn-act-delete" title="Delete Shipment">${trashSvg}</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderHistoryTimeline() {
  const container = document.getElementById('history-timeline-body');
  if (!container) return;

  const sel = shipments.find(s => s.id === selectedId);

  if (!sel || !sel.history || sel.history.length === 0) {
    container.innerHTML = '<div class="empty-history-text">No history recorded for this shipment.</div>';
    return;
  }

  container.innerHTML = sel.history.map(e => `
    <div class="history-item">
      <div class="history-header">
        <span class="history-status-title">${e.status}</span>
        <span class="history-timestamp">${e.timestamp}</span>
      </div>
      <p class="history-desc">${e.description}</p>
    </div>
  `).join('');
}

// --- Event Handlers & Modal Binding ---
function setupEventListeners() {
  // Search & Filters
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeFilters.searchQuery = e.target.value;
      renderQueueTable();
    });
  }

  const detSelect = document.getElementById('filter-detachment');
  if (detSelect) {
    detSelect.addEventListener('change', (e) => {
      activeFilters.detachment = e.target.value;
      renderQueueTable();
    });
  }

  const statusSelect = document.getElementById('filter-status');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      activeFilters.status = e.target.value;
      renderQueueTable();
    });
  }

  // Table row click & table action buttons delegation
  const tbody = document.getElementById('queue-table-body');
  if (tbody) {
    tbody.addEventListener('click', async (e) => {
      const tr = e.target.closest('tr');
      if (!tr) return;
      const id = tr.getAttribute('data-id');
      if (!id) return;

      const btnBell = e.target.closest('.btn-act-bell');
      const btnStatus = e.target.closest('.btn-act-status');
      const btnEdit = e.target.closest('.btn-act-edit');
      const btnDelete = e.target.closest('.btn-act-delete');

      if (btnBell) {
        e.stopPropagation();
        const item = shipments.find(s => s.id === id);
        if (item) {
          item.notificationActive = !item.notificationActive;
          try {
            await ShipmentDataService.save(backendConfig, item);
          } catch (err) {
            console.error('Error toggling notification:', err);
          }
        }
        renderQueueTable();
        return;
      }

      if (btnStatus) {
        e.stopPropagation();
        openStatusUpdateModal(id);
        return;
      }

      if (btnEdit) {
        e.stopPropagation();
        openShipmentModal(id);
        return;
      }

      if (btnDelete) {
        e.stopPropagation();
        openDeleteModal(id);
        return;
      }

      // Select row
      selectedId = id;
      renderApp();
    });
  }

  // Header Buttons
  const btnNew = document.getElementById('btn-new-shipment');
  if (btnNew) btnNew.addEventListener('click', () => openShipmentModal(null));

  const btnExport = document.getElementById('btn-export-csv');
  if (btnExport) btnExport.addEventListener('click', exportCSV);

  const btnModeConfig = document.getElementById('btn-mode-config');
  if (btnModeConfig) btnModeConfig.addEventListener('click', () => openConfigModalUI());

  const btnAddEvent = document.getElementById('btn-add-event');
  if (btnAddEvent) {
    btnAddEvent.addEventListener('click', () => {
      if (selectedId) openStatusUpdateModal(selectedId);
    });
  }

  // Close modals when clicking close triggers or clicking outside modal content
  document.querySelectorAll('.modal-close-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.add('hidden');
      }
    });
  });

  // Shipment Form submit
  const formShipment = document.getElementById('form-shipment');
  if (formShipment) {
    formShipment.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveShipmentFromForm();
    });
  }

  // Status Update Form submit
  const formStatusUpdate = document.getElementById('form-status-update');
  if (formStatusUpdate) {
    formStatusUpdate.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveStatusUpdateFromForm();
    });
  }

  // Delete Confirm
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', async () => {
      if (!pendingDeleteId) return;
      const idToDelete = pendingDeleteId;
      try {
        await ShipmentDataService.delete(backendConfig, idToDelete);
        shipments = shipments.filter(s => s.id !== idToDelete);
        if (selectedId === idToDelete) {
          selectedId = shipments[0]?.id || null;
        }
      } catch (err) {
        alert(`Error deleting shipment: ${err.message}`);
      }
      closeModal('modal-delete');
      renderApp();
    });
  }

  // Backend Config Radio buttons toggle
  document.querySelectorAll('input[name="backend-mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      updateConfigSubcardVisibility(e.target.value);
    });
  });

  // Test Connection button
  const btnTestConfig = document.getElementById('btn-test-config');
  if (btnTestConfig) {
    btnTestConfig.addEventListener('click', async () => {
      const tempConfig = gatherConfigFromUI();
      const statusContainer = document.getElementById('config-test-status');
      if (statusContainer) {
        statusContainer.style.display = 'block';
        statusContainer.className = 'alert-banner info';
        statusContainer.innerHTML = '<span class="spinner"></span> Testing connection to backend API...';
      }

      const res = await ShipmentDataService.testConnection(tempConfig);
      if (statusContainer) {
        statusContainer.style.display = 'block';
        statusContainer.className = res.success ? 'alert-banner success' : 'alert-banner error';
        statusContainer.innerHTML = (res.success ? '✅ ' : '❌ ') + res.message;
      }
    });
  }

  // Config save
  const btnSaveConfig = document.getElementById('btn-save-config');
  if (btnSaveConfig) {
    btnSaveConfig.addEventListener('click', async () => {
      backendConfig = gatherConfigFromUI();
      saveConfig();
      closeModal('modal-config');
      await loadApplicationData();
    });
  }
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('hidden');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('hidden');
}

function gatherConfigFromUI() {
  const selectedMode = document.querySelector('input[name="backend-mode"]:checked')?.value || 'mock';
  const siteUrl = document.getElementById('cfg-sp-site')?.value.trim() || '';
  const listName = document.getElementById('cfg-sp-list')?.value.trim() || 'AircraftSparesShipments';
  const dataverseUrl = document.getElementById('cfg-dv-url')?.value.trim() || 'https://org.crm.dynamics.com/api/data/v9.2';
  const dataverseTable = document.getElementById('cfg-dv-table')?.value.trim() || 'cr_spares_shipments';

  return {
    mode: selectedMode,
    siteUrl,
    listName,
    dataverseUrl,
    dataverseTable
  };
}

function updateConfigSubcardVisibility(mode) {
  const spSubcard = document.getElementById('config-sharepoint-fields');
  const dvSubcard = document.getElementById('config-dataverse-fields');

  if (spSubcard) spSubcard.style.display = (mode === 'sharepoint') ? 'block' : 'none';
  if (dvSubcard) dvSubcard.style.display = (mode === 'dataverse') ? 'block' : 'none';
}

function openConfigModalUI() {
  const modeRadio = document.querySelector(`input[name="backend-mode"][value="${backendConfig.mode}"]`);
  if (modeRadio) modeRadio.checked = true;

  const spSiteInput = document.getElementById('cfg-sp-site');
  if (spSiteInput) spSiteInput.value = backendConfig.siteUrl || '';

  const spListInput = document.getElementById('cfg-sp-list');
  if (spListInput) spListInput.value = backendConfig.listName || 'AircraftSparesShipments';

  const dvUrlInput = document.getElementById('cfg-dv-url');
  if (dvUrlInput) dvUrlInput.value = backendConfig.dataverseUrl || 'https://org.crm.dynamics.com/api/data/v9.2';

  const dvTableInput = document.getElementById('cfg-dv-table');
  if (dvTableInput) dvTableInput.value = backendConfig.dataverseTable || 'cr_spares_shipments';

  const testStatus = document.getElementById('config-test-status');
  if (testStatus) {
    testStatus.className = 'alert-banner info';
    testStatus.style.display = 'none';
    testStatus.innerHTML = '';
  }

  updateConfigSubcardVisibility(backendConfig.mode);
  openModal('modal-config');
}

function openShipmentModal(shipmentId) {
  const isEdit = !!shipmentId;
  const titleEl = document.getElementById('modal-shipment-title');
  const btnSaveEl = document.getElementById('btn-save-shipment');

  if (titleEl) titleEl.textContent = isEdit ? 'Edit Shipment' : 'Create New Shipment';
  if (btnSaveEl) btnSaveEl.textContent = isEdit ? 'Save Changes' : 'Create Shipment';
  document.getElementById('shipment-id').value = shipmentId || '';

  if (isEdit) {
    const s = shipments.find(item => item.id === shipmentId);
    if (!s) return;
    document.getElementById('field-iod').value = s.iodNumber || '';
    document.getElementById('field-tail').value = s.tailNo || '';
    document.getElementById('field-airwaybill').value = s.airwaybill || '';
    document.getElementById('field-status').value = s.status || 'Pending Airwaybill';
    document.getElementById('field-destination').value = s.destination || '';
    document.getElementById('field-quantity').value = s.quantity || 1;
    document.getElementById('field-mpn').value = s.mpn || '';
    document.getElementById('field-nsn').value = s.nsn || '';
    document.getElementById('field-demand').value = s.demandDateTime || '';
    document.getElementById('field-etd').value = s.etd || '';
    document.getElementById('field-eta').value = s.eta || '';
    document.getElementById('field-description').value = s.description || '';
    document.getElementById('field-remarks').value = s.remarks || '';
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

async function saveShipmentFromForm() {
  const id = document.getElementById('shipment-id').value;
  const isEdit = !!id;
  const timeStr = getCurrentTimestamp();

  const formData = {
    id: id || undefined,
    iodNumber: document.getElementById('field-iod').value.trim(),
    tailNo: document.getElementById('field-tail').value.trim(),
    airwaybill: document.getElementById('field-airwaybill').value.trim(),
    status: document.getElementById('field-status').value,
    destination: document.getElementById('field-destination').value.trim(),
    quantity: parseInt(document.getElementById('field-quantity').value) || 1,
    mpn: document.getElementById('field-mpn').value.trim(),
    nsn: document.getElementById('field-nsn').value.trim(),
    demandDateTime: document.getElementById('field-demand').value.trim(),
    etd: document.getElementById('field-etd').value.trim(),
    eta: document.getElementById('field-eta').value.trim(),
    description: document.getElementById('field-description').value.trim(),
    remarks: document.getElementById('field-remarks').value.trim(),
  };

  const existing = isEdit ? shipments.find(s => s.id === id) : null;
  const statusChanged = existing ? (existing.status !== formData.status) : false;

  let newHistory = existing?.history ? [...existing.history] : [];
  if (!isEdit) {
    newHistory = [{ id: `hist-${Date.now()}`, status: formData.status, timestamp: timeStr, description: `New shipment recorded. Status set to ${formData.status}.` }];
  } else if (statusChanged) {
    newHistory = [{ id: `hist-${Date.now()}`, status: formData.status, timestamp: timeStr, description: `Status updated to ${formData.status}.` }, ...newHistory];
  }

  const shipmentToSave = {
    ...formData,
    notificationActive: existing ? existing.notificationActive : false,
    history: newHistory
  };

  try {
    const saved = await ShipmentDataService.save(backendConfig, shipmentToSave);
    if (!isEdit && saved?.id) {
      selectedId = saved.id;
    }
    closeModal('modal-shipment');
    await loadApplicationData();
  } catch (err) {
    alert(`Error saving shipment to backend (${backendConfig.mode}): ${err.message}`);
  }
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

async function saveStatusUpdateFromForm() {
  const id = document.getElementById('status-update-shipment-id').value;
  const s = shipments.find(item => item.id === id);
  if (!s) return;

  const newStatus = document.getElementById('status-update-select').value;
  const remarks = document.getElementById('status-update-remarks').value.trim() || `Status updated to ${newStatus}`;
  const timeStr = getCurrentTimestamp();

  const updatedHistory = [
    { id: `hist-${Date.now()}`, status: newStatus, timestamp: timeStr, description: remarks },
    ...(s.history || [])
  ];

  const updatedShipment = {
    ...s,
    status: newStatus,
    history: updatedHistory
  };

  try {
    await ShipmentDataService.save(backendConfig, updatedShipment);
    closeModal('modal-status-update');
    await loadApplicationData();
  } catch (err) {
    alert(`Error updating status: ${err.message}`);
  }
}

function openDeleteModal(shipmentId) {
  const s = shipments.find(item => item.id === shipmentId);
  if (!s) return;
  pendingDeleteId = shipmentId;
  document.getElementById('delete-confirm-text').innerHTML = `Are you sure you want to delete shipment <span class="font-bold text-slate-800">${s.iodNumber} (${s.tailNo})</span>? This action cannot be undone.`;
  openModal('modal-delete');
}

function exportCSV() {
  const filtered = getFilteredShipments();
  const headers = ['IOD Number', 'Tail Number', 'Airwaybill', 'Status', 'Destination', 'Demand Date/Time', 'ETD', 'ETA', 'MPN', 'NSN', 'Quantity', 'Description', 'Remarks'];
  const rows = filtered.map(s => [
    `"${s.iodNumber}"`, `"${s.tailNo}"`, `"${s.airwaybill}"`, `"${s.status}"`,
    `"${s.destination}"`, `"${s.demandDateTime}"`, `"${s.etd}"`, `"${s.eta}"`,
    `"${s.mpn}"`, `"${s.nsn}"`, s.quantity, `"${(s.description || '').replace(/"/g, '""')}"`, `"${(s.remarks || '').replace(/"/g, '""')}"`
  ]);
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Aircraft_Spares_Shipments_2026.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// --- Initialize App ---
async function initApp() {
  setupEventListeners();
  await loadApplicationData();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
