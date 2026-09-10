'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { DataSourceBadge, DemoModeBanner } from '@/components/cards';
import { getMockDataSources } from '@/data/mock-data';
import { getServiceStatus } from '@/services/marine/unified';
import { DataSource } from '@/types/marine';

export default function DataSourcesPage() {
  const [sources, setSources] = useState<DataSource[]>([]);

  useEffect(() => {
    const statusMap = getServiceStatus();
    const updatedSources = getMockDataSources().map(src => {
      let isConfigured = false;
      let status = src.status;

      if (src.id === 'open-meteo') {
        isConfigured = statusMap.openMeteo.configured;
        status = isConfigured ? 'FORECAST' : 'MOCK';
      } else if (src.id === 'copernicus') {
        isConfigured = statusMap.copernicus.configured;
        status = isConfigured ? 'NEAR_REAL_TIME' : 'MOCK';
      } else if (src.id === 'gfw') {
        isConfigured = statusMap.gfw.configured;
        status = isConfigured ? 'NEAR_REAL_TIME' : 'MOCK';
      } else if (src.id === 'mapbox') {
        isConfigured = statusMap.mapbox.configured;
        status = isConfigured ? 'LIVE' : 'MOCK';
      } else if (src.id === 'mosdac') {
        isConfigured = statusMap.mosdac.configured;
        status = isConfigured ? 'NEAR_REAL_TIME' : 'MOCK';
      } else if (src.id === 'imd') {
        isConfigured = statusMap.imd?.configured ?? false;
        status = isConfigured ? 'LIVE' : 'MOCK';
      } else if (src.id === 'firebase' || src.id === 'rag-engine') {
        isConfigured = true;
        status = 'LIVE';
      }

      return {
        ...src,
        isConfigured,
        status
      };
    });
    setSources(updatedSources);
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Database className="w-7 h-7 text-teal-400" />
            Data Sources
          </h1>
          <p className="text-sm text-slate-400 mt-1">Transparent overview of all data sources powering JalSaathi.</p>
        </div>
        <DemoModeBanner />
      </motion.div>

      {/* Info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-teal-500/15 bg-teal-500/5 p-4">
        <p className="text-sm text-slate-300">
          JalSaathi streams real-time marine data directly from ISRO MOSDAC (INSAT-3D SST, EOS-06 Scatterometer winds & OCM Chlorophyll) and Open-Meteo weather and wave observation APIs.
        </p>
      </motion.div>

      {/* Source cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {sources.map((source, i) => (
          <motion.div
            key={source.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-navy-600/20 bg-card p-6 hover:border-navy-600/40 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{source.name}</h3>
                <p className="text-sm text-slate-400">{source.description}</p>
              </div>
              <DataSourceBadge status={source.status} />
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Data Provided</p>
                <div className="flex flex-wrap gap-1.5">
                  {source.dataProvided.map((d) => (
                    <span key={d} className="text-xs px-2 py-0.5 rounded bg-navy-700/30 text-slate-400">{d}</span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Update Frequency</p>
                  <p className="text-white">{source.updateFrequency}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Data Type</p>
                  <p className="text-white">{source.dataType}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-navy-700/20">
              <div className="flex items-center gap-2 text-sm">
                {source.isConfigured ? (
                  <><CheckCircle className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400">Configured</span></>
                ) : (
                  <><XCircle className="w-4 h-4 text-slate-500" /><span className="text-slate-500">Not configured</span></>
                )}
              </div>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors"
              >
                Visit <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
