const { EventEmitter, once, on } = require('events');

function pipe(...generators) {
  return function (iterable) {
    return generators.reduce((acc, item) => item(acc), iterable)
  }
}

function filter(predicate) {
  return async function* (iterable) {
    for await (const item of iterable) {
      if (await predicate(item)) {
        yield item;
      }
    }
  }
}

function map(transform) {
  return async function* (iterable) {
    for await (const item of iterable) {
      yield transform(item);
    }
  }
}

function switchMap(transform) {
  return async function* (iterable) {
    for await (const item of iterable) {
      yield* transform(item);
    }
  }
}

async function subscribe(iterable, fn) {
  for await (const item of iterable) {
    fn(item);
  }
}

function parallel({ handler, concurrency = 1 }) {
  return async function* (iterable) {
    let running = 0;
    let isDone = false;
    const signal = new EventEmitter();
    const signalIterator = on(signal, 'next');

    signal.once('drain', () => {
      signalIterator.return();
    });

    queueMicrotask(async () => {
      while (true) {
        const { value, done } = await iterable.next();

        if (done) {
          isDone = true;
          break;
        }

        if (running >= concurrency) {
          await once(signal, 'next');
        }

        running++;
        handler(value)
          .then(result => {
            signal.emit('next', result);
          })
          .catch(error => {
            console.error(error);
          })
          .finally(() => {
            running--;
            if (isDone && running === 0 ) {
              signal.emit('drain');
            }
          });
      }
    });

    yield* pipe(
      map((args) => args[0])
    )(signalIterator);
  }
}

module.exports = {
  pipe,
  filter,
  map,
  switchMap,
  subscribe,
  parallel
}