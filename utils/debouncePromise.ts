type Deferred = {
  promise: Promise<any>;
  resolve: (value?: any) => void;
  reject: (value?: any) => void;
};

type DebouncePromise = (
  fn: (value?: any) => any,
  wait: number,
  options?: { accumulate: boolean; leading: boolean },
) => any;

const getWait = (wait) => {
  return typeof wait === 'function' ? wait() : wait;
};

const defer = () => {
  const deferred: Deferred = {} as Deferred;

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

export const debouncePromise: DebouncePromise = (fn, wait = 0, options = { accumulate: false, leading: false }) => {
  let lastCallAt: number = 0;
  let deferred: Deferred | null = null;
  let timer: NodeJS.Timeout;
  let pendingArgs: any[] = [];

  return (...args) => {
    const currentWait = getWait(wait);
    const currentTime = new Date().getTime();

    const isCold = !lastCallAt || currentTime - lastCallAt > currentWait;

    lastCallAt = currentTime;

    const flush = () => {
      const thisDeferred = deferred;
      clearTimeout(timer);

      Promise.resolve(
        options.accumulate ? fn.call(null, pendingArgs) : fn.apply(null, pendingArgs[pendingArgs.length - 1]),
      ).then(thisDeferred?.resolve, thisDeferred?.reject);

      pendingArgs = [];
      deferred = null;
    };

    if (isCold && options.leading) {
      return options.accumulate
        ? Promise.resolve(fn.call(null, [args])).then((result) => result[0])
        : Promise.resolve(fn.call(null, ...args));
    }

    if (deferred) {
      clearTimeout(timer);
    } else {
      deferred = defer();
    }

    pendingArgs.push(args);
    timer = setTimeout(flush, currentWait);

    if (options.accumulate) {
      const argsIndex = pendingArgs.length - 1;
      return deferred.promise.then((results) => results[argsIndex]);
    }

    return deferred.promise;
  };
};
