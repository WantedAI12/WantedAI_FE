'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CandidateResponse } from '@/types/domain';

interface Props {
  candidate: CandidateResponse;
  comment: string;
  onCommentChange: (value: string) => void;
  busy: boolean;
  notice: string;
  onClose: () => void;
  onSubmit: (decision: 'APPROVED' | 'REJECTED') => Promise<void>;
}

export function SafetyDecisionDialog({ candidate, comment, onCommentChange, busy, notice, onClose, onSubmit }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element?.showModal();
    return () => {
      element?.close();
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  return (
    <dialog ref={dialog} className="safety-decision-dialog" aria-labelledby="safety-decision-title" aria-describedby="safety-decision-description" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
      <button type="button" className="safety-decision-close" onClick={onClose} disabled={busy} aria-label="승인 결정 창 닫기"><X size={25} strokeWidth={2} /></button>
      <form onSubmit={(event) => { event.preventDefault(); void onSubmit(decision); }}>
        <h2 id="safety-decision-title">승인 결정</h2>
        <p id="safety-decision-description">선택한 후보에 대한 안전 검토 결과를 결정할 수 있습니다.</p>

        <section className="safety-decision-candidate">
          <h3>후보 정보</h3>
          <div><span>FORMULA {String(candidate.candidateId).padStart(2, '0')}</span><span>버전 #{candidate.currentVersion.versionId}</span></div>
        </section>

        <fieldset className="safety-decision-options" disabled={busy}>
          <legend>결정</legend>
          <div>
            <label><input type="radio" name="safety-decision" value="APPROVED" checked={decision === 'APPROVED'} onChange={() => setDecision('APPROVED')} />승인</label>
            <label className="is-unavailable" title="조건부 승인 기능은 준비 중입니다."><input type="radio" name="safety-decision" disabled />조건부 승인</label>
            <label><input type="radio" name="safety-decision" value="REJECTED" checked={decision === 'REJECTED'} onChange={() => setDecision('REJECTED')} />반려</label>
          </div>
        </fieldset>

        <section className="safety-decision-opinion">
          <label htmlFor="safety-decision-comment">의견</label>
          <div><textarea id="safety-decision-comment" value={comment} maxLength={300} disabled={busy} onChange={(event) => onCommentChange(event.target.value)} placeholder="검토 결과를 입력해주세요." /><span>{comment.length}/300</span></div>
        </section>

        <section className="safety-decision-attachment">
          <h3>첨부파일 (선택)</h3>
          <div><button type="button" disabled>파일 업로드</button><small>최대 10MB, PDF/이미지/문서 형식 · 준비 중</small></div>
        </section>

        {notice && <output className="safety-decision-notice">{notice}</output>}
        <footer><button type="button" onClick={onClose} disabled={busy}>취소</button><button type="submit" disabled={busy}>{busy ? '저장 중…' : '결정 저장'}</button></footer>
      </form>
    </dialog>
  );
}
