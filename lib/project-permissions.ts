export function canUpdateProject(project: { myRole: string; memberCount: number } | null | undefined): boolean {
  return Boolean(project && (
    project.memberCount === 1 ||
    ['ORG_ADMIN', 'PROJECT_MANAGER'].includes(project.myRole)
  ));
}
