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

function flatMap(transform) {
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
    const eventEmitter = new EventEmitter();
    const nextIterator = on(eventEmitter, 'next');
    const dataIterator = on(eventEmitter, 'data');

    function destroy() {
      nextIterator.return();
      dataIterator.return();
    }

    queueMicrotask(async () => {
      while (true) {
        if (running >= concurrency) {
          await once(eventEmitter, 'next');
        }

        const { value, done } = await iterable.next();

        if (done) {
          if (running === 0) {
            destroy();
          } else {
            eventEmitter.once('drain', () => {
              destroy();
            });
          }
          break;
        }

        running++;
        handler(value)
          .then(result => {
            eventEmitter.emit('data', result);
          })
          .catch(error => {
            console.error(error);
          })
          .finally(() => {
            running--;
            if (running === 0 ) {
              eventEmitter.emit('drain');
            }
            eventEmitter.emit('next');
          });
      }
    });

    yield* pipe(
      map((args) => args[0])
    )(dataIterator);
  }
}

module.exports = {
  pipe,
  filter,
  map,
  flatMap,
  subscribe,
  parallel
}