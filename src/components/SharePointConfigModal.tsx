import React, { useState } from 'react';
import { BackendConfig, DataBackendMode } from '../types/shipment';
import { testSharePointConnection, SharePointTestResult } from '../services/shipmentService';
import { X, Database, CheckCircle2, Code2, Server, Loader2, AlertCircle, Wifi } from 'lucide-react';

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

  const [mode, setMode] = useState<DataBackendMode>(config.mode);
  const [siteUrl, setSiteUrl] = useState(config.sharepointSiteUrl || '');
  const [listName, setListName] = useState(config.sharepointListName || '');
  const [activeTab, setActiveTab] = useState<'config' | 'snippets'>('config');

  // Test connection state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<SharePointTestResult | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testSharePointConnection(siteUrl, listName);
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
      mode,
      sharepointSiteUrl: siteUrl,
      sharepointListName: listName,
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
              Data Backend & SharePoint Settings
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
            Backend Mode & Connection Info
          </button>
          <button
            onClick={() => setActiveTab('snippets')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'snippets'
                ? 'border-[#004B87] text-[#004B87] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Integration Code Snippets & Schema
          </button>
        </div>

        {/* Content */}
        {activeTab === 'config' ? (
          <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Mode Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Active Data Source Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('mock')}
                  className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    mode === 'mock'
                      ? 'border-[#004B87] bg-sky-50/50 text-[#004B87] ring-1 ring-[#004B87]'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold uppercase flex items-center justify-between">
                    Local / Prototype Mock
                    {mode === 'mock' && <CheckCircle2 className="w-3.5 h-3.5 text-[#004B87]" />}
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Interactive prototype with LocalStorage persistence.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('sharepoint')}
                  className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    mode === 'sharepoint'
                      ? 'border-[#004B87] bg-sky-50/50 text-[#004B87] ring-1 ring-[#004B87]'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold uppercase flex items-center justify-between">
                    SharePoint List
                    {mode === 'sharepoint' && <CheckCircle2 className="w-3.5 h-3.5 text-[#004B87]" />}
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Connects to SharePoint REST / PnP JS List API.
                  </span>
                </button>
              </div>
            </div>

            {/* Mode-specific Fields */}
            {mode === 'sharepoint' && (
              <div className="p-4 rounded-lg bg-sky-50/50 border border-sky-100 space-y-4">
                <h4 className="text-xs font-bold text-[#004B87] flex items-center gap-1.5">
                  <Server className="w-4 h-4" />
                  SharePoint List Configuration
                </h4>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    SharePoint Site URL
                  </label>
                  <input
                    type="text"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#004B87] focus:border-transparent"
                    placeholder="https://tenant.sharepoint.com/sites/LogisticsHub"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    SharePoint List Name
                  </label>
                  <input
                    type="text"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#004B87] focus:border-transparent"
                    placeholder="AircraftSparesShipments"
                  />
                </div>

                {/* Test Connection Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting || !siteUrl.trim() || !listName.trim()}
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
                        {testResult.success ? 'Connection Successful' : 'Connection Status / Notice'}
                      </p>
                      <p className="font-normal opacity-90">{testResult.message}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SharePoint relative path / GitHub hosting note */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-1">
              <p className="font-semibold text-slate-800">Hosting on GitHub Pages & SharePoint:</p>
              <p>
                This app uses relative base assets (<code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">base: "./"</code>) in <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">vite.config.ts</code>. You can deploy it to GitHub Pages or copy the compiled <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">dist/</code> folder into any SharePoint Site Assets folder!
              </p>
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
                Save Backend Configuration
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4 overflow-y-auto flex-1 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-sans font-bold text-sm">
              <Code2 className="w-4 h-4 text-sky-700" />
              SharePoint REST API Sample Integration:
            </div>
            <pre className="bg-slate-900 text-sky-300 p-4 rounded-lg overflow-x-auto leading-relaxed">
{`// SharePoint REST API Call Example
import { sp } from "@pnp/sp/presets/all";

export async function fetchSharePointShipments() {
  const items = await sp.web.lists
    .getByTitle("${listName || 'AircraftSparesShipments'}")
    .items
    .select("ID,Title,ACTailNo,Airwaybill,Status,DestinationDetachment,DemandDateTime,ETD,ETA,MPN,NSN,SparesDescription,Quantity,Remarks")
    .get();

  return items.map(item => ({
    id: String(item.ID),
    iodNumber: item.Title, // standard SharePoint Title field for IOD Number
    tailNo: item.ACTailNo,
    airwaybill: item.Airwaybill,
    status: item.Status,
    destination: item.DestinationDetachment,
    demandDateTime: item.DemandDateTime,
    etd: item.ETD,
    eta: item.ETA,
    mpn: item.MPN,
    nsn: item.NSN,
    description: item.SparesDescription,
    quantity: item.Quantity,
    remarks: item.Remarks,
    history: []
  }));
}`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
