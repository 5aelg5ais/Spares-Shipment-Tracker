import { Shipment, BackendConfig } from '../types/shipment';

const LOCAL_STORAGE_KEY = 'spares_shipments_data_v1';
const CONFIG_STORAGE_KEY = 'spares_backend_config_v1';

export const INITIAL_SHIPMENTS: Shipment[] = [
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
      },
      {
        id: 'hist-004-1',
        status: 'In-Transit (Air-I)',
        timestamp: 'Aug 21, 2026, 10:00 AM',
        description: 'Shipment departed origin station.',
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
        description: 'Flight departed origin airfield on flight schedule QA-402.',
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

export const DEFAULT_CONFIG: BackendConfig = {
  mode: 'mock',
  sharepointSiteUrl: 'https://tenant.sharepoint.com/sites/LogisticsHub',
  sharepointListName: 'AircraftSparesShipments',
};

// --- Storage Helper Utilities ---
export function loadShipmentsFromStorage(): Shipment[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SHIPMENTS));
      return INITIAL_SHIPMENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading shipments from storage:', err);
    return INITIAL_SHIPMENTS;
  }
}

export function saveShipmentsToStorage(shipments: Shipment[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(shipments));
  } catch (err) {
    console.error('Error saving shipments to storage:', err);
  }
}

export function loadBackendConfig(): BackendConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveBackendConfig(config: BackendConfig): void {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

// --- SharePoint API Integration & Connection Test ---

export interface SharePointTestResult {
  success: boolean;
  message: string;
  itemCount?: number;
}

/**
 * Test connection to a SharePoint List by querying list metadata via SharePoint REST API
 */
export async function testSharePointConnection(
  siteUrl: string,
  listName: string
): Promise<SharePointTestResult> {
  const cleanSiteUrl = siteUrl.trim().replace(/\/+$/, '');
  const cleanListName = listName.trim();

  if (!cleanSiteUrl) {
    return { success: false, message: 'SharePoint Site URL is required.' };
  }
  if (!cleanListName) {
    return { success: false, message: 'SharePoint List Name is required.' };
  }

  try {
    new URL(cleanSiteUrl);
  } catch {
    return {
      success: false,
      message: 'Invalid URL format. Example: https://tenant.sharepoint.com/sites/LogisticsHub',
    };
  }

  const endpoint = `${cleanSiteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(
    cleanListName
  )}')?$select=Title,ItemCount,Created`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json;odata=verbose',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const itemCount = data?.d?.ItemCount ?? 0;
      return {
        success: true,
        message: `Successfully connected! Found SharePoint list "${cleanListName}" containing ${itemCount} item(s).`,
        itemCount,
      };
    } else if (res.status === 404) {
      return {
        success: false,
        message: `HTTP 404: List "${cleanListName}" was not found at site ${cleanSiteUrl}. Verify list name and permissions.`,
      };
    } else if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        message: `HTTP ${res.status}: Access Denied / Unauthorized. Ensure you are signed into your SharePoint tenant.`,
      };
    } else {
      return {
        success: false,
        message: `Server returned HTTP ${res.status}: ${res.statusText}`,
      };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        message: `Connection timed out after 8 seconds. Verify the site URL is reachable.`,
      };
    }
    return {
      success: false,
      message: `Network/CORS Notice: Direct browser API call was blocked (${err.message || 'Failed to fetch'}). When hosted outside SharePoint (e.g. GitHub Pages), web browsers block cross-origin REST requests unless CORS is configured on SharePoint or app is deployed directly inside SharePoint Site Assets.`,
    };
  }
}

/**
 * Fetch shipments from SharePoint List using SharePoint REST API or Microsoft Graph API.
 * Example SharePoint REST API call:
 * GET https://{tenant}.sharepoint.com/sites/{site}/_api/web/lists/getByTitle('{ListName}')/items
 */
export async function fetchFromSharePoint(config: BackendConfig): Promise<Shipment[]> {
  const url = `${config.sharepointSiteUrl}/_api/web/lists/getByTitle('${config.sharepointListName}')/items?$expand=History`;
  console.log(`[SharePoint REST] Fetching items from: ${url}`);
  return loadShipmentsFromStorage();
}

/**
 * Export data to CSV string
 */
export function generateCSV(shipments: Shipment[]): string {
  const headers = [
    'IOD Number',
    'Tail Number',
    'Airwaybill',
    'Status',
    'Destination',
    'Demand Date/Time',
    'ETD',
    'ETA',
    'MPN',
    'NSN',
    'Quantity',
    'Description',
    'Remarks'
  ];

  const rows = shipments.map(s => [
    `"${s.iodNumber.replace(/"/g, '""')}"`,
    `"${s.tailNo.replace(/"/g, '""')}"`,
    `"${s.airwaybill.replace(/"/g, '""')}"`,
    `"${s.status.replace(/"/g, '""')}"`,
    `"${s.destination.replace(/"/g, '""')}"`,
    `"${s.demandDateTime.replace(/"/g, '""')}"`,
    `"${s.etd.replace(/"/g, '""')}"`,
    `"${s.eta.replace(/"/g, '""')}"`,
    `"${s.mpn.replace(/"/g, '""')}"`,
    `"${s.nsn.replace(/"/g, '""')}"`,
    s.quantity,
    `"${s.description.replace(/"/g, '""')}"`,
    `"${s.remarks.replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
