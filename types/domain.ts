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
  description: string | null;
  myRole: Role;
  memberCount: number;
  createdAt: string;
}
export interface ProjectCreate {
  name: string;
  description?: string | null;
}
export interface ProjectMemberResponse {
  memberId: Id;
  email: string;
  name: string;
  role: Role;
  joinedAt: string;
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
  cost: number | null;
  generationRationale: string | null;
  generationMeta: GenerationMeta;
  temporal: {
    timepointsMinutes: number[];
    profile: Array<Record<string, unknown>>;
    ingredientProfile: Array<Record<string, unknown>>;
    concentrationBasis: Record<string, unknown> | null;
    claimBoundary: string;
  } | null;
  createdBy: Id;
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
  status: string | null;
  internalGatePassed: boolean | null;
  manufacturingReady: boolean | null;
  validationLevel: string | null;
  evidenceCoveragePercent: number | null;
  regulatoryDataComplete: boolean | null;
  internalEvidenceComplete: boolean | null;
  allergenQuantificationComplete: boolean | null;
  targetRegion: string | null;
  productCategory: string | null;
  auditId: string | null;
  standardsCheckedOn: string | null;
  standardsReviewDue: string | null;
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
  status: string | null;
  similarityScore: number | null;
  similarityKind: string | null;
  confidence: number | null;
  modelApplicabilityPercent: number | null;
  scientificModelDomainPassed: boolean | null;
  scientificUncertaintyKind: string | null;
  olfactoryValidationStatus: string | null;
  perceptualPredictionStatus: string | null;
  humanValidation: {
    similarity90ClaimAuthorized: boolean | null;
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
  status: string | null;
  confidence: number | null;
  p05: number | null;
  p95: number | null;
  draws: number | null;
}
export interface PredictionUncertaintyResponse {
  candidateId: Id;
  versionId: Id;
  modelApplicabilityPercent: number | null;
  scientificModelDomainPassed: boolean | null;
  scientificUncertaintyKind: string | null;
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
  action: string;
  candidateVersionId: Id | null;
  actorId: Id;
  occurredAt: string;
  detail: string | null;
}
export interface SensoryTestResultResponse {
  resultId: Id;
  testId: Id;
  resultData: Record<string, unknown>;
  correlationWithPrediction: number | null;
  recordedBy: Id;
  recordedAt: string;
}
export interface SensoryTestResponse {
  testId: Id;
  candidateId: Id;
  planDetail: string;
  status: 'PLANNED' | 'COMPLETED';
  results: SensoryTestResultResponse[];
  createdAt: string;
}
export interface SensoryTestDetailResponse {
  test: SensoryTestResponse;
  predictedSimilarityScore: number | null;
}
export interface EvidenceReportResponse {
  reportId: Id;
  candidateId: Id;
  status: JobStatus;
  reportData: Record<string, unknown> | null;
  fileUrl: string | null;
}
export interface IngredientResponse {
  ingredientId: string;
  name: string;
  pyramid: string | null;
  pricePerKg: number | null;
  availability: number | null;
  usedInCandidateCount: number;
  lastSeenAt: string;
}
export interface IngredientDetailResponse {
  ingredient: IngredientResponse;
  usedByCandidateIds: Id[];
}
export interface CatalogSyncResponse {
  jobId: Id;
  status: JobStatus;
  referenceCount: number | null;
  screenedCount: number | null;
  activeTierCount: number | null;
  catalogVersion: string | null;
  registrySha256: string | null;
  snapshot: Record<string, unknown> | null;
  syncedAt: string | null;
}
export type SupplyChangeType =
  | 'PRICE_INCREASE'
  | 'PRICE_DECREASE'
  | 'DISCONTINUED'
  | 'LEAD_TIME_INCREASE'
  | 'SUPPLY_RESTORED'
  | 'OTHER';
export interface SupplyChangeResponse {
  changeId: Id;
  projectId: Id;
  ingredientId: string;
  changeType: SupplyChangeType;
  previousPricePerKg: number | null;
  newPricePerKg: number | null;
  note: string | null;
  analysisStatus: JobStatus;
  affectedCandidateCount: number;
  createdAt: string;
}
export interface SupplyChangeImpact {
  candidateId: Id;
  candidateVersionId: Id;
  ingredientConcentratePercent: number | null;
  reviewStatus: 'PENDING_REVIEW' | 'REVIEWED';
}
export interface SupplyReviewDecisionResponse {
  decisionId: Id;
  candidateId: Id;
  supplyChangeId: Id | null;
  decision: 'KEEP_FORMULA' | 'REVISE_FORMULA' | 'DISCARD_CANDIDATE';
  rationale: string;
  decidedBy: Id;
  createdAt: string;
}
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; reason: string }>;
  };
}
