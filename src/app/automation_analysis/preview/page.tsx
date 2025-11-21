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

export default function AutomationPreviewPage() {
  const router = useRouter();
  const [radarData, setRadarData] = useState<RadarDataItem[]>([]);

  useEffect(() => {
    // Load radar data from localStorage
    const savedRadarData = localStorage.getItem('automation_analysis_radarPreview');
    if (!savedRadarData) {
      router.push('/automation_analysis');
      return;
    }

    const data = JSON.parse(savedRadarData);
    setRadarData(data);
  }, [router]);

  const handleContinue = () => {
    // Get the saved active section and restore it
    const savedSection = localStorage.getItem('automation_analysis_activeSection');
    if (savedSection) {
      router.push(`/automation_analysis?section=${savedSection}`);
    } else {
      router.push('/automation_analysis');
    }
  };

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
        <div className="rounded-3xl border border-gray-200 bg-white p-6 lg:p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Zwischenstand nach Sektion 4</h2>
          <p className="mt-2 text-sm text-gray-600">
            Die ersten vier Bereiche sind nun bewertet. Die übrigen Segmente bleiben ausgegraut, bis du sie ebenfalls ausfüllst.
          </p>
          <div className="mt-8 flex justify-center">
            <RadarChart data={radarData} />
          </div>
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleContinue}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Weiter zu Sektion 5
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
