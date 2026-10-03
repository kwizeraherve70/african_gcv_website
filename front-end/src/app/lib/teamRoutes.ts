import { generatePath } from 'react-router';

const TEAM_ADMIN_ROOT = '/admin/team';

export const TEAM_ADMIN_ROUTES = {
  list: TEAM_ADMIN_ROOT,
  newPerson: `${TEAM_ADMIN_ROOT}/new`,
  editPerson: `${TEAM_ADMIN_ROOT}/:id/edit`,
} as const;

export function teamPersonEditPath(id: string): string {
  return generatePath(TEAM_ADMIN_ROUTES.editPerson, { id: encodeURIComponent(id) });
}
