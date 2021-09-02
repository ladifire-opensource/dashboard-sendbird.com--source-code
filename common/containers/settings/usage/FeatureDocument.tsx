import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Icon, Link } from 'feather';

import { FeatureDocuments } from '@constants';

const Wrapper = styled.div`
  background: ${cssVariables('neutral-1')};
  border-radius: 4px;
  padding: 24px;
  margin-top: 24px;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: -0.15px;
  color: ${cssVariables('neutral-10')};
  margin-bottom: 8px;
`;

const Description = styled.div`
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-7')};
  margin-bottom: 24px;
`;

const DocumentLinks = styled.ul`
  list-style: none;
  display: flex;
  align-items: center;
  li {
    svg {
      margin-left: 4px;
    }

    & + li {
      margin-left: 24px;
    }

    font-size: 14px;
  }
`;

/**
 * If we have any sample for the specific features we can put sample link
 */
// TODO change it to proper name using intl
const linkLabels = {
  doc: 'Help center',
  ios: 'iOS SDK',
  android: 'Android SDK',
  javascript: 'JavaScript SDK',
  platformAPI: 'Platform API',
};

const getDocuments = (featureKey) => {
  if (Object.prototype.hasOwnProperty.call(FeatureDocuments, featureKey)) {
    return Object.entries(FeatureDocuments[featureKey]).map(([key, url]: [string, string]) => {
      return {
        label: linkLabels[key],
        url,
      };
    });
  }
  return [];
};

type Props = {
  feature: string; // TODO featureKey
};

export const FeatureDocument: FC<Props> = ({ feature }) => {
  const intl = useIntl();
  const documents = getDocuments(feature);

  if (documents.length === 0) {
    return null;
  }
  return (
    <Wrapper>
      <Title>{intl.formatMessage({ id: 'common.featureDocument.title' })}</Title>
      <Description>{intl.formatMessage({ id: 'common.featureDocument.description' })}</Description>
      <DocumentLinks>
        {documents.map(({ label, url }) => (
          <li key={`documentLinks_${label}`}>
            <Link href={url} target="_blank">
              {label} <Icon size={16} icon="open-in-new" />
            </Link>
          </li>
        ))}
      </DocumentLinks>
    </Wrapper>
  );
};
