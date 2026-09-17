'use client';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import { ProjectSidebar } from '@/components/layout/project-sidebar';
import { projectApi } from '@/lib/api/resources';
import type {
  ProjectMemberResponse,
  ProjectResponse,
  Role,
} from '@/types/domain';

const roleLabels: Record<Role, string> = {
  ORG_ADMIN: '조직 관리자',
  PROJECT_MANAGER: '프로젝트 관리자',
  PERFUMER: '조향사',
  FRAGRANCE_RND: '향 연구원',
  PRODUCT_BRAND: '제품 담당자',
  SENSORY_SCIENTIST: '관능 평가자',
  SAFETY_REVIEWER: '안전 검토자',
  SUPPLIER: '공급업체',
  AUDITOR: '감사자',
};
const groups: { name: string; roles: Role[] }[] = [
  {
    name: '기획·운영',
    roles: ['ORG_ADMIN', 'PROJECT_MANAGER', 'PRODUCT_BRAND'],
  },
  { name: '조향·연구', roles: ['PERFUMER', 'FRAGRANCE_RND'] },
  { name: '검증·안전', roles: ['SENSORY_SCIENTIST', 'SAFETY_REVIEWER'] },
  { name: '공급·감사', roles: ['SUPPLIER', 'AUDITOR'] },
];
type Person = {
  member: ProjectMemberResponse;
  assignments: { project: ProjectResponse; member: ProjectMemberResponse }[];
};

