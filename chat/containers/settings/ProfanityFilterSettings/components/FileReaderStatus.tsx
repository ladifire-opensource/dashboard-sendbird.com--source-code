import { FC } from 'react';

import styled, { css } from 'styled-components';

import { cssVariables, Icon, Spinner, Subtitles } from 'feather';

import { FileReaderStatus as FileReaderStatusEnum } from '../types';

type Props = {
  isDisabled?: boolean;
  selectedFile?: File | null;
  status: FileReaderStatusEnum;
};

const IconWrapper = styled.div`
  width: 20px;
  height: 20px;
  margin-right: 8px;
`;

const Filename = styled.div<{ color: string }>`
  color: ${(props) => props.color};
  ${Subtitles['subtitle-01']};
`;

const FileReader = styled.div<{ isDisabled?: boolean }>`
  display: flex;
  align-items: center;
  margin-top: 12px;
  margin-bottom: 6px;

  ${(props) =>
    props.isDisabled &&
    css`
      ${Filename} {
        color: ${cssVariables('neutral-5')};
      }
    `}
`;

const FileReaderStatus: FC<Props> = ({ isDisabled, selectedFile, status: fileReaderStatus }) => {
  return selectedFile ? (
    <FileReader isDisabled={isDisabled}>
      <IconWrapper>
        {fileReaderStatus === FileReaderStatusEnum.Loading && (
          <Spinner size={20} stroke={isDisabled ? cssVariables('neutral-5') : cssVariables('neutral-6')} />
        )}
        {fileReaderStatus === FileReaderStatusEnum.Done && (
          <Icon
            icon="file-activated"
            size={20}
            color={isDisabled ? cssVariables('neutral-5') : cssVariables('neutral-6')}
          />
        )}
      </IconWrapper>
      <Filename
        color={
          fileReaderStatus === FileReaderStatusEnum.Loading ? cssVariables('neutral-6') : cssVariables('neutral-7')
        }
      >
        {selectedFile.name}
      </Filename>
    </FileReader>
  ) : null;
};

export default FileReaderStatus;
