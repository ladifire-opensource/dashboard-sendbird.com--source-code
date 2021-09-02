export class SendbirdPromiseHelper {
  static enterOpenChannel = (openChannel: SendBird.OpenChannel) =>
    new Promise((resolve, reject) => {
      openChannel.enter((response, error) => {
        if (error) {
          return reject(error);
        }
        return resolve(response);
      });
    });
}
