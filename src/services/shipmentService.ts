import { Shipment, BackendConfig } from '../types/shipment';

const LOCAL_STORAGE_KEY = 'spares_shipments_data_v1';
const CONFIG_STORAGE_KEY = 'spares_backend_config_v1';

export const DEFAULT_CONFIG: BackendConfig = {
  tursoUrl: 'libsql://spareshipmenttracker-5ais.aws-ap-northeast-1.turso.io',
  tursoAuthToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA3MzIxNjgsImlkIjoiMDFhMGVjMzktOTUwMS03MjNmLWFlNzQtZjFjODIzMDQ4MTQ1Iiwia2lkIjoiSHR3WHkzaVZSWjFJT3ZkMUlaTFVDTjJfdmdqQUV2bXpvNldhOGpuTVZtVSIsInJpZCI6ImI1ZjQ3NTg3LTY5MjktNDAxYy1hOWQ5LWFhOGYwNDIzNTYyZSJ9.QfKP0APdJaS0sdMbpv7bGRNVvp4TQ6SG6MRIbv2Z34_YH7FJt8Cbi59qLsnTxYvBfqSK3G0YxpS8qTFH0GebBQ', // Enter your Turso Auth Token here or via Settings Modal
  tursoTable: 'tbl_shipment_details',
};

// --- Storage Helper Utilities ---
export function loadShipmentsFromStorage(): Shipment[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading shipments from storage:', err);
    return [];
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
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveBackendConfig(config: BackendConfig): void {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

// --- Turso Database libSQL HTTP API Integration ---

function parseTursoValue(valObj: any): any {
  if (valObj === null || valObj === undefined) return null;
  if (typeof valObj !== 'object') return valObj;
  if (valObj.type === 'null') return null;
  if ('value' in valObj) {
    if (valObj.type === 'integer' || valObj.type === 'numeric') {
      return Number(valObj.value);
    }
    return valObj.value;
  }
  if ('base64' in valObj) return valObj.base64;
  return null;
}

function parseTursoResult(execResult: any): any[] {
  const cols = (execResult.cols || []).map((c: any) => c.name);
  const rawRows = execResult.rows || [];
  return rawRows.map((rowArray: any[]) => {
    const obj: Record<string, any> = {};
    cols.forEach((colName: string, idx: number) => {
      obj[colName] = parseTursoValue(rowArray[idx]);
    });
    return obj;
  });
}

function toTursoArg(val: any): any {
  if (val === null || val === undefined) return { type: 'null' };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) {
      return { type: 'integer', value: String(val) };
    }
    return { type: 'float', value: val };
  }
  if (typeof val === 'boolean') {
    return { type: 'integer', value: val ? '1' : '0' };
  }
  return { type: 'text', value: String(val) };
}

