const { EventEmitter, once } = require('events');

class TaskQueue extends EventEmitter {
  concurrency = 1;

  running = 0;

  queue = [];

  constructor({ concurrency }) {
    super();

    if (typeof concurrency === 'number' && concurrency > 0) {
      this.concurrency = concurrency;
    }
  }

  get size() {
    return this.queue.length
  }

  get isBusy() {
    return this.running >= this.concurrency;
  }

  get isDrain() {
    return this.size === 0 && this.running === 0;
  }

  whenFree() {
    return once(this, 'next');
  }

  async whenDrain() {
    return this.isDrain || once(this, 'drain');
  }

  async add(task) {
    if (this.isBusy) {
      await this.whenFree();
    }
    this.queue.unshift(task);
    this.next();
  }

  next() {
    while (this.running < this.concurrency && this.size > 0) {
      const task = this.queue.pop();
      this.running++;
      task().then(() => {
        this.running--;
        if (!this.isBusy) {
          this.emit('next');
        }
        this.next();
      });
    }

    if (this.isDrain) {
      this.emit('drain');
    }
  }
};

module.exports = TaskQueue;