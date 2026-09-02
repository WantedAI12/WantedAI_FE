export type Id = number;
export type Role =
  | 'ORG_ADMIN'
  | 'PROJECT_MANAGER'
  | 'PERFUMER'
  | 'FRAGRANCE_RND'
  | 'PRODUCT_BRAND'
  | 'SENSORY_SCIENTIST'
  | 'SAFETY_REVIEWER'
  | 'SUPPLIER'
  | 'AUDITOR';
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface SignupRequest extends LoginRequest {
  name: string;
}
export interface MemberProject {
  projectId: Id;
  role: Role;
}
export interface MemberResponse {
  memberId: Id;
  email: string;
  name: string;
  projects: MemberProject[];
}
export interface ProjectResponse {
  projectId: Id;
  name: string;
  description?: string;
  createdAt: string;
}
export interface ProjectCreate {
  name: string;
  description?: string;
}
export interface ProjectMemberResponse {
  memberId: Id;
  email: string;
  name: string;
  role: Role;
}
export type JobStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED';
export interface JobResponse {
  jobId: Id;
  jobType: string;
  status: JobStatus;
  retryable: boolean;
  failureReason: string | null;
  resultRefId: Id | null;
}
export type FragranceRequestStatus = 'MISSING_FIELDS' | 'CONFIRMED' | 'BLOCKED';
export interface FragranceRequestCreate {
  rawText: string;
  productType?: string;
  usageConcentration?: string | null;
  market?: string;
  productCategory?: string;
  riskTier?: 1 | 2;
  maxIngredientCount?: number;
}
export interface FragranceRequestResponse {
  requestId: Id;
  status: FragranceRequestStatus;
  structuredIntent: Record<string, unknown>;
  missingFields: string[];
  confidence: number;
  isOutOfDistribution: boolean;
  schemaVersion: string;
  jobId: Id | null;
}
export interface CandidateVersionIngredient {
  ingredientId: Id;
  ingredientName?: string;
  ratio: number;
}
export interface GenerationMeta {
  provider: string;
  gpuUsed: boolean;
  aiResponseStatus: string;
  latencyMs: number;
}
export interface CandidateVersionResponse {
  versionId: Id;
  candidateId: Id;
  parentVersionId: Id | null;
  ingredients: CandidateVersionIngredient[];
  cost: number;
  supplyConditions: Record<string, unknown>;
  generationRationale: string;
  generationMeta: GenerationMeta;
  createdAt: string;
}
export type CandidateStatus =
  | 'UNDER_REVIEW'
  | 'CONFIRMED_FOR_EXPERIMENT'
  | 'IN_SENSORY_TEST'
  | 'APPROVED'
  | 'REJECTED';
export interface CandidateResponse {
  candidateId: Id;
  requestId: Id;
  status: CandidateStatus;
  currentVersion: CandidateVersionResponse;
}
export interface CandidateCompareRow {
  candidateId: Id;
  goalMatchScore: number;
  cost: number;
  supplyStability: string;
  predictionSummary: Record<string, unknown>;
}
export interface SafetyEvaluationResponse {
  candidateId: Id;
  passed: boolean;
  resultDetail: Record<string, unknown>;
  evaluatedAt: string;
}
export interface ApprovalGateResponse {
  gateId: Id;
  candidateId: Id;
  decision: 'APPROVED' | 'REJECTED';
  comment?: string;
  reviewedBy: Id;
  reviewedAt: string;
}
export interface PredictionResponse {
  predictionId: Id;
  proxyScores: Record<string, unknown>;
  uncertainty: number;
  isOutOfDistribution: boolean;
  abstained: boolean;
  abstainReason: string | null;
}
export interface ExperimentStatusLog {
  candidateId: Id;
  status: CandidateStatus;
  changedBy: Id;
  changedAt: string;
}
export interface EvidenceLog {
  candidateId: Id;
  candidateVersionId: Id | null;
  action: string;
  actorId: Id;
  createdAt: string;
}
export interface SensoryTestResultResponse {
  resultId: Id;
  testId: Id;
  resultData: Record<string, unknown>;
  correlationWithPrediction: number | null;
  recordedAt: string;
}
export interface SensoryTestResponse {
  testId: Id;
  candidateId: Id;
  planDetail: string;
  status: 'PLANNED' | 'COMPLETED';
  results: SensoryTestResultResponse[];
}
export interface EvidenceReportResponse {
  reportId: Id;
  candidateId: Id;
  status: string;
  fileUrl: string | null;
}
export interface IngredientResponse {
  ingredientId: Id;
  name: string;
  casNumber: string;
  safetyData: Record<string, unknown>;
  regulatoryData: Record<string, unknown>;
  costPerUnit: number;
  supplyStatus: string;
}
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; reason: string }>;
  };
}
