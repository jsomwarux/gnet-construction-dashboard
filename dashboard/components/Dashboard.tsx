"use client";

const JOB_TYPE_LABELS: Record<string, string> = {
  hospital: "Hospital",
  school: "School",
  tenant_improvement: "Tenant Improvement",
  flood_restoration: "Flood Restoration",
  maintenance: "Maintenance",
  commercial: "Commercial",
};

const STATUS_COLORS: Record<string, string> = {
  BLOCKED: "bg-red-100 border-red-400 text-red-900",
  AT_RISK: "bg-orange-100 border-orange-400 text-orange-900",
  ON_TRACK: "bg-green-100 border-green-400 text-green-900",
};

const JOB_TYPE_COLORS: Record<string, string> = {
  hospital: "bg-blue-50 border-blue-300",
  school: "bg-purple-50 border-purple-300",
  tenant_improvement: "bg-teal-50 border-teal-300",
  flood_restoration: "bg-yellow-50 border-yellow-400",
  maintenance: "bg-gray-50 border-gray-300",
  commercial: "bg-orange-50 border-orange-300",
};

export function LiveView({
  stats,
  demo,
}: {
  stats: ReturnType<typeof normalizeStats>;
  demo?: boolean;
}) {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {demo && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm">
          ⚠️ Demo mode — showing sample data. Connect Google Sheets for live data.
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Active Jobs" value={stats.totalActive} icon="🏗️" />
        <StatCard
          label="Blocked"
          value={stats.blocked}
          icon="🔴"
          alert={stats.blocked > 0}
        />
        <StatCard
          label="At Risk"
          value={stats.atRisk}
          icon="🟠"
          alert={stats.atRisk > 0}
        />
        <StatCard
          label="Stalled"
          value={stats.stalled}
          icon="⚠️"
          alert={stats.stalled > 0}
        />
        <StatCard
          label="Permit Alerts"
          value={stats.permitAlerts}
          icon="📋"
          alert={stats.permitAlerts > 0}
        />
      </div>

      {/* Job Type Breakdown */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Pipeline by Job Type
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(
            stats.pipelineSummary || stats.byType || {}
          ).map(([type, count]) => (
            <div
              key={type}
              className={`rounded-lg p-3 border ${
                JOB_TYPE_COLORS[type] || "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="text-2xl font-bold text-gray-900">
                {count as number}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                {JOB_TYPE_LABELS[type] || type}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts Panel */}
      {stats.blocked > 0 ||
      stats.stalled > 0 ||
      stats.permitAlerts > 0 ? (
        <div className="bg-white rounded-xl p-5 border border-red-200">
          <h2 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
            🚨 Action Required
          </h2>
          <div className="space-y-2">
            {stats.recentUpdates
              .filter(
                (j: any) =>
                  j.status === "BLOCKED" ||
                  j.stalled === "yes" ||
                  j.permitAlert === "yes"
              )
              .map((job: any) => (
                <div
                  key={job.jobId}
                  className={`rounded-lg p-3 border ${
                    STATUS_COLORS[job.status] ||
                    "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-sm">
                        {job.jobSite}
                      </span>
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-white border">
                        {job.jobType.replace("_", " ")}
                      </span>
                    </div>
                    <span className="text-lg">{job.statusEmoji}</span>
                  </div>
                  <div className="mt-1 text-sm">
                    {job.stalled === "yes" && (
                      <span className="text-orange-700">
                        ⚠️ Stalled — no progress since last update.{" "}
                      </span>
                    )}
                    {job.status === "BLOCKED" && (
                      <span className="text-red-700">
                        Blocked: {job.blockers || "See foreman notes"}.{" "}
                      </span>
                    )}
                    {job.permitAlert === "yes" && (
                      <span className="text-blue-700">
                        📋 Permit action needed.{" "}
                      </span>
                    )}
                    <span className="text-gray-600">
                      Next: {job.nextMilestone}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : null}

      {/* Full Pipeline Board */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Active Pipeline
        </h2>
        <div className="space-y-3">
          {stats.recentUpdates
            .filter((j: any) => j.status !== "COMPLETED")
            .map((job: any) => (
              <div
                key={job.jobId}
                className={`rounded-lg p-4 border ${
                  STATUS_COLORS[job.status] ||
                  "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">
                        {job.jobSite}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-600">
                        {JOB_TYPE_LABELS[job.jobType] || job.jobType}
                      </span>
                      <span className="text-xs text-gray-400">
                        {job.foreman}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {job.clientSummary ||
                        job.foremanSummary ||
                        job.nextMilestone}
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 max-w-48">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min(job.percentComplete, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {job.percentComplete}%
                      </span>
                      <span className="text-sm text-gray-500">
                        Next: {job.nextMilestone}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-2xl">{job.statusEmoji}</span>
                    <div className="text-xs text-gray-400 mt-1">
                      {job.jobId}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 pt-4">
        G-Net Construction Dashboard · Built with n8n + Next.js + Claude
      </div>
    </div>
  );
}

export function DemoView() {
  const mockJobs = [
    {
      jobId: "JOB-2026-001",
      jobSite: "Mount Sinai West — 5th Floor TI",
      jobType: "hospital",
      foreman: "Carlos Ruiz",
      percentComplete: 62,
      status: "ON_TRACK",
      statusEmoji: "🟢",
      nextMilestone: "MEP rough inspection (4/14)",
      stalled: "no",
    },
    {
      jobId: "JOB-2026-002",
      jobSite: "P.S. 41 — Gymnasium Renovation",
      jobType: "school",
      foreman: "Dave Kowalski",
      percentComplete: 41,
      status: "AT_RISK",
      statusEmoji: "🟠",
      nextMilestone: "CO #3 approval needed",
      stalled: "yes",
    },
    {
      jobId: "JOB-2026-003",
      jobSite: "250 Park Ave — 12th Floor Law Office TI",
      jobType: "tenant_improvement",
      foreman: "Tony Messina",
      percentComplete: 88,
      status: "ON_TRACK",
      statusEmoji: "🟢",
      nextMilestone: "DOB final inspection (4/10)",
      stalled: "no",
    },
    {
      jobId: "JOB-2026-004",
      jobSite: "45 Riverside Blvd — Unit 34C Water Damage",
      jobType: "flood_restoration",
      foreman: "Mike Torres",
      percentComplete: 30,
      status: "BLOCKED",
      statusEmoji: "🔴",
      nextMilestone: "Adjuster re-inspection needed",
      stalled: "no",
      blockers: "Travelers adjuster not returning — 3x called",
    },
    {
      jobId: "JOB-2026-005",
      jobSite: "The Enclave — Quarterly HVAC PM (12 bldgs)",
      jobType: "maintenance",
      foreman: "Joe Martinez",
      percentComplete: 25,
      status: "ON_TRACK",
      statusEmoji: "🟢",
      nextMilestone: "Complete all 12 buildings — due 4/30",
      stalled: "no",
    },
    {
      jobId: "JOB-2026-008",
      jobSite: "M.S. 131 — Bathroom Modernization",
      jobType: "school",
      foreman: "Dave Kowalski",
      percentComplete: 72,
      status: "ON_TRACK",
      statusEmoji: "🟢",
      nextMilestone: "Painting + final punch",
      stalled: "no",
    },
  ];

  return (
    <LiveView
      stats={normalizeStats({
        totalActive: 6,
        blocked: 1,
        atRisk: 1,
        stalled: 1,
        permitAlerts: 0,
        byType: {
          hospital: 1,
          school: 2,
          tenant_improvement: 1,
          flood_restoration: 1,
          maintenance: 1,
          commercial: 0,
        },
        recentUpdates: mockJobs as any,
        complianceFlags: [],
        pipelineSummary: {
          hospital: 2,
          school: 2,
          tenant_improvement: 1,
          flood_restoration: 2,
          maintenance: 1,
          commercial: 1,
        },
      })}
      demo={true}
    />
  );
}

function StatCard({
  label,
  value,
  icon,
  alert,
}: {
  label: string;
  value: number;
  icon: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-xl p-4 border ${
        alert ? "border-red-300 bg-red-50" : "border-gray-200"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-gray-500 font-medium">{label}</span>
      </div>
      <div
        className={`text-3xl font-bold ${
          alert ? "text-red-700" : "text-gray-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

// Utility to normalize stats shape for client component
function normalizeStats(stats: any) {
  return stats;
}
