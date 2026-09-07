'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { experimentApi } from '@/lib/api/resources';

const tabs = ['조향식 구성', '성능 프록시', '안전 / 규제', '근거&데이터', '메모'] as const;
type Tab = (typeof tabs)[number];

function Composition() {
  const rows = [['Cashmeran',18.2],['Ethylene Brassylate',14.5],['Iso E Super',11],['Bergamot FCF',6.4],['기타 22종',49.9]] as const;
  return <div className="wf-formula-cols"><div><h2 className="wf-panel-title">조향식 구성</h2><div className="wf-bars">{rows.map(([name,width])=><div className="wf-bar-row" key={name}><span>{name}</span><div className="wf-bar-track"><div className="wf-bar-fill" style={{width:`${width * 1.86}%`}} /></div><span>{width.toFixed(1)}%</span></div>)}</div></div><div><h2 className="wf-panel-title">조향식 정보</h2><div className="wf-info-card">{[['목표 일치도','96%'],['예상 원가','₩4,180 / 100ml'],['사용 농도','0.2~0.5%'],['제품 유형','바디로션'],['지속성 예측','8.6h']].map(([label,value])=><div className="wf-info-row" key={label}><span>{label}</span><b>{value}</b></div>)}</div></div></div>;
}

function Performance() {
  return <div><h2 className="wf-panel-title">시간에 따른 향 변화</h2><div className="wf-chart"><Image className="wf-curve" src="/figma/performance-curve.svg" alt="시간 경과에 따른 향 변화" width={1079} height={32}/><Image className="wf-chart-dot dot-1" src="/figma/chart-dot.svg" alt="" width={21} height={21}/><Image className="wf-chart-dot dot-2" src="/figma/chart-dot.svg" alt="" width={21} height={21}/><div className="wf-chart-labels"><span>0</span><span>30m</span><span>4h</span><span>8h</span></div></div><div className="wf-performance-info"><span>사용 농도</span><b>0.5%</b><span>지속성 예측</span><b>약 8 h</b><span>예측 상태</span><b>적용 범위 내</b></div></div>;
}

function Safety() {
  const rows=[['사용 제품','바디 로션'],['사용 농도','10%'],['안전성','검토 조건 충족'],['원료 제한','제한 원료 없음'],['공급 리스크','주요 원료 공급 가능'],['원가','목표 범위 내']];
  return <div className="wf-safety-layout"><div className="wf-safety-card">{rows.map(([label,value])=><div key={label}><span>{label}</span><b>{value}</b></div>)}</div><div className="wf-safety-copy"><h2>SAFE TO REVIEW</h2><p>현재 등록된 원료·제품 조건을 기준으로<br/>필수 안전·규제 검토 조건을 충족했습니다.</p><small>※ 최종 제품 적용 전 제품별 안전성 및<br/>최신 규제 기준에 대한 별도 검토가 필요합니다.</small></div></div>;
}

function Evidence() {
  return <div><div className="wf-evidence"><div><h2>원료 데이터</h2><strong>48</strong><span>사용 가능 원료</span><p>원료 특성<br/><small>향조 · 휘발성 · 사용 제한 · 공급 정보</small></p></div><div><h2>조향식 데이터</h2><strong>126</strong><span>유사 조향식</span><p>Woody · Musk 계열<br/><small>바디로션 적용 데이터 포함</small></p></div></div><div className="wf-evidence-strip"><div><span>데이터 적용범위</span><b>IN-DOMAIN</b></div><div><span>불확실성</span><b>LOW–MEDIUM</b></div><div><span>OOD</span><b>NOT DETECTED</b></div><small>Dataset<br/>Fragrance R&amp;D Dataset v2.4</small><small>Updated<br/>2026.08.30</small><small>Model<br/>Performance Proxy v1.8</small></div></div>;
}

function Memo() {
  return <div className="wf-memos">{[['입력 내용','우디 머스크 계열의 부드러운 첫인상.\n시트러스는 가볍게 스치는 정도로만.\n24시간 착용 기준 8시간 이상 지속되며,\n민감성 피부를 고려해 알러젠은 최소화.\n100ml 원료비 4,500원 이하.'],['검토 사항',''],['다음 실험','']].map(([title,body])=><article key={title}><b>{title}</b><p>{body}</p></article>)}</div>;
}

export function FormulaDetail() {
  const [active,setActive]=useState<Tab>('조향식 구성');
  const [selected, setSelected] = useState(false);
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState('목표 일치도 92% · 우디 머스크 바디로션 리뉴얼');
  const [draftSummary, setDraftSummary] = useState(summary);
  const [notice, setNotice] = useState('');

  async function selectFinalCandidate() {
    setSelected(true);
    setNotice('최종후보로 선택했습니다.');
    try {
      await experimentApi.update(1, 'CONFIRMED_FOR_EXPERIMENT');
    } catch {
      setNotice('화면에 최종후보로 저장했습니다. 백엔드 연결 후 서버에도 반영됩니다.');
    }
  }

  function duplicateCandidate() {
    sessionStorage.setItem('perfumery.duplicated-candidate', JSON.stringify({ sourceId: 1, summary }));
    setNotice('후보 복제본을 임시 저장했습니다.');
  }

  function toggleEdit() {
    if (editing) {
      setSummary(draftSummary.trim() || summary);
      setNotice('후보 수정 내용을 저장했습니다.');
    }
    setEditing((current) => !current);
  }

  return <div className="wf-layout"><aside className="wf-rail wf-rail-left" /><section className="wf-detail"><div className="wf-detail-hero"><Link href="/formulas" className="wf-back"><Image className="wf-back-icon" src="/figma/back-arrow.svg" alt="" width={20} height={20}/>후보 목록으로 돌아가기</Link><h1 className="wf-detail-title">FORMULA 01</h1>{editing?<input className="wf-detail-sub wf-detail-sub-input" value={draftSummary} onChange={(event)=>setDraftSummary(event.target.value)} aria-label="후보 설명"/>:<p className="wf-detail-sub">{summary}</p>}<div className="wf-detail-meta"><span>생성일&nbsp;&nbsp; 2026. 09.04</span><span>버전&nbsp;&nbsp; V1</span></div><div className="wf-detail-actions"><button type="button" className={`wf-btn wf-btn-dark ${selected?'is-selected':''}`} onClick={selectFinalCandidate}>{selected?'최종후보 선택됨':'최종후보 선택'}</button><button type="button" className="wf-btn" onClick={duplicateCandidate}>후보 복제</button><button type="button" className="wf-btn" onClick={toggleEdit}>{editing?'수정 저장':'후보 수정'}</button>{notice&&<output className="wf-action-notice">{notice}</output>}</div></div><div className="wf-tabs">{tabs.map(tab=><button type="button" className={`wf-tab ${active===tab?'active':''}`} onClick={()=>setActive(tab)} key={tab}>{tab}</button>)}</div><div className="wf-detail-body">{active==='조향식 구성'&&<Composition/>}{active==='성능 프록시'&&<Performance/>}{active==='안전 / 규제'&&<Safety/>}{active==='근거&데이터'&&<Evidence/>}{active==='메모'&&<Memo/>}</div></section></div>;
}
