'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { ProjectSidebar } from '@/components/layout/project-sidebar';

const checklist = [
  '향 콘셉트 정의',
  '후보 조향식 검토',
  '안전 규제 검토',
  '성능 시험',
  '관능 검증',
  '최종 조향식 확정',
];

export function NewProjectWorkspace() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [notice, setNotice] = useState('');

  return (
    <div className="wf-layout wf-new-project-page">
      <ProjectSidebar />
      <main className="wf-main">
        <button
          type="button"
          className="wf-new-project-back"
          onClick={() => router.push('/organization?view=projects')}
          aria-label="프로젝트 관리로 돌아가기"
        >
          ‹
        </button>
        <h1>새 프로젝트 만들기</h1>
        <p className="wf-new-project-sub">
          프로젝트 정보를 입력하고 체크리스트를 설정해보세요.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setNotice('프로젝트가 생성되었습니다.');
          }}
        >
          <div className="wf-project-image-row">
            <div className="wf-project-image-placeholder">▧</div>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setFileName(event.target.files?.[0]?.name ?? '')
                }
              />
              <button type="button" onClick={() => fileRef.current?.click()}>
                이미지 업로드
              </button>
              <p>
                {fileName || '이미지 없이 생성하면 기본 이미지가 적용됩니다.'}
              </p>
            </div>
          </div>
          <label className="wf-new-project-field">
            프로젝트 이름
            <input required placeholder="프로젝트 명을 입력해주세요" />
          </label>
          <label className="wf-new-project-field">
            프로젝트 설명
            <input
              required
              placeholder="프로젝트에 대한 간단한 설명을 입력해주세요."
            />
          </label>
          <fieldset className="wf-new-project-checklist">
            <legend>체크 리스트 설정</legend>
            <div>
              {checklist.map((item) => (
                <label key={item}>
                  <input type="checkbox" />
                  {item}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="wf-new-project-bottom">
            <label>
              마감일
              <input type="date" required />
            </label>
            <label>
              담당자
              <select required defaultValue="">
                <option value="" disabled>
                  담당자를 선택해주세요
                </option>
                <option>김멋사</option>
                <option>박서연</option>
              </select>
            </label>
          </div>
          <button type="submit" className="wf-new-project-submit">
            확인
          </button>
          {notice && <output>{notice}</output>}
        </form>
      </main>
    </div>
  );
}
