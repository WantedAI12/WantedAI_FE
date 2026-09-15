'use client';

import Link from '@/components/ui/app-link';
import Image from 'next/image';
import { routes } from '@/lib/routes';
import { useState } from 'react';
import { ProjectSidebar } from '@/components/layout/project-sidebar';

function Rail({ side = 'left' }: { side?: 'left' | 'right' }) {
  return side === 'left' ? <ProjectSidebar /> : <aside className="wf-rail wf-rail-right" />;
}

export function RequestWorkspace() {
  const [description, setDescription] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const example = '깨끗하고 산뜻한 시트러스 향. 첫 향은 밝고 상쾌하게,\n잔향은 은은하고 오래 지속되도록. 샴푸용, 원료 비용은 kg당 4만원 이하.';

  return <div className="wf-layout wf-request-page"><Rail /><section className="wf-main"><div className="wf-request"><h1 className="wf-title">새로운 향을 만들고 싶나요?</h1><p className="wf-sub">향 콘셉트를 자연어로 설명해주세요.</p><div className="wf-request-input"><textarea className="wf-textarea" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} placeholder={example}/><p className="wf-count" aria-live="polite">{description.length}/2000</p></div><button type="button" className="wf-advanced-toggle" aria-expanded={advancedOpen} onClick={()=>setAdvancedOpen((open)=>!open)}><span>고급 설정</span><i className={`wf-chevron ${advancedOpen?'is-up':''}`} aria-hidden="true" /></button>{advancedOpen&&<div className="wf-request-fields"><label>사용 제품<input placeholder="바디로션 (Leave-on)"/></label><label>목표 사용 농도<input placeholder="0.6% – 0.9%"/></label><label>가격 상한 (원료비/100ml)<input placeholder="4,500원"/></label><label>필수 제약<input placeholder="IFRA 51차 준수, 알러젠 최소화"/></label></div>}<div className="wf-next"><Link href={routes.requestQuestions} className="wf-btn wf-btn-dark" onClick={()=>sessionStorage.setItem('perfumery.request-draft',JSON.stringify({description}))}>다음</Link></div></div></section><Rail side="right" /></div>;
}

export function ComplementaryQuestionsWorkspace() {
  const [answers,setAnswers]=useState({allergen:'',region:'',measurement:''});
  const update=(field:keyof typeof answers,value:string)=>setAnswers(current=>({...current,[field]:value}));
  const save=()=>sessionStorage.setItem('perfumery.complementary-answers',JSON.stringify(answers));
  return <div className="wf-layout wf-structured-page wf-questions-page"><Rail /><section className="wf-main"><h1 className="wf-title">보완 질문</h1><p className="wf-sub">후보 생성에 필요한 핵심 조건 중 일부가 비어 있거나 모호합니다. 아래 질문에 답해주세요.</p><div className="wf-question-list"><label><b>&quot;알러젠 최소화&quot;의 정량 기준은?</b><span className="wf-question-with-upload"><input value={answers.allergen} onChange={event=>update('allergen',event.target.value)} placeholder="EU 26종 알러젠 표기 임계값 이하"/><span className="wf-upload"><input type="file" aria-label="고객사 자체 기준 업로드"/><i>고객사 자체 기준(업로드)</i></span></span></label><label><b>대상 지역·규제 관할은?</b><input value={answers.region} onChange={event=>update('region',event.target.value)} placeholder="한국 KFDA, 전체 주요 시장"/></label><label><b>지속성 8시간 기준의 측정 방식은?</b><input value={answers.measurement} onChange={event=>update('measurement',event.target.value)} placeholder="팔뚝 도포 후 헤드스페이스 GC-MS 측정 기준"/></label></div><div className="wf-question-actions"><Link href={routes.requestStructured} className="wf-btn" onClick={save}>기본값으로 진행</Link><Link href={routes.requestStructured} className="wf-btn wf-btn-dark" onClick={save}>확인 후 진행</Link></div></section></div>;
}

const intentRows = [['ACCORD','Woody\nMusk'],['TOP NOTE','Citrus\nLight'],['LONGEVITY','≥ 8h @ Leave-on'],['IMPRESSION','Warm / Soft'],['PRICE CAP','₩4,500 / 100ml'],['INTENSITY','●●●○○']];

