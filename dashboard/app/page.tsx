import { getDashboardStats } from "@/lib/sheets";
import { DemoView } from "@/components/Dashboard";
import { LiveView } from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let stats;
  try {
    stats = await getDashboardStats();
  } catch {
    stats = null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          G-Net Construction Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Multi-type project pipeline — last updated{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {!stats ? (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <p className="text-gray-500">
              Connect your Google Sheet to see live data.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Set GNET_SHEET_ID and GOOGLE_SHEETS_API_KEY in environment
            </p>
          </div>
          <DemoView />
        </div>
      ) : (
        <LiveView stats={stats} />
      )}
    </div>
  );
}
