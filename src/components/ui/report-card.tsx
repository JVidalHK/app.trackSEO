import Link from "next/link";
import { ScoreRing } from "./score-ring";

interface ReportCardProps {
  id: string;
  domain: string;
  date: string;
  score: number;
  traffic: number;
  keywords: number;
  da: number;
  improvement?: string;
  isLatest?: boolean;
  isSample?: boolean;
}

export function ReportCard({
  id,
  domain,
  date,
  score,
  traffic,
  keywords,
  da,
  improvement,
  isLatest,
  isSample,
}: ReportCardProps) {
  return (
    <Link href={`/dashboard/reports/${id}`}>
      <div className="bg-surface rounded-xl p-4 border border-transparent hover:border-border-light transition-colors cursor-pointer relative">
        <div className="absolute top-4 right-4">
          <ScoreRing score={score} size={40} strokeWidth={3} />
        </div>
        <div className="font-medium text-sm">{domain}</div>
        <div className="text-xs text-text-secondary mt-0.5 flex items-center gap-1.5 flex-wrap">
          {date}{isLatest && " · Latest"}
          {isSample && <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning font-medium">Sample</span>}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div>
            <div className="text-xs font-medium">{traffic.toLocaleString()}</div>
            <div className="text-[10px] text-text-secondary">Traffic</div>
          </div>
          <div>
            <div className="text-xs font-medium">{keywords.toLocaleString()}</div>
            <div className="text-[10px] text-text-secondary">Keywords</div>
          </div>
          <div>
            <div className="text-xs font-medium">{da}</div>
            <div className="text-[10px] text-text-secondary">DA</div>
          </div>
        </div>
        {improvement && (
          <div className="mt-2 pt-2 border-t border-border flex items-center gap-1.5 text-xs">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M2 11l4-4 3 3 5-6" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-success">{improvement}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
