export const getEditChannelRequestPayload = (data: EditChannelAPIPayload['data']) => {
  const payload = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key];
    switch (key) {
      case 'cover_file':
        if (value) {
          payload.append('cover_file', value);
        }
        break;
      case 'data':
        if (value != null) {
          payload.append('data', value);
        }
        break;
      default:
        payload.append(key, value);
    }
  });

  return payload;
};
