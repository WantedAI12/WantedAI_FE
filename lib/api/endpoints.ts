export const endpoints = {
  auth: {
    signup: '/auth/signup',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  me: '/members/me',
  projects: '/projects',
  project: (projectId: number) => `/projects/${projectId}`,
  projectMembers: (projectId: number) => `/projects/${projectId}/members`,
  projectMember: (projectId: number, memberId: number) =>
    `/projects/${projectId}/members/${memberId}`,
  job: (jobId: number) => `/jobs/${jobId}`,
  jobRetry: (jobId: number) => `/jobs/${jobId}/retry`,
  jobCancel: (jobId: number) => `/jobs/${jobId}/cancel`,
  projectRequests: (projectId: number) => `/projects/${projectId}/requests`,
  request: (requestId: number) => `/requests/${requestId}`,
  requestConfirm: (requestId: number) => `/requests/${requestId}/confirm`,
  requestCandidates: (requestId: number) => `/requests/${requestId}/candidates`,
  compareCandidates: (requestId: number) =>
    `/requests/${requestId}/candidates/compare`,
  candidate: (candidateId: number) => `/candidates/${candidateId}`,
  candidateDuplicate: (candidateId: number) =>
    `/candidates/${candidateId}/duplicate`,
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
  ingredient: (ingredientId: number) => `/ingredients/${ingredientId}`,
  catalogSync: '/ingredients/catalog-sync',
} as const;
