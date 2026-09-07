'use client';
import {useEffect} from 'react';import {projectApi} from '@/lib/api/resources';
export function ProjectList(){useEffect(()=>{projectApi.list().catch(()=>undefined)},[]);return <div className="wf-layout"><aside className="wf-rail"/><section className="wf-main"><h1 className="wf-title">조직·프로젝트 관리</h1><p className="wf-sub">테넌트 구성원, 권한, 프로젝트를 관리합니다.</p></section></div>}
