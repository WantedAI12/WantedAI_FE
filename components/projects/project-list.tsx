'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, FolderKanban, LoaderCircle, Plus } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { projectApi } from '@/lib/api/resources';
import type { ProjectResponse } from '@/types/domain';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function ProjectList() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    projectApi
      .list()
      .then(setProjects)
      .catch((cause) =>
        setError(
          cause instanceof ApiError
            ? cause.message
            : '프로젝트를 불러오지 못했습니다.',
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">프로젝트</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            `GET /api/v1/projects` 응답과 연결된 목록입니다.
          </p>
        </div>
        <Button disabled className="rounded-xl">
          <Plus className="size-4" />
          프로젝트 만들기
        </Button>
      </div>
      {loading && (
        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          백엔드에서 프로젝트를 불러오는 중입니다.
        </div>
      )}
      {error && (
        <Alert variant="destructive" className="mt-8">
          <AlertCircle />
          <AlertTitle>API 연결 실패</AlertTitle>
          <AlertDescription>
            {error} 로그인 전이라면{' '}
            <Link href="/login" className="font-medium underline">
              로그인 화면
            </Link>
            에서 토큰을 발급받아 주세요.
          </AlertDescription>
        </Alert>
      )}
      {!loading && !error && projects.length === 0 && (
        <section className="mt-8 grid min-h-[360px] place-items-center rounded-2xl border border-dashed bg-card/55 p-8 text-center">
          <div>
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
              <FolderKanban className="size-6" />
            </div>
            <h2 className="mt-5 font-semibold">프로젝트가 없습니다</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              백엔드에서 첫 프로젝트를 생성하면 여기에 표시됩니다.
            </p>
          </div>
        </section>
      )}
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.projectId}
            className="rounded-2xl border bg-card p-5"
          >
            <p className="text-xs font-medium text-primary">
              PROJECT #{project.projectId}
            </p>
            <h2 className="mt-2 text-lg font-semibold">{project.name}</h2>
            <p className="mt-2 min-h-10 text-sm leading-5 text-muted-foreground">
              {project.description || '설명이 없습니다.'}
            </p>
            <p className="mt-5 text-xs text-muted-foreground">
              {new Date(project.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
