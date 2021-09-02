import React from 'react';

import styled, { css } from 'styled-components';

import { CLOUD_FRONT_URL } from '@constants';
import { Image } from '@ui/components';

const Customer = styled.article`
  text-align: center;
  min-height: 560px;
  cursor: ew-resize;
`;

const Quote = styled.blockquote`
  display: block;
  margin-top: 16px;
  padding: 0 24px;
  font-size: 18px;
  font-style: italic;
  line-height: 1.56;
  letter-spacing: -0.23px;
  color: white;
`;

const QuoteBy = styled.cite`
  display: block;
  margin-top: 40px;
  font-size: 16px;
  font-weight: 600;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.25;
  color: white;
`;

type Props = {
  logoFilename: string;
  quote: string;
  quoteBy: string;
};

export const CustomerQuote: React.FunctionComponent<Props> = ({ logoFilename, quote, quoteBy }) => {
  return (
    <Customer>
      <Image
        src={`${CLOUD_FRONT_URL}/dashboard/${logoFilename}.png`}
        alt={logoFilename}
        styles={css`
          margin: auto;
          width: 180px;
          height: 120px;
        `}
      />
      <Quote>{quote}</Quote>
      <QuoteBy dangerouslySetInnerHTML={{ __html: quoteBy }} />
    </Customer>
  );
};
