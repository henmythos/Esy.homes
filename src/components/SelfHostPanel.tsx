import React, { useState } from 'react';
import { SelfHostConfig } from '../types';
import { 
  X, Database, Cloud, Zap, Shield, Github, Globe, Check, Copy, Code, Sparkles, RefreshCw, Terminal
} from 'lucide-react';

interface SelfHostPanelProps {
  config: SelfHostConfig;
  onSaveConfig: (config: SelfHostConfig) => void;
  onClose: () => void;
}

export const SelfHostPanel: React.FC<SelfHostPanelProps> = ({
  config,
  onSaveConfig,
  onClose,
}) => {
  const [formConfig, setFormConfig] = useState<SelfHostConfig>(config);
  const [activeTab, setActiveTab] = useState<'overview' | 'turso' | 'r2' | 'cloudflare' | 'github'>('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const sqlSchema = `-- ezy.homes Turso (libsql) Database Schema
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  address TEXT,
  latitude REAL,
  longitude REAL,
  price_per_night_usd REAL NOT NULL,
  cleaning_fee_usd REAL DEFAULT 0,
  max_guests INTEGER DEFAULT 2,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  owner_whatsapp TEXT NOT NULL,
  owner_phone TEXT,
  images_json TEXT, -- Cloudflare R2 URLs
  amenities_json TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS availability_calendar (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES properties(id),
  blocked_date DATE NOT NULL,
  status TEXT DEFAULT 'booked'
);
`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({ ...formConfig, isConfigured: true });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const copySqlSchema = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Self-Host Engine (Turso & Cloudflare R2)</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Open Source Stack
                </span>
              </div>
              <p className="text-xs text-gray-400">Low-latency architecture designed for global & emerging market hosting</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-800 px-6 py-2 border-b border-gray-700/80 flex items-center gap-2 overflow-x-auto text-xs font-bold text-gray-400 no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview' ? 'bg-gray-700 text-white font-extrabold' : 'hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Stack Overview
          </button>
          <button
            onClick={() => setActiveTab('turso')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'turso' ? 'bg-gray-700 text-white font-extrabold' : 'hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" /> Turso Database
          </button>
          <button
            onClick={() => setActiveTab('r2')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'r2' ? 'bg-gray-700 text-white font-extrabold' : 'hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-amber-400" /> Cloudflare R2
          </button>
          <button
            onClick={() => setActiveTab('cloudflare')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'cloudflare' ? 'bg-gray-700 text-white font-extrabold' : 'hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400" /> Rocket Loader Edge
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'github' ? 'bg-gray-700 text-white font-extrabold' : 'hover:text-white'
            }`}
          >
            <Github className="w-3.5 h-3.5 text-gray-300" /> Vercel & GitHub
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs flex flex-col gap-2">
                  <div className="p-2 w-fit rounded-xl bg-cyan-50 text-cyan-600 font-bold">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">Turso SQLite Edge DB</h3>
                  <p className="text-xs text-gray-500">
                    Libsql distributed database replica at the edge for sub-10ms queries in emerging markets.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs flex flex-col gap-2">
                  <div className="p-2 w-fit rounded-xl bg-amber-50 text-amber-600 font-bold">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">Cloudflare R2 Media CDN</h3>
                  <p className="text-xs text-gray-500">
                    Zero egress fee object storage for property images with fast responsive image delivery.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs flex flex-col gap-2">
                  <div className="p-2 w-fit rounded-xl bg-rose-50 text-rose-600 font-bold">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">Rocket Loader & WAF</h3>
                  <p className="text-xs text-gray-500">
                    Asynchronous script optimization and DDoS security protection for high speed mobile loads.
                  </p>
                </div>

              </div>

              {/* Status Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <h4 className="font-bold text-emerald-900 text-sm">Self-Hosted Connection Ready</h4>
                    <p className="text-xs text-emerald-700">esy.homes is configured for zero lock-in deployment.</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs">Active</span>
              </div>
            </div>
          )}

          {activeTab === 'turso' && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-gray-900 text-sm">Turso Database Configuration</h3>
                <p className="text-xs text-gray-500">
                  Connect your Turso Database URL and Auth Token.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700">Turso Database URL (libsql://)</label>
                  <input
                    type="text"
                    value={formConfig.tursoDatabaseUrl}
                    onChange={(e) => setFormConfig({ ...formConfig, tursoDatabaseUrl: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono text-xs bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700">Turso Auth Token</label>
                  <input
                    type="password"
                    value={formConfig.tursoAuthToken}
                    onChange={(e) => setFormConfig({ ...formConfig, tursoAuthToken: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono text-xs bg-white"
                  />
                </div>
              </div>

              {/* SQL Schema Viewer */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-cyan-600" /> Turso SQLite Schema
                  </label>
                  <button
                    onClick={copySqlSchema}
                    className="px-3 py-1 rounded-lg bg-gray-900 text-white font-bold text-[11px] hover:bg-gray-800 flex items-center gap-1"
                  >
                    {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy SQL'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-2xl bg-gray-900 text-gray-200 font-mono text-[11px] overflow-x-auto border border-gray-800 leading-relaxed">
                  {sqlSchema}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'r2' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-gray-900 text-sm">Cloudflare R2 Object Storage Settings</h3>
                <p className="text-xs text-gray-500">
                  Configure your Cloudflare R2 bucket for property photos with zero bandwidth fees.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700">R2 Bucket Name</label>
                  <input
                    type="text"
                    value={formConfig.cloudflareR2Bucket}
                    onChange={(e) => setFormConfig({ ...formConfig, cloudflareR2Bucket: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono text-xs bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700">Account ID</label>
                  <input
                    type="text"
                    value={formConfig.cloudflareR2AccountId}
                    onChange={(e) => setFormConfig({ ...formConfig, cloudflareR2AccountId: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono text-xs bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">R2 Public CDN Domain</label>
                <input
                  type="text"
                  value={formConfig.cloudflareR2PublicDomain}
                  onChange={(e) => setFormConfig({ ...formConfig, cloudflareR2PublicDomain: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono text-xs bg-white"
                />
              </div>
            </div>
          )}

          {activeTab === 'cloudflare' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col gap-2">
                <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" /> Rocket Loader Optimization
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Cloudflare Rocket Loader defers javascript execution to ensure instantaneous first-contentful paint (FCP) for users on 3G and 4G mobile connections in emerging markets.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-200">
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">Enable Rocket Loader Headers</h4>
                  <p className="text-[11px] text-gray-500">Injects `data-cfasync="true"` optimization hints</p>
                </div>
                <input
                  type="checkbox"
                  checked={formConfig.cloudflareRocketLoaderEnabled}
                  onChange={(e) => setFormConfig({ ...formConfig, cloudflareRocketLoaderEnabled: e.target.checked })}
                  className="w-5 h-5 rounded-md accent-rose-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-gray-900 text-white flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <Github className="w-4 h-4 text-rose-400" /> Export & Deploy to GitHub / Vercel
                  </h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  1. Click the <strong>Export to GitHub</strong> option in AI Studio top settings menu.
                  <br />
                  2. Import the repository in <strong>Vercel</strong> or <strong>Cloudflare Pages</strong>.
                  <br />
                  3. Add `GEMINI_API_KEY` and Turso env variables.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {isSaved ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Config Saved
              </span>
            ) : 'esy.homes Self-Host Stack v1.0'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs shadow-md transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
