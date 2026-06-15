// Helper functions for API operations
import { apiRequest } from './api';

export async function createReconciliation(data: any) {
  return apiRequest('/reconciliations/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function createReportSchedule(data: any) {
  return apiRequest('/report-schedules/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function createAuditLog(data: any) {
  return apiRequest('/audit-logs/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function createDocument(data: any) {
  return apiRequest('/documents/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function createStaffRequirement(data: any) {
  return apiRequest('/staff-requirements/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function createProcessDocument(data: any) {
  return apiRequest('/process-documents/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function approveProcessDocument(id: number) {
  return apiRequest(`/process-documents/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'approved' })
  });
}

export async function createTestCase(data: any) {
  return apiRequest('/test-cases/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function approveTestCase(id: number) {
  return apiRequest(`/test-cases/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'approved' })
  });
}

export async function createReleaseNote(data: any) {
  return apiRequest('/release-notes/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function createUATFeedback(data: any) {
  return apiRequest('/uat-feedback/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function createBugReport(data: any) {
  return apiRequest('/bug-reports/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function createExpenseApproval(data: any) {
  return apiRequest('/expense-approvals/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function approveRequisition(id: number) {
  return apiRequest(`/requisitions/${id}/approve/`, {
    method: 'POST'
  });
}

export async function approveExpenseApproval(id: number, notes: string) {
  return apiRequest(`/expense-approvals/${id}/approve/`, {
    method: 'POST',
    body: JSON.stringify({ notes })
  });
}

export async function approveReallocationRequest(id: number) {
  return apiRequest(`/reallocation-requests/${id}/approve/`, {
    method: 'POST'
  });
}

export async function rejectReallocationRequest(id: number) {
  return apiRequest(`/reallocation-requests/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'rejected' })
  });
}

export async function closeBugReport(id: number) {
  return apiRequest(`/bug-reports/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'closed' })
  });
}

export async function closeUATFeedback(id: number) {
  return apiRequest(`/uat-feedback/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'closed' })
  });
}

export async function archiveReleaseNote(id: number) {
  return apiRequest(`/release-notes/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'archived' })
  });
}

export async function rejectExpenseApproval(id: number, reason: string) {
  return apiRequest(`/expense-approvals/${id}/reject/`, {
    method: 'POST',
    body: JSON.stringify({ notes: reason })
  });
}

export async function rejectProcessDocument(id: number) {
  return apiRequest(`/process-documents/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'rejected' })
  });
}

export async function rejectStaffRequirement(id: number) {
  return apiRequest(`/staff-requirements/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ validation_status: 'rejected' })
  });
}

export async function deactivateReportSchedule(id: number) {
  return apiRequest(`/report-schedules/${id}/deactivate/`, {
    method: 'POST'
  });
}

export async function markReconciliationException(id: number, data: any) {
  return apiRequest(`/reconciliations/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'exception', ...data })
  });
}

export async function updateSetting(key: string, value: any) {
  return apiRequest(`/system-settings/${key}/`, {
    method: 'PATCH',
    body: JSON.stringify({ value })
  });
}

