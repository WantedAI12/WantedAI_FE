'use client';
import {useEffect} from 'react';import {projectApi} from '@/lib/api/resources';import {ProjectSidebar} from '@/components/layout/project-sidebar';
export function ProjectList(){useEffect(()=>{projectApi.list().catch(()=>undefined)},[]);return <div className="wf-layout"><ProjectSidebar/><section className="wf-main"><h1 className="wf-title">조직·프로젝트 관리</h1><p className="wf-sub">테넌트 구성원, 권한, 프로젝트를 관리합니다.</p></section></div>}
