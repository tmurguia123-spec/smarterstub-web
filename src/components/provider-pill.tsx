import { BadgeCheck, Shield } from "lucide-react";
import { providers } from "@/lib/mock-data";

export function ProviderPills() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {providers.map((provider) => (
        <div
          key={provider.id}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className={`h-2 rounded-full bg-gradient-to-r ${provider.accent}`} />
          <div className="mt-4 flex items-center justify-between">
            <div className="text-lg font-semibold text-slate-950">{provider.name}</div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Trust {provider.trustScore}
            </div>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{provider.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified marketplace
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              <Shield className="h-3.5 w-3.5" />
              Avg fees {provider.averageFeesPct}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
