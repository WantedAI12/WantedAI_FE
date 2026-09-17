'use client';
import { useRef, useState } from 'react';
import { apiRequest } from '@/lib/api/client';
import { importFields, mappedRow, parseImport, rowError } from './import-data';
type ImportResult = {
  succeededCount: number;
  failedCount: number;
  failures: { externalId: string; errorMessage: string }[];
};
const titles = ['원료·시험 데이터 가져오기', '데이터 매핑', '오류 행 검토'];
export function RawDataWorkspace() {
  const [tab, setTab] = useState(0);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const errors = rows
    .map((row, index) => ({
      index,
      row: mappedRow(row, mapping),
      error: rowError(mappedRow(row, mapping)),
    }))
    .filter((row) => row.error);
  async function readFile(file?: File) {
    if (!file) return;
    setNotice('');
    try {
      if (file.size > 10 * 1024 * 1024)
        throw new Error('10MB 이하 파일을 선택해 주세요.');
      if (!/\.(csv|json)$/i.test(file.name))
        throw new Error('CSV 또는 JSON 파일을 선택해 주세요.');
      const parsed = parseImport(await file.text(), /\.json$/i.test(file.name));
      if (!parsed.length) throw new Error('파일에 데이터가 없습니다.');
      setRows(parsed);
      setFileName(file.name);
      setResult(null);
      setTab(0);
      setEditIndex(null);
      setMapping(
        Object.fromEntries(
          Object.keys(parsed[0]).map((key) => [
            key,
            importFields.some(([field]) => field === key) ? key : '',
          ]),
        ),
      );
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : '파일을 읽지 못했습니다.',
      );
    }
  }
  async function save() {
    if (errors.length || !rows.length || busy) return;
    setBusy(true);
    setNotice('');
    try {
      const items = rows.map((row) => {
        const value = mappedRow(row, mapping);
        return {
          ...value,
          pricePerKg: value.pricePerKg ? Number(value.pricePerKg) : null,
        };
      });
      const response = await apiRequest<ImportResult>(
        '/ingredient-master/bulk-import',
        { method: 'POST', body: JSON.stringify({ items }) },
      );
      setResult(response);
      setNotice(
        `${response.succeededCount}개 원료 등록 완료${response.failedCount ? ` · ${response.failedCount}개 등록 실패 (서버 재처리 큐에 보관)` : ''}`,
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : '등록하지 못했습니다. 다시 시도해 주세요.',
      );
    } finally {
      setBusy(false);
    }
  }
  function downloadErrors() {
    const blob = new Blob(
      [
        JSON.stringify(
          result?.failures ??
            errors.map(({ index, row, error }) => ({
              row: index + 2,
              ...row,
              error,
            })),
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'import-errors.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <header className="data-title">
        <div>
          <h1>{titles[tab]}</h1>
          <p>공급업체·시험기관 데이터를 업로드하고 검증합니다.</p>
        </div>
        {tab === 0 && (
          <button
            className="data-primary"
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            업로드
          </button>
        )}
        <input
          ref={input}
          type="file"
          accept=".csv,.json"
          hidden
          onChange={(event) => {
            void readFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </header>
      <nav className="data-tabs" aria-label="데이터 가져오기 단계">
        {['업로드 현황', '데이터 매핑', '검토'].map((label, index) => (
          <button
            key={label}
            aria-current={tab === index ? 'page' : undefined}
            onClick={() => setTab(index)}
          >
            {label}
          </button>
        ))}
      </nav>
      <main className="data-body">
        {notice && <output className="data-notice">{notice}</output>}
        {tab === 0 ? (
          <>
            <h2>업로드 현황</h2>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>파일</th>
                    <th>유형</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {fileName ? (
                    <tr>
                      <th>{fileName}</th>
                      <td>원료 마스터 · {rows.length}행</td>
                      <td>
                        {result
                          ? result.failedCount
                            ? '일부 등록 실패'
                            : '등록 완료'
                          : '매핑 확인 필요'}
                        {!result && (
                          <button
                            className="data-text-button"
                            onClick={() => setTab(1)}
                          >
                            매핑하기 →
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={3} className="data-empty">
                        업로드한 파일이 없습니다.
                        <small>
                          CSV / JSON · 최대 10MB · 현재 화면에서 선택한 파일만
                          표시됩니다.
                        </small>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <h2 className="data-upload-error-title">데이터 형식 오류</h2>
            <section className="data-banner data-upload-errors">
              <div>
                <b>
                  {result?.failures[0]?.errorMessage ??
                    (errors[0]
                      ? `${errors[0].error} (${errors[0].index + 2}행)`
                      : '발견된 데이터 형식 오류가 없습니다.')}
                </b>
                <p>
                  {result?.failedCount
                    ? '등록에 실패한 행은 서버 재처리 큐에 보관됩니다.'
                    : errors.length
                      ? '재처리 전 원본 수정이 필요합니다.'
                      : '파일 업로드 후 검증 결과가 표시됩니다.'}
                </p>
              </div>
              <div className="data-upload-error-actions">
                <button
                  className="data-outline"
                  disabled={busy || !fileName}
                  onClick={() => input.current?.click()}
                >
                  재업로드
                </button>
                <button
                  className="data-outline"
                  disabled
                  title="별도 보류 요청은 현재 지원하지 않습니다. 등록 실패 행은 서버에 자동 보관됩니다."
                >
                  재처리큐에 보류
                </button>
              </div>
            </section>
          </>
        ) : tab === 1 ? (
          <>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>파일 필드</th>
                    <th>샘플 데이터</th>
                    <th>시스템 필드</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(mapping).map((key) => (
                    <tr key={key}>
                      <th>{key}</th>
                      <td>{rows[0]?.[key] || '—'}</td>
                      <td>
                        <select
                          disabled={busy || !!result}
                          aria-label={`${key} 시스템 필드`}
                          value={mapping[key]}
                          onChange={(event) =>
                            setMapping({
                              ...mapping,
                              [key]: event.target.value,
                            })
                          }
                        >
                          <option value="">매핑 안함</option>
                          {importFields.map(([value, label]) => (
                            <option
                              key={value}
                              value={value}
                              disabled={Object.entries(mapping).some(
                                ([source, target]) =>
                                  source !== key && target === value,
                              )}
                            >
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span
                          className={`data-status ${mapping[key] ? 'is-good' : ''}`}
                        >
                          {mapping[key] ? '매핑됨' : '제외됨'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td colSpan={4} className="data-empty">
                        먼저 파일을 업로드해 주세요.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="data-footer">
              <span>매핑하지 않은 필드는 등록 대상에서 제외됩니다.</span>
              <button
                className="data-primary"
                disabled={!rows.length}
                onClick={() => setTab(2)}
              >
                다음: 검토
              </button>
            </div>
          </>
        ) : (
          <>
            <section className="data-banner">
              <div>
                <b>
                  {result
                    ? `등록 완료 ${result.succeededCount}행 · 실패 ${result.failedCount}행`
                    : rows.length
                      ? `총 ${errors.length}개의 행이 오류로 발견되었습니다.`
                      : '검토할 데이터가 없습니다.'}
                </b>
                <p>
                  {errors.length
                    ? '필수 필드 누락, 형식 불일치 등을 확인하고 파일을 수정하거나 행을 수정하세요.'
                    : '원본 내용과 매핑을 확인한 뒤 데이터를 등록해 주세요.'}
                </p>
              </div>
              <button
                className="data-outline"
                disabled={!errors.length && !result?.failedCount}
                onClick={downloadErrors}
              >
                전체 오류 다운로드
              </button>
            </section>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>행 번호</th>
                    <th>원료 ID</th>
                    <th>원료명</th>
                    <th>상태</th>
                    <th>오류 내용</th>
                    <th>수정하기</th>
                  </tr>
                </thead>
                <tbody>
                  {errors.map(({ index, row, error }) => (
                    <tr key={index}>
                      <th>{index + 2}</th>
                      <td>{row.externalId || '—'}</td>
                      <td>{row.name || '—'}</td>
                      <td>
                        <span className="data-status is-error">오류</span>
                      </td>
                      <td>{error}</td>
                      <td>
                        <button
                          className="data-outline data-small"
                          onClick={() => setEditIndex(index)}
                        >
                          수정하기
                        </button>
                      </td>
                    </tr>
                  ))}
                  {result?.failures.map((failure, index) => (
                    <tr key={`server-${index}`}>
                      <td>—</td>
                      <td>{failure.externalId}</td>
                      <td>—</td>
                      <td>
                        <span className="data-status is-error">등록 실패</span>
                      </td>
                      <td colSpan={2}>{failure.errorMessage}</td>
                    </tr>
                  ))}
                  {!errors.length && !result?.failedCount && (
                    <tr>
                      <td colSpan={6} className="data-empty">
                        {rows.length
                          ? '검토할 오류 행이 없습니다.'
                          : '먼저 파일을 업로드해 주세요.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {editIndex !== null && (
              <section className="data-row-editor">
                <h2>{editIndex + 2}행 수정</h2>
                {Object.entries(rows[editIndex]).map(([key, value]) => (
                  <label key={key}>
                    {key}
                    <input
                      value={value}
                      onChange={(event) =>
                        setRows(
                          rows.map((row, index) =>
                            index === editIndex
                              ? { ...row, [key]: event.target.value }
                              : row,
                          ),
                        )
                      }
                    />
                  </label>
                ))}
                <button
                  className="data-outline"
                  onClick={() => setEditIndex(null)}
                >
                  수정 완료
                </button>
              </section>
            )}
            <div className="data-footer">
              <span>확인된 원료 데이터만 서버에 반영됩니다.</span>
              <button
                className="data-outline"
                disabled={busy}
                onClick={() => input.current?.click()}
              >
                재업로드
              </button>
              <button
                className="data-primary"
                disabled={busy || !rows.length || !!errors.length || !!result}
                onClick={() => void save()}
              >
                {busy ? '재처리 중…' : result ? '처리 완료' : '오류 행 재처리'}
              </button>
            </div>
          </>
        )}
      </main>
    </>
  );
}
