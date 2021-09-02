

export default class PeriodicJob {

  constructor(jobFunc, interval = 1000) {
    this.jobFunc = jobFunc;
    this.interval = interval;
    this.lastResult = null;
  }

  start() {
    this.stop();

    this.timer = setInterval(() => {
      this.lastResult = this.jobFunc();
    }, this.interval);

    return this;
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    return this;
  }
}