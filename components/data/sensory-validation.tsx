'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api/client';
import {
  candidateApi,
  evidenceApi,
  projectApi,
  requestApi,
} from '@/lib/api/resources';
import type { CandidateResponse, SensoryTestResponse } from '@/types/domain';
type Test = SensoryTestResponse & {
  panelSize?: number;
  blindLevel?: string;
  published?: boolean;
};
const labels: Record<string, string> = {
  intensity: '향의 강도',
  longevity: '지속력',
  sillage: '잔향',
  overall_score: '전체 만족도',
  overallScore: '전체 만족도',
  evaluation_note: '평가 의견',
  note: '평가 의견',
};
export function SensoryValidation() {
  const [candidates, setCandidates] = useState<CandidateResponse[]>([]);
  const [selected, setSelected] = useState('');
  const [message, setMessage] = useState('후보를 불러오는 중입니다.');
  useEffect(() => {
    let alive = true;
    projectApi
      .list()
      .then(async (projects) => {
        const requests = await Promise.all(
          projects.map((project) => requestApi.list(project.projectId)),
        );
        const pages = await Promise.all(
          requests
            .flatMap((page) => page.content)
            .map((request) => candidateApi.list(request.requestId)),
        );
        if (alive) {
          const items = pages.flat();
          setCandidates(items);
          setSelected(String(items[0]?.candidateId ?? ''));
          setMessage('등록된 후보가 없습니다.');
        }
      })
      .catch(() => {
        if (alive) setMessage('후보를 불러오지 못했습니다.');
      });
    return () => {
      alive = false;
    };
  }, []);
  return (
    <>
      <header className="data-sensory-hero">
        <div>
          <select
            aria-label="관능 검증 후보"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
          >
            <option value="">관능 검증</option>
            {candidates.map((item) => (
              <option key={item.candidateId} value={item.candidateId}>
                FORMULA {String(item.candidateId).padStart(2, '0')}
              </option>
            ))}
          </select>
          <p>
            제품의 향과 사용감을 평가하기 위한 관능 검증을 설명하고 결과를
            확인할 수 있습니다.
          </p>
        </div>
      </header>
      <main className="data-body sensory-body">
        {selected ? (
          <SensoryTests key={selected} candidateId={Number(selected)} />
        ) : (
          <p className="data-empty">{message}</p>
        )}
      </main>
    </>
  );
}
function SensoryTests({ candidateId }: { candidateId: number }) {
  const [tests, setTests] = useState<Test[]>([]);
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState('불러오는 중입니다.');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let alive = true;
    evidenceApi
      .tests(candidateId)
      .then((items) => {
        if (alive) {
          setTests(items);
          setMessage('등록된 관능 시험이 없습니다.');
        }
      })
      .catch(() => {
        if (alive) setMessage('관능 시험을 불러오지 못했습니다.');
      });
    return () => {
      alive = false;
    };
  }, [candidateId, retry]);
  if (!tests.length)
    return (
      <div className="data-empty">
        {message}
        <button
          className="data-outline"
          onClick={() => {
            setMessage('불러오는 중입니다.');
            setRetry(retry + 1);
          }}
        >
          다시 조회
        </button>
      </div>
    );
  return (
    <>
      {tests.length > 1 && (
        <label className="data-test-picker">
          검증 시험{' '}
          <select
            value={index}
            onChange={(event) => setIndex(Number(event.target.value))}
          >
            {tests.map((test, i) => (
              <option key={test.testId} value={i}>
                시험 #{test.testId} ·{' '}
                {new Date(test.createdAt).toLocaleDateString('ko-KR')}
              </option>
            ))}
          </select>
        </label>
      )}
      <TestCards key={tests[index].testId} initial={tests[index]} />
    </>
  );
}
function TestCards({ initial }: { initial: Test }) {
  const [test, setTest] = useState(initial);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const completed = test.status === 'COMPLETED';
  const progress = completed ? 100 : 0;
  const latest = test.results.at(-1);
  async function record() {
    if (!note.trim() || busy) return;
    setBusy(true);
    setNotice('');
    try {
      const result = await evidenceApi.addResult(test.testId, {
        evaluation_note: note.trim(),
      });
      setTest({
        ...test,
        status: 'COMPLETED',
        results: [...test.results, result],
      });
      setNote('');
      setNotice('평가 의견을 저장했습니다.');
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : '저장하지 못했습니다.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function publish() {
    setBusy(true);
    setNotice('');
    try {
      const updated = await apiRequest<Test>(
        `/sensory-tests/${test.testId}/publish`,
        { method: 'POST' },
      );
      setTest(updated);
      setNotice('검증 결과를 공개했습니다.');
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : '결과를 공개하지 못했습니다.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <section className="data-progress">
        <div>
          <h2>진행률</h2>
          <span>
            {completed ? '결과 등록 완료' : '검증 계획 등록'} · 시험 #
            {test.testId}
          </span>
        </div>
        <div>
          <progress value={progress} max={100} aria-label="시험 완료 상태" />
          <strong>{progress}%</strong>
        </div>
        <small>
          서버 시험 상태 기준입니다. 패널별 참여율과는 다를 수 있습니다.
        </small>
      </section>
      <div className="sensory-grid">
        <div className="sensory-left">
          <section className="sensory-card">
            <h2>검증 계획</h2>
            <dl>
              <div>
                <dt>패널 규모</dt>
                <dd>
                  {test.panelSize ? `${test.panelSize}명` : '미등록'}
                  {test.blindLevel ? ` · ${test.blindLevel}` : ''}
                </dd>
              </div>
              <div>
                <dt>시험 계획</dt>
                <dd>{test.planDetail || '미등록'}</dd>
              </div>
              <div>
                <dt>생성일</dt>
                <dd>{new Date(test.createdAt).toLocaleDateString('ko-KR')}</dd>
              </div>
              <div>
                <dt>결과 공개 상태</dt>
                <dd>{test.published ? '공개 완료' : '공개 전'}</dd>
              </div>
            </dl>
          </section>
          <section className="sensory-card">
            <h2>검증 결과</h2>
            {latest ? (
              <dl>
                {Object.entries(latest.resultData ?? {}).map(([key, value]) => (
                  <div key={key}>
                    <dt>{labels[key] ?? key}</dt>
                    <dd>
                      {typeof value === 'object'
                        ? JSON.stringify(value)
                        : typeof value === 'string'
                          ? value
                          : JSON.stringify(value ?? '—')}
                    </dd>
                  </div>
                ))}
                <div>
                  <dt>등록된 결과</dt>
                  <dd>{test.results.length}건</dd>
                </div>
              </dl>
            ) : (
              <p className="sensory-empty">아직 등록된 검증 결과가 없습니다.</p>
            )}
          </section>
        </div>
        <section className="sensory-card sensory-management">
          <h2>관리 입력</h2>
          <label htmlFor="sensory-note">수동 입력</label>
          <textarea
            id="sensory-note"
            placeholder="평가 의견을 직접 입력할 수 있습니다."
            value={note}
            maxLength={2000}
            disabled={busy || test.published}
            onChange={(event) => setNote(event.target.value)}
          />
          <small>
            의견 저장 시 시험이 완료 상태로 변경됩니다. 공개 후에는 이 화면에서
            수정할 수 없습니다.
          </small>
          <button
            className="data-outline"
            disabled={busy || !note.trim() || test.published}
            onClick={() => void record()}
          >
            평가 의견 저장
          </button>
          <h3>공개 승인</h3>
          <button
            className="data-primary"
            disabled={busy || !completed || test.published}
            onClick={() => void publish()}
          >
            {test.published
              ? '결과 공개 완료'
              : busy
                ? '처리 중…'
                : '결과 공개'}
          </button>
          <small>관능 담당자 또는 프로젝트 관리자가 공개할 수 있습니다.</small>
          {notice && <output className="data-notice">{notice}</output>}
        </section>
      </div>
    </>
  );
}
