const normalize2FAVerificationCode = (value: string) => value.replace(/[\s-]/g, '');

export default normalize2FAVerificationCode;
