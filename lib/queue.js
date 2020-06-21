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

  whenFree() {
    return once(this, 'next');
  }

  whenDrain() {
    return once(this, 'drain');
  }

  async add(task) {
    if (this.isBusy) {
      await this.whenFree();
    }
    this.queue.unshift(task);
    this.next();
  }

  next() {
    if (!this.isBusy) {
      this.emit('next');
    }

    if (this.size === 0 && this.running === 0) {
      this.emit('drain');
    }

    while (this.running <= this.concurrency && this.size > 0) {
      const task = this.queue.pop();
      task().then(() => {
        this.running--;
        this.next();
      });
      this.running++;
    }
  }
};

module.exports = TaskQueue;