export type ProjectStatus = 'DRAFT' | 'STRUCTURING' | 'GENERATING' | 'REVIEWING' | 'VALIDATING' | 'COMPLETED';
export interface Project { id: string; name: string; brief: string; status: ProjectStatus; progress: number; updatedAt: string; }
export interface ScentRequest { id: string; projectId: string; concept: string; productType: string; constraints: string[]; }
export interface Formula { id: string; projectId: string; version: number; status: 'CANDIDATE' | 'SAFE' | 'REJECTED' | 'APPROVED'; }
export interface Ingredient { id: string; name: string; olfactiveFamily: string; available: boolean; }
