import React, { useState } from 'react';
import { BackendConfig } from '../types/shipment';
import { testTursoConnection, TursoTestResult } from '../services/shipmentService';
import { X, Database, CheckCircle2, Code2, Loader2, AlertCircle, Wifi, Key, Table } from 'lucide-react';

interface SharePointConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BackendConfig;
  onSaveConfig: (newConfig: BackendConfig) => void;
}

export const SharePointConfigModal: React.FC<SharePointConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  if (!isOpen) return null;

  const [tursoUrl, setTursoUrl] = useState(config.tursoUrl || 'https://spareshipmenttracker-5ais.aws-ap-northeast-1.turso.io');
  const [tursoAuthToken, setTursoAuthToken] = useState(config.tursoAuthToken || '');
  const [tursoTable, setTursoTable] = useState(config.tursoTable || 'tbl_shipment_details');
  const [activeTab, setActiveTab] = useState<'config' | 'snippets'>('config');

  // Test connection state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TursoTestResult | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const tempConfig: BackendConfig = {
        tursoUrl,
        tursoAuthToken,
        tursoTable,
      };
      const result = await testTursoConnection(tempConfig);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'An unexpected error occurred during connection test.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      tursoUrl,
      tursoAuthToken,
      tursoTable,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#004B87]" />
            <h3 className="text-base font-bold text-slate-900">
              Turso Database Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'config'
                ? 'border-[#004B87] text-[#004B87] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Turso Database Connection Details
          </button>
          <button
            onClick={() => setActiveTab('snippets')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'snippets'
                ? 'border-[#004B87] text-[#004B87] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Table Schema Reference
          </button>
        </div>

        {/* Content */}
        {activeTab === 'config' ? (
          <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1">
            <div className="p-4 rounded-lg bg-sky-50/50 border border-sky-100 space-y-4">
              <h4 className="text-xs font-bold text-[#004B87] flex items-center gap-1.5">
                <Database className="w-4 h-4" />
                Turso Connection Parameters
              </h4>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Turso Database Host URL
                </label>
                <input
                  type="text"
                  value={tursoUrl}
                  onChange={(e) => setTursoUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#004B87] focus:border-transparent font-mono"
                  placeholder="libsql://spareshipmenttracker-5ais.aws-ap-northeast-1.turso.io"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Your Turso database HTTPS endpoint.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                  <span>Turso Auth Token (Bearer Key)</span>
                  <span className="text-slate-400 font-normal text-[11px] flex items-center gap-1">
                    <Key className="w-3 h-3" /> Insert JWT Auth Token here
                  </span>
                </label>
                <input
                  type="password"
                  value={tursoAuthToken}
                  onChange={(e) => setTursoAuthToken(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#004B87] focus:border-transparent font-mono"
                  placeholder="eyJhbGciOiJIUzI1Ni..."
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Authorization Bearer token generated via <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">turso db tokens create spareshipmenttracker</code> or Turso Dashboard.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Table className="w-3.5 h-3.5 text-slate-500" />
                  Table Name
                </label>
                <input
                  type="text"
                  value={tursoTable}
                  onChange={(e) => setTursoTable(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#004B87] focus:border-transparent font-mono"
                  placeholder="tbl_shipment_details"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Name of your SQLite table storing shipment records (e.g. <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">tbl_shipment_details</code>).
                </p>
              </div>

              {/* Test Connection Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !tursoUrl.trim()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#004B87] bg-white border border-[#004B87]/30 hover:bg-sky-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  {isTesting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wifi className="w-3.5 h-3.5" />
                  )}
                  <span>{isTesting ? 'Testing Connection...' : 'Test Connection'}</span>
                </button>
              </div>

              {/* Connection Test Result Feedback */}
              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs leading-relaxed transition-all flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold mb-0.5">
                      {testResult.success ? 'Connection Successful' : 'Connection Error / Notice'}
                    </p>
                    <p className="font-normal opacity-90">{testResult.message}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-[#0A2540] hover:bg-[#13355A] rounded-lg cursor-pointer shadow-sm"
              >
                Save Database Configuration
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4 overflow-y-auto flex-1 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-sans font-bold text-sm">
              <Code2 className="w-4 h-4 text-sky-700" />
              Turso Database Table Schema (<code className="text-sky-800">{tursoTable}</code>):
            </div>
            <pre className="bg-slate-900 text-sky-300 p-4 rounded-lg overflow-x-auto leading-relaxed">
{`-- SQLite Table Schema for ${tursoTable}:
CREATE TABLE IF NOT EXISTS ${tursoTable} (
  id TEXT PRIMARY KEY,
  iodNumber TEXT,          -- or iod_number / Title
  tailNo TEXT,             -- or tail_no / TailNo / ac_tail_no
  airwaybill TEXT,         -- or Airwaybill / awb
  status TEXT,             -- or Status
  destination TEXT,        -- or Destination / destination_detachment
  demandDateTime TEXT,     -- or demand_date_time
  etd TEXT,                -- or estimated_time_departure
  eta TEXT,                -- or estimated_time_arrival
  mpn TEXT,
  nsn TEXT,
  description TEXT,        -- or spares_description
  quantity INTEGER,
  remarks TEXT,
  notificationActive INTEGER, -- 1 for true, 0 for false
  history TEXT             -- JSON array string of event logs
);`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};


