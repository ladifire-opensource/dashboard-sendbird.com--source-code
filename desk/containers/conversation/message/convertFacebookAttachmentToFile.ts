import { FacebookAttachmentTypes } from '@constants';
import { ImageFile, VideoFile, GeneralFile } from '@desk/components/chatBubble/fileInterfaces';

const documentExtensions = ['doc', 'docx', 'odt', 'rtf', 'txt', 'pdf', 'htm', 'html', 'ppt', 'pptx'];
const archiveExtensions = ['zip', 'gz', '7z', 'pkg', 'arj', 'deb', 'rar', 'rpm', 'z'];

export const getFileInformationFromURL = (
  url: string,
  type?: GeneralFile['type'],
): Pick<GeneralFile, 'type' | 'name'> => {
  const tokens = url.split('/');
  const lastToken = tokens[tokens.length - 1];
  // need to be double back slash
  // https://github.com/eslint/eslint/issues/9241#issuecomment-339515190
  const matches = lastToken.match(/^[\w,\s-]+[\\.]([A-Za-z0-9]+)+/gi);

  if (!matches) {
    return { type: 'misc' };
  }

  const [filename, extension] = matches;

  if (type) {
    return { type, name: filename };
  }
  if (documentExtensions.includes(extension)) {
    return { type: 'document', name: filename };
  }
  if (archiveExtensions.includes(extension)) {
    return { type: 'archive', name: filename };
  }
  return { type: 'misc', name: filename };
};

export const convertAttachmentToFile = (
  attachment: { type: FacebookAttachmentTypes; payload: { url: string } },
  showImagePreview?: (url: string) => void,
) => {
  const {
    payload: { url },
    type,
  } = attachment;
  const handleImageClick = showImagePreview ? () => showImagePreview(url) : undefined;
  const handleGeneralFileClick = () => window.open(url);

  switch (type) {
    case FacebookAttachmentTypes.IMAGE:
    case FacebookAttachmentTypes.PHOTO:
    case FacebookAttachmentTypes.STICKER:
    case FacebookAttachmentTypes.ANIMATED_IMAGE_SHARE:
      return { type: 'image', url, onClick: handleImageClick } as ImageFile;

    case FacebookAttachmentTypes.VIDEO:
      return { type: 'video', url } as VideoFile;

    case FacebookAttachmentTypes.AUDIO:
      return { url, ...getFileInformationFromURL(url, 'audio') };

    case FacebookAttachmentTypes.FILE:
    case FacebookAttachmentTypes.FALLBACK:
    default:
      return { url, ...getFileInformationFromURL(url), onClick: handleGeneralFileClick } as GeneralFile;
  }
};
