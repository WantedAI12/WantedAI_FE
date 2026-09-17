export const endpoints = {
  hub: '/hub',
  auth: {
    signup: '/auth/signup',
    login: '/auth/login',
    guest: '/auth/guest',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    forgotPassword: '/auth/password/forgot',
    resetPassword: '/auth/password/reset',
  },
  me: '/members/me',
  mePassword: '/members/me/password',
  projects: '/projects',
  project: (projectId: number) => `/projects/${projectId}`,
  projectMembers: (projectId: number) => `/projects/${projectId}/members`,
  projectMember: (projectId: number, memberId: number) =>
    `/projects/${projectId}/members/${memberId}`,
  job: (jobId: number) => `/jobs/${jobId}`,
  jobStream: (jobId: number) => `/jobs/${jobId}/stream`,
  jobRetry: (jobId: number) => `/jobs/${jobId}/retry`,
  jobCancel: (jobId: number) => `/jobs/${jobId}/cancel`,
  projectRequests: (projectId: number) => `/projects/${projectId}/requests`,
  request: (requestId: number) => `/requests/${requestId}`,
  requestConfirm: (requestId: number) => `/requests/${requestId}/confirm`,
  requestChecklist: (requestId: number) => `/requests/${requestId}/checklist`,
  requestChecklistItem: (requestId: number, itemType: string) =>
    `/requests/${requestId}/checklist/${itemType}`,
  requestCandidates: (requestId: number) => `/requests/${requestId}/candidates`,
  compareCandidates: (requestId: number) =>
    `/requests/${requestId}/candidates/compare`,
  candidate: (candidateId: number) => `/candidates/${candidateId}`,
  candidateLotionDetail: (candidateId: number) => `/candidates/${candidateId}/lotion-detail`,
  candidateDuplicate: (candidateId: number) =>
    `/candidates/${candidateId}/duplicate`,
  candidateMemos: (candidateId: number) => `/candidates/${candidateId}/memos`,
  candidateMemo: (candidateId: number, memoType: string) => `/candidates/${candidateId}/memos/${memoType}`,
  candidateRevise: (candidateId: number) => `/candidates/${candidateId}/diagnostic-revise`,
  candidateVersions: (candidateId: number) =>
    `/candidates/${candidateId}/versions`,
  candidateVersion: (versionId: number) => `/candidates/versions/${versionId}`,
  safety: (candidateId: number) =>
    `/candidates/${candidateId}/safety-evaluation`,
  approvalGate: (candidateId: number) =>
    `/candidates/${candidateId}/approval-gate`,
  predictions: (candidateId: number) =>
    `/candidates/${candidateId}/predictions`,
  uncertainty: (candidateId: number) =>
    `/candidates/${candidateId}/predictions/uncertainty`,
  experimentStatus: (candidateId: number) =>
    `/candidates/${candidateId}/experiment-status`,
  evidence: (candidateId: number) => `/candidates/${candidateId}/evidence`,
  sensoryTests: (candidateId: number) =>
    `/candidates/${candidateId}/sensory-tests`,
  sensoryTest: (testId: number) => `/sensory-tests/${testId}`,
  sensoryResults: (testId: number) => `/sensory-tests/${testId}/results`,
  evidenceReports: (candidateId: number) =>
    `/candidates/${candidateId}/evidence-reports`,
  evidenceReport: (reportId: number) => `/evidence-reports/${reportId}`,
  ingredients: '/ingredients',
  ingredient: (ingredientId: string) =>
    `/ingredients/${encodeURIComponent(ingredientId)}`,
  catalogSync: '/ingredients/catalog-sync',
  catalogSyncJob: (jobId: number) => `/ingredients/catalog-sync/${jobId}`,
  supplyChanges: (ingredientId: string) =>
    `/ingredients/${encodeURIComponent(ingredientId)}/supply-changes`,
  supplyChange: (changeId: number) => `/supply-changes/${changeId}`,
  affectedCandidates: (changeId: number) =>
    `/supply-changes/${changeId}/affected-candidates`,
  supplyDecisions: (candidateId: number) =>
    `/candidates/${candidateId}/supply-review-decisions`,
} as const;
