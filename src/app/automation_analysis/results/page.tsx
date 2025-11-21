'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RadarChart from '@/components/RadarChart';

interface RadarDataItem {
  label: string;
  value: number;
  max: number;
  muted?: boolean;
}

export default function AutomationResultsPage() {
  const router = useRouter();
  const [radarData, setRadarData] = useState<RadarDataItem[]>([]);

  useEffect(() => {
    // Load radar data from localStorage
    const savedRadarData = localStorage.getItem('automation_analysis_radarData');
    if (!savedRadarData) {
      router.push('/automation_analysis');
      return;
    }

    const data = JSON.parse(savedRadarData);
    setRadarData(data);
  }, [router]);

  if (radarData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 pb-24 pt-12 lg:pt-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 lg:p-10 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Analyse abgeschlossen</h2>
          <p className="mt-2 text-sm text-gray-600">
            Hier siehst du deinen aktuellen Automatisierungs-Status über alle Bereiche hinweg.
          </p>
          <div className="mt-8 flex justify-center">
            <RadarChart data={radarData} />
          </div>
        </section>
      </div>
    </div>
  );
}

