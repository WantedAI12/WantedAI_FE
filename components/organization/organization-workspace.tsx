'use client';

import Link from '@/components/ui/app-link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProjectSidebar } from '@/components/layout/project-sidebar';
import { projectApi, requestApi } from '@/lib/api/resources';
import { routes } from '@/lib/routes';
import type { FragranceRequestResponse, ProjectMemberResponse, ProjectResponse, Role, WorkChecklistItemResponse, WorkChecklistItemType } from '@/types/domain';

const roles: { value: Role; label: string }[] = [
  { value: 'ORG_ADMIN', label: '조직 관리자' },
  { value: 'PROJECT_MANAGER', label: '프로젝트 관리자' },
  { value: 'PERFUMER', label: '조향사' },
  { value: 'FRAGRANCE_RND', label: '향 연구원' },
  { value: 'PRODUCT_BRAND', label: '제품 담당자' },
  { value: 'SENSORY_SCIENTIST', label: '관능 평가자' },
  { value: 'SAFETY_REVIEWER', label: '안전 검토자' },
  { value: 'SUPPLIER', label: '공급업체' },
  { value: 'AUDITOR', label: '감사자' },
];
const checklistLabels: Record<WorkChecklistItemType, string> = {
  FRAGRANCE_BRIEF: '향 콘셉트 정의',
  CANDIDATE_REVIEW: '후보 조향식 검토',
  SAFETY_REVIEW: '안전 규제 검토',
  TESTING: '성능 시험',
  SENSORY_EVALUATION: '관능 검증',
  FINAL_CONFIRMATION: '최종 조향식 확정',
};

