export type ShipmentStatus =
  | 'Pending Airwaybill'
  | 'Delayed'
  | 'Pending Custom Clearance Letter'
  | 'In-Transit (Air-I)'
  | 'Delivered'
  | string;

export interface StatusHistoryItem {
  id: string;
  status: string;
  timestamp: string;
  description: string;
}

export interface Shipment {
  id: string;
  iodNumber: string;
  tailNo: string;
  airwaybill: string;
  status: ShipmentStatus;
  destination: string;
  demandDateTime: string;
  etd: string;
  eta: string;
  mpn: string;
  nsn: string;
  description: string;
  quantity: number;
  remarks: string;
  notificationActive: boolean;
  history: StatusHistoryItem[];
}

export interface ShipmentFilterOptions {
  searchQuery: string;
  detachment: string;
  status: string;
}

export type DataBackendMode = 'mock' | 'sharepoint';

export interface BackendConfig {
  mode: DataBackendMode;
  sharepointSiteUrl?: string;
  sharepointListName?: string;
}
