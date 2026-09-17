'use client';

import { useEffect, useRef, useState } from 'react';
import { evidenceApi, jobApi } from '@/lib/api/resources';
import type { CandidateResponse, JobResponse } from '@/types/domain';

function pause(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(new DOMException('Cancelled', 'AbortError')); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, 2000);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
  });
}

export function EvidenceDownloadDialog({ candidate, onClose }: { candidate: CandidateResponse; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const controller = useRef<AbortController | null>(null);
  const job = useRef<JobResponse | null>(null);
  const [format, setFormat] = useState<'PDF' | 'JSON'>('PDF');
  const [phase, setPhase] = useState<'form' | 'loading' | 'error'>('form');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const formula = `FORMULA ${String(candidate.candidateId).padStart(2, '0')}`;
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element?.showModal();
    return () => {
      controller.current?.abort();
      element?.close();
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  async function download() {
    if (controller.current && !controller.current.signal.aborted) return;
    const operation = new AbortController();
    controller.current = operation;
    const { signal } = operation;
    setPhase('loading');
    try {
      if (!job.current) job.current = await evidenceApi.createReport(candidate.candidateId);
      for (let attempt = 0; attempt < 120; attempt++) {
        signal.throwIfAborted();
        if (job.current.status === 'SUCCEEDED') break;
        if (job.current.status === 'FAILED' || job.current.status === 'CANCELLED') {
          job.current = null;
          throw new Error('보고서 생성 실패');
        }
        await pause(signal);
        job.current = await jobApi.detail(job.current.jobId);
      }
      signal.throwIfAborted();
      if (job.current.status !== 'SUCCEEDED' || !job.current.resultRefId) throw new Error('보고서 생성 지연');
      const report = await evidenceApi.report(job.current.resultRefId);
      signal.throwIfAborted();
      if (format === 'PDF') {
        if (!report.fileUrl) throw new Error('PDF 파일 없음');
        const fileUrl = new URL(report.fileUrl, window.location.origin);
        if (!['https:', 'http:'].includes(fileUrl.protocol)) throw new Error('잘못된 PDF 주소');
        // Use an explicit click after generation to avoid delayed popup blocking.
        setPdfUrl(fileUrl.href);
        setPhase('form');
        return;
      }
      if (!report.reportData) throw new Error('보고서 데이터 없음');
      const blob = new Blob([JSON.stringify(report.reportData, null, 2)], { type: 'application/json;charset=utf-8' });
      signal.throwIfAborted();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${formula.replaceAll(' ', '-')}-evidence-report.${format.toLowerCase()}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      onClose();
    } catch {
      if (!signal.aborted) setPhase('error');
    } finally {
      operation.abort();
    }
  }

  return <dialog ref={dialog} className={`ea-download-dialog ${phase === 'error' ? 'is-error' : ''}`} aria-labelledby="ea-download-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    {phase === 'error' ? <><h2 id="ea-download-title">다운로드에 실패했습니다.</h2><p>잠시 후 다시 시도해주세요.</p><footer><button type="button" onClick={() => void download()}>다시 시도</button><button type="button" className="primary" onClick={onClose}>닫기</button></footer></> : <form onSubmit={(event) => { event.preventDefault(); void download(); }}>
      <h2 id="ea-download-title">다운로드</h2>
      {pdfUrl && format === 'PDF' && <output>보고서가 준비되었습니다. PDF 열기를 누르면 새 탭에서 열립니다.</output>}
      <div className="ea-download-fields">
        <label>다운로드 대상<input value={formula} readOnly /></label>
        <label>버전<input value={`현재 버전 #${candidate.currentVersion.versionId}`} readOnly /></label>
        <label>범위<input value="전체 증거·감사 보고서" readOnly /></label>
        <fieldset disabled={phase === 'loading'}><legend>파일형식</legend>{(['PDF', 'JSON'] as const).map((item) => <label key={item}><input type="radio" name="report-format" value={item} checked={format === item} onChange={() => setFormat(item)} />{item}</label>)}</fieldset>
      </div>
      {phase === 'loading' && <output className="ea-download-progress">보고서를 준비하고 있습니다.</output>}
      <footer><button type="button" onClick={onClose}>닫기</button>{pdfUrl && format === 'PDF' ? <a className="primary ea-pdf-link" href={pdfUrl} target="_blank" rel="noopener noreferrer">PDF 열기 (새 탭)</a> : <button type="submit" className="primary" disabled={phase === 'loading'}>{phase === 'loading' ? '준비 중…' : '다운로드'}</button>}</footer>
    </form>}
  </dialog>;
}