export function OrganizationWorkspace({ forcedView }: { forcedView?: 'overview' | 'members' | 'team' | 'projects' | 'formulas' } = {}) {
  const params = useSearchParams();
  const view = forcedView ?? params.get('view') ?? 'overview';
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [members, setMembers] = useState<ProjectMemberResponse[]>([]);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('PERFUMER');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDue, setEditDue] = useState('');
  const [editAssigneeId, setEditAssigneeId] = useState('');
  const [editRequests, setEditRequests] = useState<FragranceRequestResponse[]>([]);
  const [editRequestId, setEditRequestId] = useState<number | null>(null);
  const [editChecklist, setEditChecklist] = useState<WorkChecklistItemResponse[]>([]);
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [checklistSaving, setChecklistSaving] = useState<WorkChecklistItemType | null>(null);

  async function refreshProjects() {
    try {
      const items = await projectApi.list();
      setProjects(items);
      setSelectedId((previous) => previous && items.some((item) => item.projectId === previous) ? previous : items[0]?.projectId ?? null);
    } catch (error) { setNotice(error instanceof Error ? error.message : '프로젝트를 불러오지 못했습니다.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { queueMicrotask(() => { void refreshProjects(); }); }, []);
  useEffect(() => {
    if (!selectedId) return;
    let alive = true;
    projectApi.members(selectedId).then((items) => { if (alive) setMembers(items); })
      .catch((error: unknown) => { if (alive) setNotice(error instanceof Error ? error.message : '멤버를 불러오지 못했습니다.'); });
    return () => { alive = false; };
  }, [selectedId]);
  useEffect(() => {
    if (!editOpen || !selectedId) return;
    let alive = true;
    requestApi.list(selectedId).then((page) => {
      if (!alive) return;
      setEditRequests(page.content);
      setEditRequestId(page.content[0]?.requestId ?? null);
    }).catch((error: unknown) => {
      if (alive) setEditError(error instanceof Error ? error.message : '향 요청을 불러오지 못했습니다.');
    });
    return () => { alive = false; };
  }, [editOpen, selectedId]);
  useEffect(() => {
    if (!editOpen || !editRequestId) return;
    let alive = true;
    requestApi.checklist(editRequestId).then((items) => { if (alive) setEditChecklist(items); })
      .catch((error: unknown) => { if (alive) setEditError(error instanceof Error ? error.message : '체크리스트를 불러오지 못했습니다.'); });
    return () => { alive = false; };
  }, [editOpen, editRequestId]);

  const selected = projects.find((item) => item.projectId === selectedId);
  const filteredProjects = projects.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  const filteredMembers = members.filter((item) => `${item.name} ${item.email}`.toLowerCase().includes(search.toLowerCase()));
  const isMembers = view === 'members' || view === 'team';
  const isProjects = view === 'projects';
  const isFormulas = view === 'formulas';

  async function invite() {
    if (!selectedId) return;
    try {
      await projectApi.invite(selectedId, email, role);
      setMembers(await projectApi.members(selectedId));
      setNotice(`${email} 멤버가 프로젝트에 추가됐습니다.`);
      setInviteOpen(false);
      setEmail('');
    } catch (error) { setNotice(error instanceof Error ? error.message : '멤버를 추가하지 못했습니다.'); }
  }

  function startEdit() {
    if (!selected) return;
    setEditName(selected.name);
    setEditDescription(selected.description ?? '');
    setEditDue(selected.dueDate ?? '');
    setEditAssigneeId(selected.assigneeMemberId?.toString() ?? '');
    setEditRequests([]);
    setEditRequestId(null);
    setEditChecklist([]);
    setEditError('');
    setEditOpen(true);
  }
  async function saveEdit() {
    if (!selectedId || !editName.trim()) return;
    setEditSaving(true);
    setEditError('');
    try {
      await projectApi.update(selectedId, { name: editName.trim(), description: editDescription.trim() || null, dueDate: editDue || null, ...(editAssigneeId ? { assigneeMemberId: Number(editAssigneeId) } : {}) });
      await refreshProjects();
      setEditOpen(false);
      setNotice('프로젝트 정보가 저장됐습니다.');
    } catch (error) { setEditError(error instanceof Error ? error.message : '프로젝트 저장에 실패했습니다.'); }
    finally { setEditSaving(false); }
  }
  async function toggleChecklist(item: WorkChecklistItemResponse) {
    if (!editRequestId) return;
    setChecklistSaving(item.itemType);
    setEditError('');
    try {
      const updated = await requestApi.setChecklistCompleted(editRequestId, item.itemType, !item.completed, item.revision);
      setEditChecklist((items) => items.map((current) => current.itemType === updated.itemType ? updated : current));
    } catch (error) {
      setEditError(error instanceof Error ? error.message : '체크리스트를 저장하지 못했습니다.');
      try { setEditChecklist(await requestApi.checklist(editRequestId)); } catch { /* Keep the last visible state. */ }
    } finally { setChecklistSaving(null); }
  }

  return <div className="wf-layout wf-org-page"><ProjectSidebar /><section className="wf-main">
    <header className="wf-org-header"><h1>{isMembers ? '프로젝트 멤버' : isProjects ? '프로젝트 관리' : isFormulas ? '조향식 관리' : '조직·프로젝트 관리'}</h1><p>{isMembers ? '선택한 프로젝트에 참여하는 멤버를 확인합니다.' : '서버에 등록된 프로젝트와 멤버 정보를 확인합니다.'}</p>{isMembers ? <button type="button" onClick={() => setInviteOpen(true)} disabled={!selectedId}>+ 멤버 추가</button> : <Link className="wf-org-action" href={routes.newProject}>+ 새 프로젝트</Link>}</header>
    <div className="wf-org-content">{notice && <output>{notice}</output>}{loading ? <p>프로젝트를 불러오는 중입니다.</p> : <>
      {view === 'overview' && <><div className="wf-org-summary"><Link href="/organization?view=projects"><b>전체 프로젝트</b><strong>{projects.length}</strong><span>참여 중인 프로젝트</span></Link><Link href="/organization/members"><b>프로젝트 멤버</b><strong>{members.length}</strong><span>{selected?.name ?? '프로젝트 선택 필요'}</span></Link><Link href="/formulas"><b>후보 조향식</b><strong>↗</strong><span>실제 후보 목록 보기</span></Link></div><section className="wf-project-list"><div className="wf-org-section-head"><h2>프로젝트 목록</h2><Link href="/organization?view=projects">전체 보기 ›</Link></div>{projects.length ? projects.map((project) => <button type="button" className="wf-org-live-row" key={project.projectId} onClick={() => setSelectedId(project.projectId)}><b>{project.name}</b><span>{project.description || '설명 없음'}</span><span>멤버 {project.memberCount}명</span><time>{project.dueDate || '마감일 없음'}</time></button>) : <p>등록된 프로젝트가 없습니다.</p>}</section></>}
      {(isMembers || isProjects || isFormulas) && <label className="wf-org-project-select">프로젝트 <select value={selectedId ?? ''} onChange={(event) => { setSelectedId(Number(event.target.value) || null); setSearch(''); }}><option value="">프로젝트 선택</option>{projects.map((project) => <option key={project.projectId} value={project.projectId}>{project.name}</option>)}</select></label>}
      {isMembers && <div className="wf-member-grid"><div className="wf-member-list"><h2>멤버 목록</h2><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="이름 또는 이메일 검색" /><div className="wf-member-head"><b>이름</b><b>이메일</b><b>역할</b><b>참여일</b></div>{filteredMembers.length ? filteredMembers.map((member) => <div className="wf-org-member-row" key={member.memberId}><b>{member.name}</b><span>{member.email}</span><span>{roles.find((item) => item.value === member.role)?.label || member.role}</span><time>{member.joinedAt?.slice(0, 10) || '—'}</time></div>) : <p>표시할 멤버가 없습니다.</p>}</div><aside className="wf-member-detail"><h2>{selected?.name || '프로젝트 선택'}</h2><p>등록된 멤버 {members.length}명</p><p>이 화면은 프로젝트별 멤버를 표시합니다. 백엔드에는 조직 전체 팀 목록 API가 없습니다.</p></aside></div>}
      {isProjects && <div className="wf-project-management"><div className="wf-managed-projects"><h2>프로젝트 목록</h2><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="프로젝트 검색" /><div className="wf-managed-project-head"><b>프로젝트명</b><b>멤버</b><b>시작일</b><b>마감일</b></div>{filteredProjects.length ? filteredProjects.map((project) => <button type="button" className={selectedId === project.projectId ? 'active' : ''} key={project.projectId} onClick={() => setSelectedId(project.projectId)}><b>{project.name}</b><span>{project.memberCount}명</span><span>{project.startDate || '—'}</span><span>{project.dueDate || '—'}</span></button>) : <p>등록된 프로젝트가 없습니다.</p>}</div><aside className="wf-project-detail is-live"><header><h2>{selected?.name || '프로젝트 선택'}</h2>{selected && <button type="button" onClick={startEdit}>수정</button>}<p>{selected?.description || '설명 없음'}</p></header>{selected && <div className="wf-project-info"><p><b>프로젝트 ID</b><span>{selected.projectId}</span></p><p><b>참여 멤버</b><span>{selected.memberCount}명</span></p><p><b>시작일</b><span>{selected.startDate || '정보 없음'}</span></p><p><b>마감일</b><span>{selected.dueDate || '정보 없음'}</span></p><p><b>내 역할</b><span>{selected.myRole}</span></p></div>}</aside></div>}
      {isFormulas && <section className="wf-formula-list"><h2>조향식 관리</h2><p>후보 목록은 향 요청별로 조회할 수 있습니다.</p><Link href="/formulas">후보 조향식 목록으로 이동 →</Link></section>}
    </>}</div>
  </section>
  {inviteOpen && <div className="wf-invite-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setInviteOpen(false); }}><form className="wf-invite-modal" onSubmit={(event) => { event.preventDefault(); void invite(); }}><button type="button" className="wf-invite-close" onClick={() => setInviteOpen(false)} aria-label="닫기">×</button><h2>멤버 초대</h2><p>{selected?.name || '프로젝트'}에 멤버를 추가합니다.</p><label><span>이메일 주소</span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="이메일 주소" /></label><label><span>역할 선택</span><select value={role} onChange={(event) => setRole(event.target.value as Role)}>{roles.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label><p>서버의 프로젝트 멤버 추가 API를 사용합니다. 초대 메일·수락 절차는 제공되지 않습니다.</p><footer><button type="button" onClick={() => setInviteOpen(false)}>취소</button><button type="submit">추가하기</button></footer></form></div>}
  {editOpen && <div className="wf-project-modal-backdrop"><form className="wf-project-modal" onSubmit={(event) => { event.preventDefault(); void saveEdit(); }}><button type="button" className="wf-project-modal-close" onClick={() => setEditOpen(false)} aria-label="닫기">×</button><h2>프로젝트 정보 수정</h2><label>프로젝트 명<input required value={editName} onChange={(event) => setEditName(event.target.value)} /></label><label>프로젝트 설명<textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} /></label><label>마감일<input type="date" value={editDue} onChange={(event) => setEditDue(event.target.value)} /></label><label>담당자<select value={editAssigneeId} onChange={(event) => setEditAssigneeId(event.target.value)}><option value="" disabled>담당자를 선택해 주세요</option>{members.map((member) => <option key={member.memberId} value={member.memberId}>{member.name} ({member.email})</option>)}</select></label><section className="wf-project-edit-checklist"><h3>작업 체크리스트</h3><p>향 요청을 선택해 완료 상태를 관리합니다. 변경 시 바로 저장됩니다.</p>{editRequests.length ? <><label>향 요청<select value={editRequestId ?? ''} onChange={(event) => { setEditRequestId(Number(event.target.value) || null); setEditChecklist([]); }}><option value="" disabled>향 요청 선택</option>{editRequests.map((request) => <option key={request.requestId} value={request.requestId}>#{request.requestId} {request.structuredIntent.rawText.slice(0, 36)}</option>)}</select></label><div className="wf-project-edit-checklist-items">{editChecklist.map((item) => <label key={item.itemType}><input type="checkbox" checked={item.completed} disabled={checklistSaving !== null} onChange={() => void toggleChecklist(item)} />{checklistLabels[item.itemType]}</label>)}</div></> : <p>아직 이 프로젝트에 향 요청이 없습니다. 향 요청을 만들면 체크리스트가 생성됩니다.</p>}</section>{editError && <p className="wf-project-edit-error" role="alert">{editError}</p>}<footer><button type="button" onClick={() => setEditOpen(false)}>취소</button><button type="submit" disabled={editSaving}>{editSaving ? '저장 중...' : '확인'}</button></footer></form></div>}
  </div>;
}
