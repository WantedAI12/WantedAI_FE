'use client';
import { useEffect, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
  LoaderCircle,
} from 'lucide-react';
import { projectApi, requestApi } from '@/lib/api/resources';
import type {
  ProjectResponse,
  WorkChecklistItemResponse,
} from '@/types/domain';

type Summary = {
  owner: string;
  checklist: WorkChecklistItemResponse[];
  progress: number | null;
};
const stepLabels: Record<string, string> = {
  FRAGRANCE_BRIEF: '향 콘셉트',
  CANDIDATE_REVIEW: '후보 검토',
  SAFETY_REVIEW: '안전 규제',
  TESTING: '성능 시험',
  SENSORY_EVALUATION: '관능 검증',
  FINAL_CONFIRMATION: '최종 확정',
};
const date = (value: string | null) =>
  value ? value.slice(0, 10).replaceAll('-', '.') : '—';
export function ProjectManagementPanel({
  projects,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  loading = false,
}: {
  projects: ProjectResponse[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onEdit: () => void;
  onDelete: (project: ProjectResponse) => void;
  loading?: boolean;
}) {
  const [summaries, setSummaries] = useState<Record<number, Summary>>({});
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  useEffect(() => {
    let alive = true;
    void Promise.all(
      projects.map(async (project) => {
        const [members, requests] = await Promise.all([
          projectApi.members(project.projectId).catch(() => null),
          requestApi.list(project.projectId).catch(() => null),
        ]);
        const lists = requests
          ? await Promise.all(
              requests.content.map((request) =>
                requestApi.checklist(request.requestId).catch(() => null),
              ),
            )
          : null;
        const checklist = lists?.flatMap((list) => list ?? []) ?? [];
        const complete =
          lists !== null &&
          lists.every((list) => list !== null) &&
          requests?.totalElements === requests?.content.length;
        const summary: Summary = {
          owner: project.assigneeMemberId
            ? (members?.find(
                (member) => member.memberId === project.assigneeMemberId,
              )?.name ?? '확인 불가')
            : '미지정',
          checklist,
          progress: complete
            ? checklist.length
              ? Math.round(
                  (checklist.filter((item) => item.completed).length /
                    checklist.length) *
                    100,
                )
              : 0
            : null,
        };
        if (alive)
          setSummaries((current) => ({
            ...current,
            [project.projectId]: summary,
          }));
      }),
    );
    return () => {
      alive = false;
    };
  }, [projects]);
  const filtered = projects.filter((project) =>
    `${project.name} ${summaries[project.projectId]?.owner ?? ''}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 7));
  const currentPage = Math.min(page, pages - 1);
  const selected = projects.find((project) => project.projectId === selectedId);
  const summary = selected ? summaries[selected.projectId] : undefined;
  return (
    <div className="pm-grid">
      <section className="pm-list">
        <h2>진행 중인 프로젝트</h2>
        <label className="pm-search">
          <Search size={15} />
          <input
            aria-label="프로젝트명이나 담당자명으로 검색"
            placeholder="프로젝트명이나 담당자명으로 검색"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
          />
        </label>
        <div className="pm-table">
          <div className="pm-table-head">
            <span>프로젝트명</span>
            <span>담당자</span>
            <span>진행률</span>
            <span>마감일</span>
          </div>
          {filtered
            .slice(currentPage * 7, currentPage * 7 + 7)
            .map((project) => (
              <button
                type="button"
                className={`pm-row ${selectedId === project.projectId ? 'active' : ''}`}
                aria-pressed={selectedId === project.projectId}
                key={project.projectId}
                onClick={() => onSelect(project.projectId)}
              >
                <span className="pm-name">
                  <i aria-hidden="true" />
                  <span>
                    <b>{project.name}</b>
                    <small>{project.description || '설명 없음'}</small>
                  </span>
                </span>
                <span className="pm-owner">
                  <i aria-hidden="true" />
                  {summaries[project.projectId]?.owner ?? '조회 중'}
                </span>
                <span className="pm-progress">
                  <progress
                    max={100}
                    value={summaries[project.projectId]?.progress ?? 0}
                    aria-label={`${project.name} 체크리스트 진행률`}
                  />
                  <span>
                    {summaries[project.projectId]?.progress == null
                      ? '—'
                      : `${summaries[project.projectId].progress}%`}
                  </span>
                </span>
                <time>{date(project.dueDate)}</time>
              </button>
            ))}
        </div>
        {!filtered.length && (
          <div className="pm-empty">
            {loading
              ? '프로젝트를 불러오는 중입니다.'
              : query
                ? '검색 결과가 없습니다.'
                : '프로젝트가 생성되지 않았습니다.'}
          </div>
        )}
        <nav className="pm-pagination" aria-label="프로젝트 목록 페이지">
          <button
            aria-label="이전 페이지"
            disabled={!currentPage}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span>{currentPage + 1}</span>
          <button
            aria-label="다음 페이지"
            disabled={currentPage + 1 >= pages}
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      </section>
      <aside
        className="pm-detail"
        aria-busy={loading || (!!selected && !summary)}
      >
        {loading ? (
          <div className="pm-empty">
            <LoaderCircle
              className="pm-spinner"
              size={56}
              aria-label="프로젝트 조회 중"
            />
          </div>
        ) : selected ? (
          <>
            <header>
              <div>
                <h2>{selected.name}</h2>
                <div className="pm-actions">
                  <button onClick={onEdit}>
                    <Pencil size={13} />
                    수정
                  </button>
                  {['ORG_ADMIN', 'PROJECT_MANAGER'].includes(
                    selected.myRole,
                  ) && <button onClick={() => onDelete(selected)}>삭제</button>}
                </div>
              </div>
              <p>
                {date(selected.startDate || selected.createdAt)}~{date(selected.dueDate)}
                <span>담당자: {summary?.owner ?? '조회 중'}</span>
              </p>
            </header>
            {!summary ? (
              <div className="pm-empty">
                <LoaderCircle
                  className="pm-spinner"
                  size={48}
                  aria-label="진행률 조회 중"
                />
              </div>
            ) : (
              <div className="pm-detail-body">
                <div className="pm-steps">
                  {Object.entries(stepLabels).map(([key, label]) => {
                    const items = summary.checklist.filter(
                      (item) => item.itemType === key,
                    );
                    const done =
                      items.length > 0 && items.every((item) => item.completed);
                    return (
                      <div key={key}>
                        <i className={done ? 'done' : ''}>
                          {done && <Check size={18} />}
                        </i>
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="pm-progress pm-total">
                  <progress
                    max={100}
                    value={summary.progress ?? 0}
                    aria-label="전체 체크리스트 진행률"
                  />
                  <span>
                    {summary.progress == null ? '—' : `${summary.progress}%`}
                  </span>
                </div>
                <small className="pm-progress-note">
                  향 요청 작업 체크리스트 완료율
                </small>
                <h3>프로젝트 정보</h3>
                <dl>
                  <div>
                    <dt>프로젝트명</dt>
                    <dd>{selected.name}</dd>
                  </div>
                  <div>
                    <dt>담당자</dt>
                    <dd>{summary.owner}</dd>
                  </div>
                  <div>
                    <dt>참여 멤버</dt>
                    <dd>{selected.memberCount}명</dd>
                  </div>
                  <div>
                    <dt>시작일</dt>
                    <dd>{date(selected.startDate || selected.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>설명</dt>
                    <dd>{selected.description || '설명 없음'}</dd>
                  </div>
                </dl>
                <h3>마감 일정</h3>
                <p className="pm-deadline">
                  <span>프로젝트 마감</span>
                  <time>{date(selected.dueDate)}</time>
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="pm-empty">프로젝트를 선택해 주세요.</div>
        )}
      </aside>
    </div>
  );
}