export function OrganizationDirectory() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [group, setGroup] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [inviteOpen, setInviteOpen] = useState(false);
  useEffect(() => {
    let alive = true;
    projectApi
      .list()
      .then(async (projects) => {
        const results = await Promise.all(
          projects.map(async (project) => ({
            project,
            members: await projectApi
              .members(project.projectId)
              .catch(() => null),
          })),
        );
        if (!alive) return;
        const map = new Map<number, Person>();
        for (const { project, members } of results)
          for (const member of members ?? []) {
            const person = map.get(member.memberId) ?? {
              member,
              assignments: [],
            };
            person.assignments.push({ project, member });
            map.set(member.memberId, person);
          }
        setProjects(projects);
        setPeople([...map.values()]);
        setError(
          results.some((result) => result.members === null)
            ? '일부 프로젝트의 멤버를 조회하지 못했습니다. 조회 가능한 멤버만 표시합니다.'
            : '',
        );
      })
      .catch(() => {
        if (alive)
          setError('멤버 정보를 불러오지 못했습니다. 다시 시도해 주세요.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reload]);
  const inGroup = (person: Person, name: string) =>
    person.assignments.some(({ member }) =>
      groups.find((group) => group.name === name)?.roles.includes(member.role),
    );
  const filtered = people.filter(
    (person) =>
      (!group || inGroup(person, group)) &&
      `${person.member.name} ${person.member.email}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const selected =
    filtered.find((person) => person.member.memberId === selectedId) ??
    filtered[0];
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, pageCount - 1);
  function chooseGroup(name: string | null) {
    setGroup(name);
    setPage(0);
    setSelectedId(null);
    setQuery('');
  }
  return (
    <div className="wf-layout wf-org-page directory-page">
      <ProjectSidebar />
      <section className="wf-main">
        <header className="directory-hero">
          {group && (
            <button
              className="directory-back"
              onClick={() => chooseGroup(null)}
            >
              <ArrowLeft size={18} />
              조직 관리 <ChevronRight size={14} />
              {group}
            </button>
          )}
          <h1>{group ?? '조직 관리'}</h1>
          <p>
            {group
              ? '역할별 멤버와 참여 프로젝트를 확인할 수 있습니다.'
              : '멤버 구성과 프로젝트별 역할을 확인할 수 있습니다.'}
          </p>
          {group && (
            <span className="directory-group-count">
              총 {people.filter((person) => inGroup(person, group)).length}명
            </span>
          )}
          <button
            className="directory-invite"
            disabled={loading || !projects.length}
            onClick={() => setInviteOpen(true)}
          >
            멤버 초대
          </button>
        </header>
        <main className="directory-content">
          {error && (
            <div className="directory-notice">
              <span>{error}</span>
              <button
                onClick={() => {
                  setLoading(true);
                  setReload(reload + 1);
                }}
              >
                다시 조회
              </button>
            </div>
          )}
          {!group && (
            <>
              <div className="directory-groups">
                {groups.map((item) => {
                  const members = people.filter((person) =>
                    inGroup(person, item.name),
                  );
                  return (
                    <button
                      key={item.name}
                      onClick={() => chooseGroup(item.name)}
                    >
                      <UserRound size={20} />
                      <div>
                        <b>{item.name}</b>
                        <span>
                          {loading ? '조회 중' : `${members.length}명`}
                        </span>
                        <div
                          className="directory-avatar-stack"
                          aria-hidden="true"
                        >
                          {members.slice(0, 5).map((person) => (
                            <i key={person.member.memberId}>
                              {person.member.name.slice(0, 1)}
                            </i>
                          ))}
                          {members.length > 5 && <i>+{members.length - 5}</i>}
                        </div>
                      </div>
                      <ChevronRight size={18} />
                    </button>
                  );
                })}
              </div>
              <p className="directory-scope">
                접근 가능한 프로젝트의 멤버를 역할별로 묶었습니다. 여러 역할을
                가진 멤버는 중복 포함됩니다.
              </p>
            </>
          )}
          <div className="directory-grid">
            <section className="directory-list">
              <h2>{group ? '멤버 목록' : '전체 멤버'}</h2>
              <label className="directory-search">
                <Search size={15} />
                <input
                  aria-label="멤버 이름 또는 이메일 검색"
                  placeholder="멤버 이름 또는 이메일 검색"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(0);
                  }}
                />
              </label>
              <div className="directory-table">
                <div className="directory-table-head">
                  <span>이름</span>
                  <span>이메일</span>
                  <span>역할</span>
                  <span>프로젝트</span>
                </div>
                {filtered
                  .slice(currentPage * 10, currentPage * 10 + 10)
                  .map((person) => (
                    <button
                      key={person.member.memberId}
                      className={`directory-row ${selected?.member.memberId === person.member.memberId ? 'active' : ''}`}
                      aria-pressed={
                        selected?.member.memberId === person.member.memberId
                      }
                      onClick={() => setSelectedId(person.member.memberId)}
                    >
                      <span className="directory-name">
                        <i aria-hidden="true">
                          {person.member.name.slice(0, 1)}
                        </i>
                        <b>{person.member.name}</b>
                      </span>
                      <span className="directory-email">
                        {person.member.email}
                      </span>
                      <span>
                        {[
                          ...new Set(
                            person.assignments.map(
                              ({ member }) => roleLabels[member.role],
                            ),
                          ),
                        ].join(' · ')}
                      </span>
                      <span>{person.assignments.length}개</span>
                    </button>
                  ))}
              </div>
              {(loading || !filtered.length) && (
                <div className="directory-empty">
                  {loading
                    ? '멤버 정보를 불러오는 중입니다.'
                    : query
                      ? '검색 결과가 없습니다.'
                      : '표시할 멤버가 없습니다.'}
                </div>
              )}
              <nav
                className="directory-pagination"
                aria-label="멤버 목록 페이지"
              >
                <button
                  disabled={!currentPage}
                  aria-label="이전 페이지"
                  onClick={() => setPage(currentPage - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <span>{currentPage + 1}</span>
                <button
                  disabled={currentPage + 1 >= pageCount}
                  aria-label="다음 페이지"
                  onClick={() => setPage(currentPage + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            </section>
            <aside className="directory-detail">
              {selected ? (
                <>
                  <header>
                    <i aria-hidden="true">{selected.member.name.slice(0, 1)}</i>
                    <div>
                      <h2>{selected.member.name}</h2>
                      <p>{selected.member.email}</p>
                    </div>
                  </header>
                  <div className="directory-stats">
                    <div>
                      <span>참여 프로젝트</span>
                      <strong>{selected.assignments.length}개</strong>
                    </div>
                    <div>
                      <span>프로젝트 역할</span>
                      <strong>
                        {
                          new Set(
                            selected.assignments.map(
                              ({ member }) => member.role,
                            ),
                          ).size
                        }
                        개
                      </strong>
                    </div>
                  </div>
                  <h3>상세 정보</h3>
                  <dl>
                    <div>
                      <dt>이름</dt>
                      <dd>{selected.member.name}</dd>
                    </div>
                    <div>
                      <dt>이메일</dt>
                      <dd>{selected.member.email}</dd>
                    </div>
                  </dl>
                  <h3>참여 프로젝트</h3>
                  <ul className="directory-assignments">
                    {selected.assignments.map(({ project, member }) => (
                      <li key={project.projectId}>
                        <b>{project.name}</b>
                        <span>{roleLabels[member.role]}</span>
                        <small>
                          참여일{' '}
                          {member.joinedAt?.slice(0, 10).replaceAll('-', '.') ||
                            '미등록'}
                        </small>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="directory-empty">멤버를 선택해 주세요.</div>
              )}
            </aside>
          </div>
        </main>
      </section>
      {inviteOpen && (
        <MemberInviteDialog
          projects={projects}
          onClose={() => setInviteOpen(false)}
          onSaved={() => {
            setInviteOpen(false);
            setReload(reload + 1);
          }}
        />
      )}
    </div>
  );
}

function MemberInviteDialog({
  projects,
  onClose,
  onSaved,
}: {
  projects: ProjectResponse[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [projectId, setProjectId] = useState(
    String(projects[0]?.projectId ?? ''),
  );
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('PERFUMER');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current?.showModal();
    return () => {
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  async function submit() {
    if (busy || !projectId || !email.trim()) return;
    setBusy(true);
    setError('');
    try {
      await projectApi.invite(Number(projectId), email.trim(), role);
      onSaved();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : '멤버를 추가하지 못했습니다.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="directory-invite-dialog"
      aria-labelledby="directory-invite-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <button
          type="button"
          className="directory-dialog-close"
          aria-label="닫기"
          disabled={busy}
          onClick={onClose}
        >
          <X size={26} />
        </button>
        <h2 id="directory-invite-title">멤버 초대</h2>
        <p>이메일로 가입된 멤버를 프로젝트에 추가할 수 있습니다.</p>
        <fieldset disabled={busy}>
          <label>
            프로젝트 선택
            <select
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              required
            >
              {projects.map((project) => (
                <option key={project.projectId} value={project.projectId}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            이메일 주소
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="이메일 주소를 입력해 주세요."
            />
          </label>
          <label>
            역할 선택
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
            >
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
        <div className="directory-invite-note">
          현재는 초대 메일 발송 없이 프로젝트에 바로 추가됩니다. 초대 메시지와
          수락 절차는 지원하지 않습니다.
        </div>
        {error && (
          <p className="directory-invite-error" role="alert">
            {error}
          </p>
        )}
        <footer>
          <button type="button" disabled={busy} onClick={onClose}>
            취소
          </button>
          <button type="submit" disabled={busy || !projectId}>
            {busy ? '추가 중…' : '멤버 추가'}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
