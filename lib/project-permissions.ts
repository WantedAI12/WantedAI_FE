export function canUpdateProject(project: { myRole: string; memberCount: number } | null | undefined): boolean {
  return Boolean(project && (
    project.memberCount === 1 ||
    ['ORG_ADMIN', 'PROJECT_MANAGER'].includes(project.myRole)
  ));
}

// UI visibility policy. The delete API remains the final permission check.
export function canRequestProjectDeletion(project: { myRole: string; memberCount: number } | null | undefined): boolean {
  return Boolean(project && (
    project.memberCount === 1 ||
    ['ORG_ADMIN', 'PROJECT_MANAGER'].includes(project.myRole)
  ));
}
