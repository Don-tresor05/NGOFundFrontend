import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, FileCheck, TrendingUp } from 'lucide-react';
import { apiRequest } from '../lib/api';

interface ScoreData {
  overallScore: number;
  complianceRate: number;
  reportingTimeliness: number;
  documentCompleteness: number;
  financialTransparency: number;
  recentImprovement: number;
}

export default function TransparencyScorecard() {
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [compliance, reports, documents, projects] = await Promise.all([
        apiRequest('/compliance-items/'),
        apiRequest('/report-schedules/'),
        apiRequest('/documents/'),
        apiRequest('/projects/')
      ]);

      const complianceData = Array.isArray(compliance) ? compliance : compliance.results || [];
      const reportsData = Array.isArray(reports) ? reports : reports.results || [];
      const docsData = Array.isArray(documents) ? documents : documents.results || [];
      const projectsData = Array.isArray(projects) ? projects : projects.results || [];

      // Calculate compliance rate
      const totalCompliance = complianceData.length;
      const completedCompliance = complianceData.filter((c: any) => c.status === 'COMPLETED').length;
      const complianceRate = totalCompliance > 0 ? (completedCompliance / totalCompliance) * 100 : 0;

      // Calculate reporting timeliness
      const onTimeReports = reportsData.filter((r: any) => {
        const dueDate = new Date(r.due_date);
        const submittedDate = r.submitted_at ? new Date(r.submitted_at) : new Date();
        return submittedDate <= dueDate;
      }).length;
      const reportingTimeliness = reportsData.length > 0 ? (onTimeReports / reportsData.length) * 100 : 0;

      // Calculate document completeness
      const requiredDocsPerProject = 3; // Assume 3 required docs per project
      const expectedDocs = projectsData.length * requiredDocsPerProject;
      const documentCompleteness = expectedDocs > 0 ? Math.min((docsData.length / expectedDocs) * 100, 100) : 0;

      // Calculate financial transparency (based on budget disclosure)
      const projectsWithBudget = projectsData.filter((p: any) => p.total_budget && parseFloat(p.total_budget) > 0).length;
      const financialTransparency = projectsData.length > 0 ? (projectsWithBudget / projectsData.length) * 100 : 0;

      // Overall score (weighted average)
      const overallScore = (
        complianceRate * 0.3 +
        reportingTimeliness * 0.3 +
        documentCompleteness * 0.2 +
        financialTransparency * 0.2
      );

      setData({
        overallScore: Math.round(overallScore),
        complianceRate: Math.round(complianceRate),
        reportingTimeliness: Math.round(reportingTimeliness),
        documentCompleteness: Math.round(documentCompleteness),
        financialTransparency: Math.round(financialTransparency),
        recentImprovement: Math.random() * 10 - 5 // Mock improvement data
      });
    } catch (error) {
      console.error('Error fetching scorecard data:', error);
      // Set default data on error
      setData({
        overallScore: 0,
        complianceRate: 0,
        reportingTimeliness: 0,
        documentCompleteness: 0,
        financialTransparency: 0,
        recentImprovement: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const ScoreCircle = ({ score, label }: { score: number; label: string }) => (
    <div className="text-center">
      <div className={`relative inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(score)}`}>
        <div className="text-3xl font-bold ${getScoreColor(score)}">{score}</div>
        <svg className="absolute inset-0 w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
            className={getScoreColor(score)}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="mt-2 text-sm font-medium text-gray-700">{label}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6">Transparency Scorecard</h2>

      {/* Overall Score */}
      <div className="text-center mb-8 pb-8 border-b">
        <div className="inline-block relative">
          <div className={`w-32 h-32 rounded-full ${getScoreBgColor(data.overallScore)} flex items-center justify-center mb-3`}>
            <div className={`text-5xl font-bold ${getScoreColor(data.overallScore)}`}>{data.overallScore}</div>
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            {data.recentImprovement > 0 ? (
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium bg-white px-2 py-1 rounded-full shadow">
                <TrendingUp size={14} /> +{data.recentImprovement.toFixed(1)}%
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 text-sm font-medium bg-white px-2 py-1 rounded-full shadow">
                {data.recentImprovement.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mt-4">Overall Transparency</h3>
        <p className="text-gray-600 mt-1">System-wide transparency and compliance metrics</p>
      </div>

      {/* Individual Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <ScoreCircle score={data.complianceRate} label="Compliance" />
        <ScoreCircle score={data.reportingTimeliness} label="Timeliness" />
        <ScoreCircle score={data.documentCompleteness} label="Documents" />
        <ScoreCircle score={data.financialTransparency} label="Financial" />
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {data.complianceRate >= 80 ? <CheckCircle className="text-green-500" size={20} /> : <XCircle className="text-red-500" size={20} />}
            <span className="font-medium">Compliance Rate</span>
          </div>
          <span className={`font-bold ${getScoreColor(data.complianceRate)}`}>{data.complianceRate}%</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {data.reportingTimeliness >= 80 ? <CheckCircle className="text-green-500" size={20} /> : <Clock className="text-yellow-500" size={20} />}
            <span className="font-medium">Reporting Timeliness</span>
          </div>
          <span className={`font-bold ${getScoreColor(data.reportingTimeliness)}`}>{data.reportingTimeliness}%</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {data.documentCompleteness >= 80 ? <CheckCircle className="text-green-500" size={20} /> : <FileCheck className="text-yellow-500" size={20} />}
            <span className="font-medium">Document Completeness</span>
          </div>
          <span className={`font-bold ${getScoreColor(data.documentCompleteness)}`}>{data.documentCompleteness}%</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {data.financialTransparency >= 80 ? <CheckCircle className="text-green-500" size={20} /> : <FileCheck className="text-yellow-500" size={20} />}
            <span className="font-medium">Financial Transparency</span>
          </div>
          <span className={`font-bold ${getScoreColor(data.financialTransparency)}`}>{data.financialTransparency}%</span>
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-500 text-right">
        Updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}
