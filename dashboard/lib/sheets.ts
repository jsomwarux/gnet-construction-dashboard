// Google Sheets API client for construction dashboard
// Reads from Job Log, Compliance Log, and Pipeline sheets

export interface JobRecord {
  date: string;
  jobId: string;
  jobSite: string;
  jobType: string;
  foreman: string;
  percentComplete: number;
  status: 'ON_TRACK' | 'AT_RISK' | 'BLOCKED';
  statusEmoji: string;
  foremanSummary: string;
  clientSummary: string;
  blockers: string;
  complianceFlags: string[];
  permitAlert: string;
  stalled: string;
  nextMilestone: string;
  clientNotified: string;
  ownerAlert: string;
  photoUrl: string;
}

export interface PipelineJob {
  jobId: string;
  jobSite: string;
  jobType: string;
  client: string;
  foreman: string;
  contractValue: string;
  startDate: string;
  targetEndDate: string;
  permitStatus: string;
  permitsRequired: string[];
  complianceTags: string[];
  reportingCadence: string;
  clientEmail: string;
  vincentAlert: string;
  currentStatus: string;
  percentComplete: number;
}

export interface ComplianceRecord {
  date: string;
  jobId: string;
  jobSite: string;
  jobType: string;
  complianceFlag: string;
  status: string;
  reported: string;
}

const SHEET_ID = process.env.GNET_SHEET_ID || '';
const PIPELINE_SHEET_ID = process.env.GNET_PIPELINE_SHEET_ID || '';

async function sheetsRead(range: string, spreadsheetId: string = SHEET_ID): Promise<string[][]> {
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  if (!apiKey || !spreadsheetId) return [];
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.values || [];
}

function parseJobRecord(row: string[]): JobRecord | null {
  if (row.length < 15) return null;
  return {
    date: row[0] || '',
    jobId: row[1] || '',
    jobSite: row[2] || '',
    jobType: row[3] || '',
    foreman: row[4] || '',
    percentComplete: parseInt(row[5] || '0'),
    status: (row[6] || 'ON_TRACK') as JobRecord['status'],
    statusEmoji: row[7] || '🟢',
    foremanSummary: row[8] || '',
    clientSummary: row[9] || '',
    blockers: row[10] || '',
    complianceFlags: row[11] ? row[11].split(', ') : [],
    permitAlert: row[12] || 'no',
    stalled: row[13] || 'no',
    nextMilestone: row[14] || '',
    clientNotified: row[15] || '',
    ownerAlert: row[16] || '',
    photoUrl: row[17] || '',
  };
}

function parsePipelineJob(row: string[]): PipelineJob | null {
  if (row.length < 13) return null;
  return {
    jobId: row[0] || '',
    jobSite: row[1] || '',
    jobType: row[2] || '',
    client: row[3] || '',
    foreman: row[4] || '',
    contractValue: row[5] || '',
    startDate: row[6] || '',
    targetEndDate: row[7] || '',
    permitStatus: row[8] || '',
    permitsRequired: row[9] ? row[9].split(', ') : [],
    complianceTags: row[10] ? row[10].split(', ') : [],
    reportingCadence: row[11] || 'weekly',
    clientEmail: row[12] || '',
    vincentAlert: row[13] || '',
    currentStatus: row[14] || 'on_track',
    percentComplete: parseInt(row[15] || '0'),
  };
}

export async function getLatestJobStatuses(): Promise<JobRecord[]> {
  // Get latest update per job from Job Log sheet
  const rows = await sheetsRead('Job Log!A:R');
  if (rows.length < 2) return [];
  
  const records: JobRecord[] = [];
  const latestByJob: Map<string, JobRecord> = new Map();
  
  for (let i = 1; i < rows.length; i++) {
    const rec = parseJobRecord(rows[i]);
    if (!rec || !rec.jobId) continue;
    
    const existing = latestByJob.get(rec.jobId);
    if (!existing || rec.date > existing.date) {
      latestByJob.set(rec.jobId, rec);
    }
  }
  
  return Array.from(latestByJob.values())
    .sort((a, b) => {
      const statusOrder = { BLOCKED: 0, AT_RISK: 1, ON_TRACK: 2 };
      return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
    });
}

export async function getPipelineJobs(): Promise<PipelineJob[]> {
  const rows = await sheetsRead('Pipeline!A:P', PIPELINE_SHEET_ID || SHEET_ID);
  if (rows.length < 2) return [];
  
  const jobs: PipelineJob[] = [];
  for (let i = 1; i < rows.length; i++) {
    const job = parsePipelineJob(rows[i]);
    if (job && job.jobId) jobs.push(job);
  }
  return jobs;
}

export async function getComplianceFlags(): Promise<ComplianceRecord[]> {
  const rows = await sheetsRead('Compliance Log!A:G');
  if (rows.length < 2) return [];
  
  const records: ComplianceRecord[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 5) continue;
    records.push({
      date: row[0] || '',
      jobId: row[1] || '',
      jobSite: row[2] || '',
      jobType: row[3] || '',
      complianceFlag: row[4] || '',
      status: row[5] || '',
      reported: row[6] || '',
    });
  }
  return records;
}

export async function getDashboardStats() {
  const jobs = await getLatestJobStatuses();
  const pipeline = await getPipelineJobs();
  const compliance = await getComplianceFlags();
  
  const activeJobs = jobs.filter(j => j.status !== 'COMPLETED');
  const blocked = jobs.filter(j => j.status === 'BLOCKED');
  const atRisk = jobs.filter(j => j.status === 'AT_RISK');
  const stalled = jobs.filter(j => j.stalled === 'yes');
  const permitAlerts = jobs.filter(j => j.permitAlert === 'yes');
  
  const byType: Record<string, number> = {};
  for (const job of activeJobs) {
    byType[job.jobType] = (byType[job.jobType] || 0) + 1;
  }
  
  return {
    totalActive: activeJobs.length,
    blocked: blocked.length,
    atRisk: atRisk.length,
    stalled: stalled.length,
    permitAlerts: permitAlerts.length,
    byType,
    recentUpdates: jobs.slice(0, 10),
    complianceFlags: compliance.slice(-20).reverse(),
    pipelineSummary: {
      hospital: pipeline.filter(j => j.jobType === 'hospital').length,
      school: pipeline.filter(j => j.jobType === 'school').length,
      tenant_improvement: pipeline.filter(j => j.jobType === 'tenant_improvement').length,
      flood_restoration: pipeline.filter(j => j.jobType === 'flood_restoration').length,
      maintenance: pipeline.filter(j => j.jobType === 'maintenance').length,
      commercial: pipeline.filter(j => j.jobType === 'commercial').length,
    }
  };
}
