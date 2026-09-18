'use client';

import { useEffect, useRef, useState } from 'react';
import { candidateApi } from '@/lib/api/resources';

export function CandidateDeleteDialog({ candidateId, onClose }: { candidateId: number; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const inFlight = useRef(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  async function remove() {
    if (inFlight.current) return;
    inFlight.current = true;
    setDeleting(true);
    setError('');
    try {
      await candidateApi.delete(candidateId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '후보를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      inFlight.current = false;
      setDeleting(false);
      return;
    }
    window.location.replace('/formulas');
  }

  return <dialog ref={dialog} className="candidate-delete-dialog" aria-labelledby="candidate-delete-title" aria-describedby="candidate-delete-description" aria-busy={deleting} onCancel={(event) => { event.preventDefault(); if (!inFlight.current) onClose(); }}>
    <h2 id="candidate-delete-title">후보 삭제</h2>
    <p><strong>FORMULA {String(candidateId).padStart(2, '0')}</strong> 후보를 삭제하시겠습니까?</p>
    <p id="candidate-delete-description">이 후보의 버전·메모·근거·실험 이력 등 관련 데이터도 함께 삭제되며, 되돌릴 수 없습니다. 프로젝트 전체를 삭제하는 것은 아닙니다.</p>
    {error && <p role="alert" className="candidate-delete-error">{error}</p>}
    <footer>
      <button type="button" autoFocus disabled={deleting} onClick={onClose}>취소</button>
      <button type="button" className="candidate-delete-confirm" disabled={deleting} onClick={remove}>{deleting ? '삭제 중…' : '후보 삭제'}</button>
    </footer>
  </dialog>;
}
