import lowerCase from 'lodash/lowerCase';
import startCase from 'lodash/startCase';

export const getRoleDisplayName = (role: Pick<AuthorizedRole, 'name' | 'is_predefined'>) => {
  return role.is_predefined ? startCase(lowerCase(role.name)) : role.name;
};
