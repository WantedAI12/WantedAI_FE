'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

function Rail({ side = 'left' }: { side?: 'left' | 'right' }) {
  return <aside className={`wf-rail wf-rail-${side}`} />;
}

export function RequestWorkspace() {
  const [description, setDescription] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const example = '깨끗하고 산뜻한 시트러스 향. 첫 향은 밝고 상쾌하게,\n잔향은 은은하고 오래 지속되도록. 샴푸용, 원료 비용은 kg당 4만원 이하.';

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords((current) => current.includes(keyword)
      ? current.filter((item) => item !== keyword)
      : [...current, keyword]);
  };

  return <div className="wf-layout wf-request-page"><Rail /><section className="wf-main"><div className="wf-request"><h1 className="wf-title">새로운 향을 만들고 싶나요?</h1><p className="wf-sub">향 콘셉트를 자연어로 설명해주세요.</p><textarea className="wf-textarea" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} placeholder={example}/><p className="wf-count" aria-live="polite">{description.length}/2000</p><p className="wf-chips-label">참고 키워드 (선택)</p><div className="wf-chips">{['시트러스','깨끗한','산뜻한','샴푸','지속성','저비용'].map(keyword=>{const selected=selectedKeywords.includes(keyword);return <button type="button" className={`wf-chip ${selected?'is-selected':''}`} aria-pressed={selected} onClick={()=>toggleKeyword(keyword)} key={keyword}>{selected?'✓ ':'+ '}{keyword}</button>})}</div><div className="wf-next"><Link href="/requests/structured" className="wf-btn wf-btn-dark" onClick={()=>sessionStorage.setItem('perfumery.request-draft',JSON.stringify({description,keywords:selectedKeywords}))}>다음</Link></div></div></section><Rail side="right" /></div>;
}

const intentRows = [['ACCORD','Woody\nMusk'],['TOP NOTE','Citrus\nLight'],['LONGEVITY','≥ 8h @ Leave-on'],['IMPRESSION','Warm / Soft'],['PRICE CAP','₩4,500 / 100ml'],['INTENSITY','●●●○○']];

export function StructuredWorkspace() {
  return <div className="wf-layout wf-structured-page"><Rail /><section className="wf-main"><h1 className="wf-title">의도를 구조화했어요.</h1><p className="wf-sub">확인 후 다음단계로 진행해주세요.</p><div className="wf-structured-grid"><div><h2>입력 내용</h2><div className="wf-input-summary">우디 머스크 계열의 부드러운 첫인상.<br/>시트러스는 가볍게 스치는 정도로만.<br/>24시간 착용 기준 8시간 이상 지속되며,<br/>민감성 피부를 고려해 알러젠은 최소화.<br/>100ml 원료비 4,500원 이하.</div><h2 className="wf-missing-title">누락 정보</h2><div className="wf-missing">사용 농도<br/>성별 타깃<br/>주요 사용 채널</div><button className="wf-complement">정보 보완하기</button></div><div className="wf-intent-card">{intentRows.map(([label,value])=><div className="wf-intent-row" key={label}><b>{label}</b><span>{value}</span><small>Edit</small></div>)}</div></div><div className="wf-step-actions"><Link href="/requests" className="wf-btn">이전</Link><Link href="/formulas" className="wf-btn wf-btn-dark">다음</Link></div></section></div>;
}

function FormulaCard({ n }: { n: number }) {
  return <Link href="/formulas/1" className="wf-card"><div className="wf-tags"><span className="wf-tag">Woody · Musk</span><span className="wf-tag">Warm / Soft</span></div><Image className="wf-arrow" src="/figma/asset-2.svg" alt="상세 보기" width={55} height={55}/><h2 className="wf-card-name">FORMULA {String(n).padStart(2,'0')}</h2><div className="wf-card-meta"><span>목표 일치도</span><span>92%</span><span>예상비용</span><span>₩4,200</span><span>지속성</span><span>8.6H</span></div></Link>;
}

export function FormulaWorkspace() {
  return <div className="wf-layout wf-formula-page"><Rail /><section className="wf-main"><h1 className="wf-title">후보 조향식 목록</h1><p className="wf-sub">상세를 확인하고 최적의 조향식을 선택하세요.</p><div className="wf-cards">{[1,2,3,1].map((n,i)=><FormulaCard n={n} key={i}/>)}</div><h2 className="wf-compare-title">후보 조향식 비교</h2><p className="wf-sub">최대 3개까지 비교할 수 있습니다.</p><button className="wf-compare-add">+ 비교할 후보 선택하기</button></section></div>;
}

export function EmptyWorkspace({ title, sub }: { title: string; sub: string }) {
  return <div className="wf-layout wf-empty-page"><Rail /><section className="wf-main"><h1 className="wf-title">{title}</h1><p className="wf-sub">{sub}</p></section></div>;
}