export function StructuredWorkspace() {
  return <div className="wf-layout wf-structured-page"><Rail /><section className="wf-main"><h1 className="wf-title">의도를 구조화했어요.</h1><p className="wf-sub">확인 후 다음단계로 진행해주세요.</p><div className="wf-structured-grid"><div><h2>입력 내용</h2><div className="wf-input-summary">우디 머스크 계열의 부드러운 첫인상.<br/>시트러스는 가볍게 스치는 정도로만.<br/>24시간 착용 기준 8시간 이상 지속되며,<br/>민감성 피부를 고려해 알러젠은 최소화.<br/>100ml 원료비 4,500원 이하.</div><h2 className="wf-missing-title">누락 정보</h2><div className="wf-missing">사용 농도<br/>성별 타깃<br/>주요 사용 채널</div><Link href={routes.requestQuestions} className="wf-complement">정보 보완하기</Link></div><div className="wf-intent-card">{intentRows.map(([label,value])=><div className="wf-intent-row" key={label}><b>{label}</b><span>{value}</span><small>Edit</small></div>)}</div></div><div className="wf-step-actions"><Link href={routes.requestQuestions} className="wf-btn">이전</Link><Link href={routes.formulas} className="wf-btn wf-btn-dark">다음</Link></div></section></div>;
}

function FormulaCard({ n }: { n: number }) {
  return <Link href="/formulas/1" className={`wf-card wf-card-${n}`}><div className="wf-tags"><span className="wf-tag">Woody · Musk</span><span className="wf-tag">Warm / Soft</span></div><Image className="wf-arrow" src="/figma/asset-2.svg" alt="상세 보기" width={55} height={55}/><h2 className="wf-card-name">FORMULA {String(n).padStart(2,'0')}</h2><div className="wf-card-meta"><span>목표 일치도</span><b>92%</b><span>예상비용</span><b>₩4,200</b><span>지속성</span><b>8.6H</b></div></Link>;
}

export function FormulaWorkspace() {
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [selected, setSelected] = useState([1, 2, 3]);
  const resetComparison = () => setSelected([]);
  const addCandidate = () => setSelected((current) => current.length < 4 ? [...current, current.length + 1] : current);
  const comparisonMetrics = ['목표 일치도','원료비 / 100ml','지속성 예측','공급 리스크','데이터 적용범위','안전 게이트'];

  return <div className={`wf-layout wf-formula-page ${comparisonOpen?'is-comparing':''}`}><Rail /><section className="wf-main"><h1 className="wf-title">후보 조향식 목록</h1><p className="wf-sub">상세를 확인하고 최적의 조향식을 선택하세요.</p><div className="wf-cards">{[1,2,3,4].map((n)=><FormulaCard n={n} key={n}/>)}</div><div className="wf-compare-heading"><div><h2 className="wf-compare-title">후보 조향식 비교</h2><p className="wf-sub">최대 3개까지 비교할 수 있습니다.</p></div>{comparisonOpen&&<button type="button" className="wf-compare-reset" onClick={resetComparison}>비교 초기화</button>}</div>{!comparisonOpen?<button type="button" className="wf-compare-add" onClick={()=>setComparisonOpen(true)}>+ 비교할 후보 선택하기</button>:<div className="wf-comparison"><div className="wf-comparison-picks">{selected.map((n,index)=><button type="button" className="wf-comparison-pick" onClick={()=>setSelected((current)=>current.filter((_,i)=>i!==index))} key={`${n}-${index}`}><span><small>Woody · Musk</small><small>Warm / Soft</small></span><b>FORMULA {String(n).padStart(2,'0')}</b><i>✓</i></button>)}{selected.length<3&&<button type="button" className="wf-comparison-plus" onClick={addCandidate} aria-label="비교 후보 추가">+</button>}</div>{selected.length>0&&<div className="wf-comparison-table"><div className="wf-comparison-row head">{comparisonMetrics.map((metric)=><b key={metric}>{metric}</b>)}</div>{selected.map((n,index)=><div className="wf-comparison-row" key={`${n}-${index}`}><span>92%</span><span>₩4,180</span><span>8.6h</span><span>중간</span><span>{index===2?'부분 OOD':'범위 내'}</span><span>통과</span></div>)}</div>}</div>}</section></div>;
}

export function EmptyWorkspace({ title, sub }: { title: string; sub: string }) {
  return <div className="wf-layout wf-empty-page"><Rail /><section className="wf-main"><h1 className="wf-title">{title}</h1><p className="wf-sub">{sub}</p></section></div>;
}
