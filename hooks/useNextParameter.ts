import qs from 'qs';

export const useNextParameter = () => {
  const { next = '' } = qs.parse(location.search.slice(1));
  return next;
};
