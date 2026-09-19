'use client';

import { useEffect, useRef, useState } from 'react';
import { tokenStorage } from '@/lib/api/client';
import { dismissUsageGuide, shouldShowUsageGuide } from '@/lib/usage-guide';
import styles from './usage-guide.module.css';

const steps = [
  ['프로젝트 만들기', '메인 화면의 ‘새 프로젝트’에서 이름과 설명을 입력해 작업 공간을 만드세요.'],
  ['향 요청 작성하기', '프로젝트를 선택하고 원하는 향, 제품 유형, 사용 농도 등을 입력한 뒤 요청 내용을 확인·확정하세요.'],
  ['후보 조향식 확인하기', '생성이 끝나면 ‘후보 조향식’에서 원료 구성과 생성 근거를 확인하세요. 실패한 요청은 안내를 확인하고 조건을 수정할 수 있어요.'],
  ['시험·검증 진행하기', '후보를 검토하고 시험·검증 결과를 확인하세요. 승인 등 일부 작업에는 프로젝트 역할 권한이 필요해요.'],
  ['보고서 다운로드하기', '후보의 증거·감사 화면에서 이력을 확인하고 ‘보고서 다운로드’를 이용하세요.'],
];

export function UsageGuide() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const element = dialog.current;
    try {
      if (shouldShowUsageGuide(tokenStorage.isGuest(), window.localStorage, window.sessionStorage)) element?.showModal();
    } catch { /* Storage may be unavailable in restricted browsers. Manual help remains available. */ }
    return () => element?.close();
  }, []);

  function close(permanent = false) {
    let saved = false;
    try {
      saved = dismissUsageGuide(permanent, window.localStorage, window.sessionStorage);
    } catch { /* Closing must still work when browser storage is blocked. */ }
    setNotice(saved ? '' : '브라우저 저장소를 사용할 수 없어 다음 방문에 안내가 다시 표시될 수 있습니다.');
    dialog.current?.close();
    trigger.current?.focus();
  }

  return <>
    <button ref={trigger} type="button" className="wf-btn" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>사용 가이드</button>
    {notice && <output className={styles.notice}>{notice}</output>}
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="usage-guide-title" aria-describedby="usage-guide-description" onCancel={(event) => { event.preventDefault(); close(); }}>
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>PERFUMERY · QUICK START</p><h2 id="usage-guide-title">처음이라면, 이렇게 시작하세요</h2></div>
        <button type="button" className={styles.close} aria-label="사용 가이드 닫기" autoFocus onClick={() => close()}>×</button>
      </header>
      <p id="usage-guide-description" className={styles.intro}>원하는 향을 설명하고, 생성된 조향식을 차근차근 검토해 보세요.</p>
      <ol className={styles.steps}>{steps.map(([title, description], index) => <li key={title}><span className={styles.number} aria-hidden="true">{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
      <p className={styles.note}>게스트로 다시 시작하면 새 계정이 만들어져 이전 작업이 보이지 않을 수 있어요. 생성된 후보는 참고용이며, 실제 사용 전 안전성 검토가 필요합니다.</p>
      <footer className={styles.footer}><button type="button" className="wf-btn" onClick={() => close(true)}>다시 보지 않기</button><button type="button" className="wf-btn wf-btn-dark" onClick={() => close()}>닫기</button></footer>
      <p className={styles.hint}>메인 화면의 ‘사용 가이드’에서 언제든 다시 볼 수 있어요. ‘다시 보지 않기’는 이 브라우저에 적용됩니다.</p>
    </dialog>
  </>;
}
