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
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
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
  jobType:
    | 'REQUEST_STRUCTURING'
    | 'CANDIDATE_GENERATION'
    | 'CATALOG_SYNC'
    | 'EVIDENCE_REPORT'
    | 'SUPPLY_IMPACT_ANALYSIS'
    | 'PREDICTION';
  status: JobStatus;
  retryable: boolean;
  failureReason: string | null;
  resultRefId: Id | null;
  createdAt: string;
  updatedAt: string;
}
export type ProductCategory =
  | 'EAU_DE_PARFUM'
  | 'EAU_DE_TOILETTE'
  | 'EAU_DE_COLOGNE'
  | 'SHAMPOO'
  | 'BODY_WASH'
  | 'CANDLE'
  | 'ROOM_SPRAY'
  | 'DIFFUSER';
export type TargetRegion = 'KR' | 'EU' | 'US';
export type Intensity = 'LIGHT' | 'MODERATE' | 'STRONG';
export type Longevity = 'LOW' | 'MEDIUM' | 'HIGH';
export type FragranceRequestStatus =
  | 'DRAFT'
  | 'MISSING_FIELDS'
  | 'CONFIRMED'
  | 'BLOCKED';
export interface FragranceRequestCreate {
  rawText: string;
  productCategory?: ProductCategory;
  targetRegion?: TargetRegion;
  riskTier?: 1 | 2;
  intensity?: Intensity;
  longevity?: Longevity;
  usageConcentrationPercent?: number;
  maxIngredientCount?: number;
  maxIngredientPricePerKg?: number;
  accords?: string[];
}
export type FragranceRequestUpdate = Partial<FragranceRequestCreate>;
export interface StructuredIntent {
  rawText: string;
  accords: string[];
  intensity: Intensity | null;
  longevity: Longevity | null;
  productCategory: ProductCategory | null;
  targetRegion: TargetRegion | null;
  riskTier: 1 | 2 | null;
  usageConcentrationPercent: number | null;
  maxIngredientCount: number | null;
  maxIngredientPricePerKg: number | null;
}
export interface FragranceRequestResponse {
  requestId: Id;
  status: FragranceRequestStatus;
  structuredIntent: StructuredIntent;
  missingFields: string[];
  createdAt: string;
  updatedAt: string;
}
export interface CandidateVersionIngredient {
  ingredientId: string;
  name: string;
  pyramid: string;
  concentratePercent: number;
  finishedProductPercent: number;
  pricePerKg: number;
  availability: number;
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
  generationRationale: string;
  generationMeta: GenerationMeta;
  temporal: {
    timepointsMinutes: number[];
    profile: Array<Record<string, unknown>>;
    ingredientProfile: Array<Record<string, unknown>>;
    concentrationBasis: Record<string, unknown> | null;
    claimBoundary: string;
  };
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
  status: CandidateStatus;
  goalMatchScore: number;
  cost: number;
  supplyStability: number;
  modelApplicabilityPercent: number;
}
export interface SafetyEvaluationResponse {
  candidateId: Id;
  versionId: Id;
  status: string;
  internalGatePassed: boolean;
  manufacturingReady: boolean;
  validationLevel: string;
  evidenceCoveragePercent: number;
  regulatoryDataComplete: boolean;
  internalEvidenceComplete: boolean;
  allergenQuantificationComplete: boolean;
  targetRegion: string;
  productCategory: string;
  auditId: string;
  standardsCheckedOn: string;
  standardsReviewDue: string;
  violations: unknown;
  warnings: unknown;
  missingDocuments: unknown;
  potentialEuAllergens: unknown;
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
  candidateId: Id;
  versionId: Id;
  status: string;
  similarityScore: number;
  similarityKind: string;
  confidence: number;
  modelApplicabilityPercent: number;
  scientificModelDomainPassed: boolean;
  scientificUncertaintyKind: string;
  olfactoryValidationStatus: string;
  perceptualPredictionStatus: string;
  humanValidation: {
    similarity90ClaimAuthorized: boolean;
    actualOlfactorySimilarityScore: number | null;
    actualOlfactoryLowerBound95: number | null;
    discriminationProbability: number | null;
    discriminationLowerBound95: number | null;
    discriminationUpperBound95: number | null;
  };
  limitations: unknown;
  simulation: PredictionSimulation;
  diagnostics: unknown;
}
export interface PredictionSimulation {
  status: string;
  confidence: number;
  p05: number;
  p95: number;
  draws: number;
}
export interface PredictionUncertaintyResponse {
  candidateId: Id;
  versionId: Id;
  modelApplicabilityPercent: number;
  scientificModelDomainPassed: boolean;
  scientificUncertaintyKind: string;
  simulation: PredictionSimulation;
  diagnostics: unknown;
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
export interface CatalogSyncResponse {
  jobId: Id;
  status: JobStatus;
  referenceCount: number;
  screenedCount: number;
  activeTierCount: number;
  syncedAt: string | null;
}
export interface SupplyChangeResponse {
  changeId: Id;
  ingredientId: Id;
  changeType: string;
  description: string;
  effectiveDate: string;
  status: string;
  jobId: Id | null;
}
export interface SupplyChangeImpact {
  candidateId: Id;
  impactScore: number;
  needsReview: boolean;
}
export interface SupplyReviewDecisionResponse {
  decisionId: Id;
  candidateId: Id;
  supplyChangeId: Id;
  decision: 'KEEP' | 'MODIFY' | 'DISCARD';
  comment?: string;
  decidedBy: Id;
  decidedAt: string;
}
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; reason: string }>;
  };
}
