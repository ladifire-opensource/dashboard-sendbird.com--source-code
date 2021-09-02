import styled from 'styled-components';

import { Link } from 'feather';

export const ChevronLink = styled(Link).attrs(({ useReactRouter = true }: { useReactRouter?: boolean }) => ({
  useReactRouter,
  iconProps: { size: 16, icon: 'chevron-right' },
}))``;
