export const checkHourlyPeakYonggan = (organizations) => {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  const yongganOrganizations = ['c3bf85c05425d5214ab2c10a05db3bde780fc719', 'e40098c9d1faffe83fabf3b89eb248b1a035cade'];
  if (organizations.current) {
    if (yongganOrganizations.includes(organizations.current.uid)) {
      return true;
    }
  }

  return false;
};

export * from './filterAccessibleMenusForOrganization';
export * from './authorizationContext';
export * from './authorize';
export * from './getRoleDisplayName';
