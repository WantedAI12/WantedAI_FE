'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { ProjectSidebar } from '@/components/layout/project-sidebar';
import { routes } from '@/lib/routes';
import { projectApi } from '@/lib/api/resources';
import { ApiError, tokenStorage } from '@/lib/api/client';

export function NewProjectWorkspace() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  async function createProject(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) {
      setNotice('프로젝트를 만들려면 로그인해 주세요.');
      return;
    }
    const form = new FormData(event.currentTarget);
    const name = form.get('name');
    const description = form.get('description');
    const dueDate = form.get('dueDate');
    if (typeof name !== 'string' || typeof description !== 'string') return;
    setSaving(true);
    setNotice('');
    try {
      await projectApi.create({
        name: name.trim(),
        description: description.trim(),
        dueDate: typeof dueDate === 'string' ? dueDate || null : null,
      });
      router.push(routes.projects);
    } catch (cause) {
      setNotice(cause instanceof ApiError ? cause.message : '프로젝트 생성에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="wf-layout wf-new-project-page">
      <ProjectSidebar />
      <main className="wf-main">
        <button
          type="button"
          className="wf-new-project-back"
          onClick={() => router.push(routes.projects)}
          aria-label="프로젝트 관리로 돌아가기"
        >
          ‹
        </button>
        <h1>새 프로젝트 만들기</h1>
        <p className="wf-new-project-sub">
          프로젝트 정보를 입력해 주세요. 담당자와 작업 체크리스트는 생성 후 관리할 수 있습니다.
        </p>
        <form
          onSubmit={createProject}
        >
          <p>프로젝트 이름·설명·마감일이 저장됩니다. 이미지 업로드는 아직 지원되지 않습니다.</p>
          <div className="wf-project-image-row">
            <div className="wf-project-image-placeholder">▧</div>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                disabled
                onChange={(event) =>
                  setFileName(event.target.files?.[0]?.name ?? '')
                }
              />
              <button type="button" disabled onClick={() => fileRef.current?.click()}>
                이미지 업로드
              </button>
              <p>
                {fileName || '이미지 없이 생성하면 기본 이미지가 적용됩니다.'}
              </p>
            </div>
          </div>
          <label className="wf-new-project-field">
            프로젝트 이름
            <input name="name" required placeholder="프로젝트 명을 입력해주세요" />
          </label>
          <label className="wf-new-project-field">
            프로젝트 설명
            <input
              name="description"
              required
              placeholder="프로젝트에 대한 간단한 설명을 입력해주세요."
            />
          </label>
          <div className="wf-new-project-bottom">
            <label>
              마감일
              <input name="dueDate" type="date" />
            </label>
          </div>
          <button type="submit" className="wf-new-project-submit" disabled={saving}>
            {saving ? '저장 중...' : '확인'}
          </button>
          {notice && <output role="alert">{notice}</output>}
        </form>
      </main>
    </div>
  );
}
