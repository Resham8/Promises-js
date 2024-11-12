const STATE = {
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
  PENDING: "pending",
};
class aPromise {
  #thenCbs = [];
  #catchCbs = [];
  #state = STATE.PENDING;
  #value;
  #onSuccessBind = this.#onSuccess.bind(this);
  #onFailBind = this.#onFail.bind(this);

  constructor(cb) {
    try {
      cb(this.#onSuccessBind, this.#onFailBind);
    } catch (error) {
      this.#onFail(error);
    }
  }

  #runCallbacks() {
    if (this.#state === STATE.FULFILLED) {
      this.#thenCbs.forEach((callback) => {
        callback(this.#value);
      });

      this.#thenCbs = [];
    }

    if (this.#state === STATE.REJECTED) {
      this.#catchCbs.forEach((callback) => {
        callback(this.#value);
      });

      this.#catchCbs = [];
    }
  }

  #onSuccess(value) {
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return;

      if (value instanceof aPromise) {
        value.then(this.#onSuccessBind, this.#onFailBind);
        return;
      }

      this.#value = value;
      this.#state = STATE.FULFILLED;
      this.#runCallbacks();
    });
  }

  #onFail(value) {
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return;

      if (value instanceof aPromise) {
        value.then(this.#onSuccessBind, this.#onFailBind);
        return;
      }

      if (this.#catchCbs.length === 0) {
        throw new UncaughtPromiseError(value);
      }

      this.#value = value;
      this.#state = STATE.REJECTED;
      this.#runCallbacks();
    });
  }

  then(thenCb, catchCb) {
    return new aPromise((resolve, reject) => {
      this.#thenCbs.push(result => {
        if (thenCb == null) {
          resolve(result)
          return
        }

        try {
          resolve(thenCb(result))
        } catch (error) {
          reject(error)
        }
      })

      this.#catchCbs.push(result => {
        if (catchCb == null) {
          reject(result)
          return
        }

        try {
          resolve(catchCb(result))
        } catch (error) {
          reject(error)
        }
      })

      this.#runCallbacks()
    })
  }

  catch(cb) {
    return this.then(undefined, cb);
  }

  finally(cb) {
    return this.then(
      result => {
      cb();
      return result;
    },
      result => {
      cb();
      throw result;
    });
  }

  static resolve(value) {
    return new Promise(resolve => {
      resolve(value);
    });
  }

  static reject(reason) {
    return new aPromise((_, reject) => reject(reason));
  }
  
  static all(promises){
    const results = [];
    let completedPromises = 0;
    return new aPromise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i];
        promise.then(value => {
          completedPromises++;
          results[i] = value;

          if (completedPromises === promises.length) {
            resolve(results)
          };
        }).catch(reject);
        
      };
    });
  }

  static allSettled(promises) {
    const results = []
    let completedPromises = 0
    return new aPromise(resolve => {
      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i]
        promise
          .then(value => {
            results[i] = { status: STATE.FULFILLED, value }
          })
          .catch(reason => {
            results[i] = { status: STATE.REJECTED, reason }
          })
          .finally(() => {
            completedPromises++
            if (completedPromises === promises.length) {
              resolve(results)
            }
          })
      }
    })
  }

}

class UncaughtPromiseError extends Error {
  constructor(error) {
    super(error);

    this.stack = `(in promise) ${this.error}`;
  }
}

module.exports = aPromise;

// const p = new Promise(cb);