export async function executeTursoRaw(config: BackendConfig, sql: string, args: any[] = []): Promise<any> {
  let dbUrl = (config.tursoUrl || '').trim();
  if (!dbUrl) {
    throw new Error('Turso Database URL is missing. Set it in Settings modal or DEFAULT_CONFIG.');
  }
  dbUrl = dbUrl.replace(/^libsql:\/\//i, 'https://').replace(/^http:\/\//i, 'https://').replace(/\/$/, '');
  if (!dbUrl.startsWith('https://')) {
    dbUrl = 'https://' + dbUrl;
  }

  const token = (config.tursoAuthToken || '').trim();
  const endpoint = `${dbUrl}/v2/pipeline`;
  const formattedArgs = args.map(toTursoArg);

  const body = {
    requests: [
      {
        type: 'execute',
        stmt: {
          sql: sql,
          args: formattedArgs,
        },
      },
      { type: 'close' },
    ],
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Turso HTTP ${res.status}: ${res.statusText || ''} ${errText}`);
  }

  const data = await res.json();
  const resultObj = data.results?.[0];
  if (resultObj?.type === 'error') {
    throw new Error(`Turso Error: ${resultObj.error?.message || JSON.stringify(resultObj.error)}`);
  }

  return resultObj?.response?.result;
}

export async function executeTursoQuery(config: BackendConfig, sql: string, args: any[] = []): Promise<any[]> {
  const execRes = await executeTursoRaw(config, sql, args);
  if (!execRes) return [];
  return parseTursoResult(execRes);
}

const TURSO_FIELD_MAPPINGS: Record<string, string[]> = {
  id: ['id', 'ID', 'Id', 'shipment_id', 'shipmentId'],
  iodNumber: ['IOD Number', 'iodNumber', 'iod_number', 'iodnumber', 'Title', 'title', 'IODNumber', 'iod_no'],
  tailNo: ['A/C Tail No.', 'A/C Tail No', 'Tail Number', 'tailNo', 'tail_no', 'tailno', 'TailNo', 'ac_tail_no'],
  airwaybill: ['Airwaybill', 'airwaybill', 'air_way_bill', 'awb'],
  status: ['Status', 'status'],
  destination: ['Destination', 'destination', 'destination_detachment'],
  demandDateTime: ['Demand Date Time', 'demandDateTime', 'demand_date_time', 'demanddatetime', 'DemandDateTime'],
  etd: ['ETD', 'etd', 'estimated_time_departure'],
  eta: ['ETA', 'eta', 'estimated_time_arrival'],
  mpn: ['MPN', 'mpn'],
  nsn: ['NSN', 'nsn'],
  description: ['Spares Description', 'description', 'Description', 'spares_description', 'SparesDescription'],
  quantity: ['Quantity', 'quantity'],
  remarks: ['Remarks', 'remarks'],
  notificationActive: ['notificationActive', 'notification_active', 'notificationactive', 'NotificationActive'],
  history: ['history', 'status_history', 'statushistoryjson', 'StatusHistoryJSON', 'StatusHistory', 'history_json'],
};

function getTursoItemVal(item: Record<string, any>, synonyms: string[]): any {
  if (!item || typeof item !== 'object') return null;
  for (const s of synonyms) {
    if (s in item && item[s] !== undefined && item[s] !== null) return item[s];
  }
  const itemEntries = Object.entries(item);
  for (const s of synonyms) {
    const normSyn = s.toLowerCase().replace(/[\s\._\/-]/g, '');
    for (const [k, v] of itemEntries) {
      const normKey = k.toLowerCase().replace(/[\s\._\/-]/g, '');
      if (normKey === normSyn && v !== undefined && v !== null) return v;
    }
  }
  return null;
}

export function mapItemFromTurso(item: any): Shipment {
  let history: any[] = [];
  const rawHist = getTursoItemVal(item, TURSO_FIELD_MAPPINGS.history);
  if (rawHist) {
    try {
      history = typeof rawHist === 'string' ? JSON.parse(rawHist) : rawHist;
    } catch {
      history = [];
    }
  }

  const notif = getTursoItemVal(item, TURSO_FIELD_MAPPINGS.notificationActive);
  const rawQty = getTursoItemVal(item, TURSO_FIELD_MAPPINGS.quantity);

  return {
    id: String(getTursoItemVal(item, TURSO_FIELD_MAPPINGS.id) ?? ''),
    iodNumber: String(getTursoItemVal(item, TURSO_FIELD_MAPPINGS.iodNumber) ?? ''),
    tailNo: String(getTursoItemVal(item, TURSO_FIELD_MAPPINGS.tailNo) ?? ''),
    airwaybill: String(getTursoItemVal(item, TURSO_FIELD_MAPPINGS.airwaybill) ?? ''),
    status: String(getTursoItemVal(item, TURSO_FIELD_MAPPINGS.status) ?? 'Pending Airwaybill'),
    destination: String(getTursoItemVal(item, TURSO_FIELD_MAPPINGS.destination) ?? ''),
    demandDateTime: String(getTursoItemVal(item, TURSO_FIELD_MAPPINGS.demandDateTime) ?? ''),
    etd: String(getTursoItemVal(item, TURSO_FIELD_MAPPINGS.etd) ?? ''),
    eta: String(getTursoItemVal(item, TURSO_FIELD_MAPPINGS.eta) ?? ''),
    mpn: String(getTursoItemVal(item, TURSO_FIELD_MAPPINGS.mpn) ?? ''),
    nsn: String(getTursoItemVal(item, TURSO_FIELD_MAPPINGS.nsn) ?? ''),
    description: String(getTursoItemVal(item, TURSO_FIELD_MAPPINGS.description) ?? ''),
    quantity: parseInt(String(rawQty ?? 1), 10) || 1,
    remarks: String(getTursoItemVal(item, TURSO_FIELD_MAPPINGS.remarks) ?? ''),
    notificationActive: notif === true || notif === 1 || notif === '1' || notif === 'true',
    history: Array.isArray(history) ? history : [],
  };
}

export interface ColumnInfo {
  name: string;
  type: string;
  pk: boolean;
}

export async function getTableColumnsInfo(config: BackendConfig, tableName: string): Promise<ColumnInfo[]> {
  try {
    const rows = await executeTursoQuery(config, `PRAGMA table_info("${tableName}")`, []);
    if (rows && rows.length > 0) {
      return rows.map((r: any) => ({
        name: String(r.name),
        type: String(r.type || r.decltype || '').toUpperCase(),
        pk: Number(r.pk) > 0,
      }));
    }
  } catch (err) {
    console.warn('Could not fetch PRAGMA table_info:', err);
  }
  return [];
}

export async function getMatchedColumns(
  config: BackendConfig,
  shipment: Shipment,
  isInsert: boolean = false
): Promise<Record<string, any>> {
  const tableName = config.tursoTable || 'tbl_shipment_details';
  let dbCols = await getTableColumnsInfo(config, tableName);

  if (!dbCols.length) {
    dbCols = [
      { name: 'id', type: 'INTEGER', pk: true },
      { name: 'IOD Number', type: 'TEXT', pk: false },
      { name: 'Airwaybill', type: 'TEXT', pk: false },
      { name: 'A/C Tail No.', type: 'TEXT', pk: false },
      { name: 'Status', type: 'TEXT', pk: false },
      { name: 'Destination', type: 'TEXT', pk: false },
      { name: 'Demand Date Time', type: 'TEXT', pk: false },
      { name: 'ETD', type: 'TEXT', pk: false },
      { name: 'ETA', type: 'TEXT', pk: false },
      { name: 'MPN', type: 'TEXT', pk: false },
      { name: 'NSN', type: 'TEXT', pk: false },
      { name: 'Spares Description', type: 'TEXT', pk: false },
      { name: 'Quantity', type: 'INTEGER', pk: false },
      { name: 'Remarks', type: 'TEXT', pk: false },
    ];
  }

  const fieldMappings: Record<string, string[]> = {
    id: ['id', 'ID', 'Id', 'shipment_id', 'shipmentId'],
    iodNumber: ['iodNumber', 'iod_number', 'iodnumber', 'Title', 'title', 'IODNumber', 'iod_no', 'IOD Number'],
    tailNo: ['tailNo', 'tail_no', 'tailno', 'TailNo', 'TailNumber', 'ac_tail_no', 'A/C Tail No.', 'A/C Tail No'],
    airwaybill: ['airwaybill', 'Airwaybill', 'air_way_bill', 'awb'],
    status: ['status', 'Status'],
    destination: ['destination', 'Destination', 'destination_detachment'],
    demandDateTime: ['demandDateTime', 'demand_date_time', 'demanddatetime', 'DemandDateTime', 'Demand Date Time'],
    etd: ['etd', 'ETD', 'estimated_time_departure'],
    eta: ['eta', 'ETA', 'estimated_time_arrival'],
    mpn: ['mpn', 'MPN'],
    nsn: ['nsn', 'NSN'],
    description: ['description', 'Description', 'spares_description', 'SparesDescription', 'Spares Description'],
    quantity: ['quantity', 'Quantity'],
    remarks: ['remarks', 'Remarks'],
    notificationActive: ['notificationActive', 'notification_active', 'notificationactive', 'NotificationActive'],
    history: ['history', 'status_history', 'statushistoryjson', 'StatusHistoryJSON', 'StatusHistory', 'history_json'],
  };

  const matchedObj: Record<string, any> = {};

  dbCols.forEach((colInfo) => {
    const colName = colInfo.name;
    const colType = colInfo.type;
    const isPk = colInfo.pk;
    const colLower = colName.toLowerCase();

    // If inserting a new row and column is an INTEGER primary key, skip it so SQLite auto-increments
    if (isInsert && isPk && colType.includes('INT')) {
      return;
    }

    let foundAppKey: string | null = null;
    for (const [appKey, synonyms] of Object.entries(fieldMappings)) {
      if (synonyms.some((s) => s.toLowerCase() === colLower)) {
        foundAppKey = appKey;
        break;
      }
    }

    if (foundAppKey) {
      let rawVal = (shipment as any)[foundAppKey];

      if (rawVal === undefined || rawVal === null || rawVal === '') {
        if (colType.includes('INT')) {
          if (foundAppKey === 'quantity') rawVal = 1;
          else rawVal = null;
        } else {
          rawVal = null;
        }
      } else {
        if (colType.includes('INT')) {
          if (typeof rawVal === 'boolean') {
            rawVal = rawVal ? 1 : 0;
          } else {
            const parsed = parseInt(String(rawVal), 10);
            rawVal = isNaN(parsed) ? null : parsed;
          }
        } else if (foundAppKey === 'history') {
          rawVal = JSON.stringify(rawVal || []);
        } else {
          rawVal = String(rawVal);
        }
      }

      matchedObj[colName] = rawVal;
    }
  });

  return matchedObj;
}

export async function fetchFromTurso(config: BackendConfig): Promise<Shipment[]> {
  const tableName = config.tursoTable || 'tbl_shipment_details';
  const sql = `SELECT * FROM "${tableName}"`;
  const rows = await executeTursoQuery(config, sql, []);
  return rows.map((r) => mapItemFromTurso(r));
}

export async function createTursoShipment(config: BackendConfig, shipment: Shipment): Promise<Shipment> {
  const tableName = config.tursoTable || 'tbl_shipment_details';
  const colMap = await getMatchedColumns(config, shipment, true);

  const colNames = Object.keys(colMap).map((c) => `"${c}"`);
  const values = Object.values(colMap);

  const placeholders = colNames.map(() => '?').join(', ');
  const sql = `INSERT INTO "${tableName}" (${colNames.join(', ')}) VALUES (${placeholders})`;

  const rawRes = await executeTursoRaw(config, sql, values);
  const newId = rawRes?.last_insert_rowid != null ? String(rawRes.last_insert_rowid) : shipment.id || String(Date.now());

  return { ...shipment, id: newId };
}

export async function updateTursoShipment(config: BackendConfig, shipment: Shipment): Promise<Shipment> {
  const tableName = config.tursoTable || 'tbl_shipment_details';
  const colMap = await getMatchedColumns(config, shipment, false);

  const idColName = Object.keys(colMap).find((c) => c.toLowerCase() === 'id' || c.toLowerCase() === 'shipment_id') || 'id';
  let idValue: any = shipment.id;

  if (typeof idValue === 'string' && /^\d+$/.test(idValue.trim())) {
    idValue = parseInt(idValue.trim(), 10);
  }

  delete colMap[idColName];

  const setAssignments = Object.keys(colMap).map((c) => `"${c}" = ?`).join(', ');
  const values = [...Object.values(colMap), idValue];

  const sql = `UPDATE "${tableName}" SET ${setAssignments} WHERE "${idColName}" = ?`;

  await executeTursoQuery(config, sql, values);
  return shipment;
}

export async function deleteTursoShipment(config: BackendConfig, id: string): Promise<void> {
  const tableName = config.tursoTable || 'tbl_shipment_details';
  const numId = /^\d+$/.test(String(id).trim()) ? parseInt(String(id).trim(), 10) : id;
  const sql = `DELETE FROM "${tableName}" WHERE "id" = ? OR "shipment_id" = ?`;
  await executeTursoQuery(config, sql, [numId, id]);
}

export const DEFAULT_STATUSES = [
  'Pending Airwaybill',
  'Delayed',
  'Pending Custom Clearance Letter',
  'In-Transit (Air-I)',
  'Delivered',
];

export async function fetchStatusesFromTurso(config: BackendConfig): Promise<string[]> {
  const sql = `SELECT * FROM tlkp_statuses`;
  try {
    const rows = await executeTursoQuery(config, sql, []);
    const statuses = rows.map((r: any) => {
      const val =
        r.status_name ??
        r.status_title ??
        r.name ??
        r.status ??
        r.title ??
        r.label ??
        r.value ??
        (typeof r === 'object' && r !== null ? Object.values(r)[0] : String(r));
      return val ? String(val).trim() : null;
    }).filter((s): s is string => !!s);

    return statuses.length > 0 ? Array.from(new Set(statuses)) : DEFAULT_STATUSES;
  } catch (err) {
    console.warn('Could not fetch statuses from tbl_statuses table:', err);
    return DEFAULT_STATUSES;
  }
}

export interface TursoTestResult {
  success: boolean;
  message: string;
  itemCount?: number;
}

export async function testTursoConnection(config: BackendConfig): Promise<TursoTestResult> {
  try {
    const list = await fetchFromTurso(config);
    return {
      success: true,
      message: `Successfully connected to Turso Database! Found table "${config.tursoTable || 'tbl_shipment_details'}" containing ${list.length} item(s).`,
      itemCount: list.length,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Turso Connection Error: ${err.message || err}`,
    };
  }
}

// --- Unified Fetch & Save Operations ---
export async function fetchShipments(config: BackendConfig): Promise<Shipment[]> {
  return await fetchFromTurso(config);
}

export async function saveShipmentRemote(config: BackendConfig, shipment: Shipment, isEdit: boolean): Promise<Shipment> {
  if (isEdit) {
    return await updateTursoShipment(config, shipment);
  } else {
    return await createTursoShipment(config, shipment);
  }
}

export async function deleteShipmentRemote(config: BackendConfig, id: string): Promise<void> {
  await deleteTursoShipment(config, id);
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
