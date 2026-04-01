"use client";

import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler);

interface TrackingRow {
  tracked_at: string;
  seo_score: number | null;
  organic_traffic: number | null;
  total_keywords: number | null;
  issues_count: number | null;
}

export function ProgressCharts({
  byDomain,
  domains,
}: {
  byDomain: Record<string, TrackingRow[]>;
  domains: string[];
}) {
  const [selected, setSelected] = useState(domains[0]);
  const data = byDomain[selected] || [];
  const labels = data.map((d) =>
    new Date(d.tracked_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  );

  const first = data[0];
  const last = data[data.length - 1];
  const scoreChange = first && last ? (last.seo_score ?? 0) - (first.seo_score ?? 0) : 0;
  const trafficFirst = first?.organic_traffic ?? 0;
  const trafficLast = last?.organic_traffic ?? 0;
  const trafficPct = trafficFirst > 0 ? Math.round(((trafficLast - trafficFirst) / trafficFirst) * 100) : 0;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#555", font: { size: 10 } }, border: { display: false } },
      y: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#555", font: { size: 10 } }, border: { display: false } },
    },
  };

  return (
    <div>
      {domains.length > 1 && (
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="mb-4 h-8 px-2 text-sm bg-surface border border-border rounded-lg"
        >
          {domains.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <SummaryCard label="Score change" value={scoreChange > 0 ? `+${scoreChange}` : `${scoreChange}`} sub={`${first?.seo_score ?? 0} → ${last?.seo_score ?? 0}`} positive={scoreChange > 0} />
        <SummaryCard label="Traffic growth" value={trafficPct > 0 ? `+${trafficPct}%` : `${trafficPct}%`} sub={`${trafficFirst.toLocaleString()} → ${trafficLast.toLocaleString()}`} positive={trafficPct > 0} />
        <SummaryCard label="Reports run" value={`${data.length}`} sub="for this domain" />
        <SummaryCard label="Keywords" value={`${(last?.total_keywords ?? 0).toLocaleString()}`} sub="current" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div className="bg-surface rounded-xl p-4 border border-border">
          <div className="text-xs text-text-secondary mb-2">SEO score over time</div>
          <div className="h-36">
            <Line
              data={{
                labels,
                datasets: [
                  {
                    data: data.map((d) => d.seo_score ?? 0),
                    borderColor: "#10B981",
                    backgroundColor: "rgba(16,185,129,0.08)",
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: "#10B981",
                    borderWidth: 2,
                  },
                ],
              }}
              options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, min: 0, max: 100 } } }}
            />
          </div>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-border">
          <div className="text-xs text-text-secondary mb-2">Traffic growth</div>
          <div className="h-36">
            <Line
              data={{
                labels,
                datasets: [
                  {
                    data: data.map((d) => d.organic_traffic ?? 0),
                    borderColor: "#2563EB",
                    backgroundColor: "rgba(37,99,235,0.08)",
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: "#2563EB",
                    borderWidth: 2,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-surface rounded-lg p-3 border border-border text-center">
      <div className="text-xs text-text-secondary">{label}</div>
      <div className={`text-xl font-medium ${positive === true ? "text-accent" : positive === false ? "text-danger" : ""}`}>
        {value}
      </div>
      <div className="text-[10px] text-text-tertiary">{sub}</div>
    </div>
  );
}
