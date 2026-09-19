const labels: Record<string, string> = {
  EAU_DE_PARFUM: '오 드 퍼퓸', EAU_DE_TOILETTE: '오 드 뚜왈렛', EAU_DE_COLOGNE: '오 드 코롱', BODY_LOTION: '바디로션',
  UNDER_REVIEW: '검토 중', CONFIRMED_FOR_EXPERIMENT: '시험 확정',
  IN_SENSORY_TEST: '관능 시험 중', APPROVED: '승인', REJECTED: '반려',
  SUCCEEDED: '완료', FAILED: '실패', PENDING: '대기 중', RUNNING: '진행 중',
  research_candidate_only: '연구용 후보이며 실제 성능·출시 적합성을 보장하지 않습니다.',
  PERFUMER: '조향사', ORG_ADMIN: '조직 관리자', PROJECT_MANAGER: '프로젝트 관리자',
  FRAGRANCE_RND: '향 연구원', PRODUCT_BRAND: '제품 담당자',
  SENSORY_SCIENTIST: '관능 평가자', SAFETY_REVIEWER: '안전 검토자',
  SUPPLIER: '공급업체', AUDITOR: '감사자',
};
export const displayLabel = (value: string | null | undefined) => value ? labels[value] ?? value : '미제공';
export const displayPercent = (value: number | null | undefined) => {
  if (value == null || !Number.isFinite(value)) return '미제공';
  if (value > 0 && value < 0.01) return '0.01% 미만';
  return `${Number(value.toFixed(2))}%`;
};
