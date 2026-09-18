import type { LotionDetailResponse } from '@/types/domain';
import { displayPercent } from '@/lib/display-labels';

const verdict = (value: boolean | null | undefined) => value == null ? '미제공' : value ? '충족' : '미충족';
export function LotionAssessment({ detail, failed }: { detail: LotionDetailResponse | null; failed: boolean }) {
  if (!detail) return <section className="lotion-assessment"><h2>로션 목표 평가</h2><p>{failed ? '로션 상세 평가를 불러오지 못했습니다. 새로고침 후 다시 확인해 주세요.' : '로션 상세 평가를 확인하고 있습니다.'}</p></section>;
  const score = detail.score;
  return <section className="lotion-assessment">
    <h2>로션 목표 평가</h2>
    <p>요청 농도는 입력값입니다. 현재 로션 생성 API는 이 값을 전달하지 않고 모델 기본 조건을 사용하므로, 서버 배합의 향료 함량과 다를 수 있습니다. 실제 생성 조건은 아래 서버 원문에서 확인할 수 있습니다.</p>
    <dl>
      <div><dt>향 프로필 목표</dt><dd>{verdict(detail.profileTargetMet)}</dd></div>
      <div><dt>탐색 상태</dt><dd>{detail.searchIncomplete == null ? '미제공' : detail.searchIncomplete ? '탐색 미완료' : '탐색 완료'}</dd></div>
      <div><dt>서버 평가 점수</dt><dd>{typeof score === 'number' ? Number(score.toFixed(2)) : score == null ? '미제공' : '아래 평가 상세 참조'}</dd></div>
      <div><dt>사람의 향 유사도</dt><dd>{displayPercent(detail.humanSimilarityPercent)}</dd></div>
      <div><dt>전체 요구사항 검증</dt><dd>{verdict(detail.allUserRequirementsVerified)}</dd></div>
      <div><dt>제조 승인</dt><dd>{detail.manufacturingApproved == null ? '미제공' : detail.manufacturingApproved ? '승인' : '미승인'}</dd></div>
    </dl>
    <p>서버 평가 점수는 사람의 향 유사도(%)와 다른 지표입니다. 미달 원인이나 기준 점수가 응답에 없으면 추정하지 않습니다.</p>
    {[
      ['점수 및 판정 근거', { status: detail.status, scoreKind: detail.scoreKind, score, candidateUse: detail.candidateUse, closestCandidate: detail.closestCandidate }],
      ['평가 모델 및 한계', detail.perceptionModel],
      ['실제 생성 조건', { productModel: detail.productModel, preparation: detail.preparation }],
    ].map(([label, value]) => value != null && <details key={String(label)}><summary>{String(label)} (서버 원문)</summary><pre>{JSON.stringify(value, null, 2)}</pre></details>)}
  </section>;
}
