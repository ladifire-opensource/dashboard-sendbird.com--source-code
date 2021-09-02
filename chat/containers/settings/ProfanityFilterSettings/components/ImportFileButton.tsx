import { useRef, FC } from 'react';

import { Button, ButtonProps } from 'feather';

const ImportFileButton: FC<Omit<ButtonProps, 'buttonType' | 'size'> & { onFileSelect?: (file: File) => void }> = ({
  onFileSelect,
  ...buttonProps
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        buttonType="tertiary"
        size="small"
        {...buttonProps}
        onClick={(event) => {
          buttonProps.onClick?.(event);
          fileInputRef.current?.click();
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        css="display: none;"
        onChange={(event) => {
          const selectedFile = event.target.files?.[0];
          if (selectedFile) {
            onFileSelect?.(selectedFile);
            event.target.value = '';
          }
        }}
        data-test-id="FileInput"
      />
    </>
  );
};

export default ImportFileButton;
