import { useEffect, useState } from 'react';

import { toast } from 'feather';

import { getErrorMessage } from '@epics';

import { FileReaderStatus } from '../types';

const useFileReader = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileReaderStatus, setFileReaderStatus] = useState<FileReaderStatus>(FileReaderStatus.Empty);
  const [fileContent, setFileContent] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFile) {
      const fileReader = new FileReader();
      fileReader.readAsText(selectedFile);
      setFileContent(null);
      setFileReaderStatus(FileReaderStatus.Loading);

      fileReader.onload = () => {
        setFileContent(fileReader.result as string);
        setFileReaderStatus(FileReaderStatus.Done);
      };

      fileReader.onerror = () => {
        toast.error({ message: getErrorMessage(fileReader.error) });
        setSelectedFile(null);
      };

      return () => {
        fileReader.abort();
      };
    }

    setFileReaderStatus(FileReaderStatus.Empty);
    setFileContent(null);
  }, [selectedFile]);

  return { setSelectedFile, fileContent, fileReaderStatus, selectedFile };
};

export default useFileReader;
