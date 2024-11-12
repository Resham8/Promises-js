const STATE = {
    FULFILLED : 'fulfilled',
    REJECTED: 'rejected',
    PENDING: 'pending'
}
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
      this.#thenCbs.forEach(callback => {
        callback(this.#value)
      })

      this.#thenCbs = [];
    }

    if (this.#state === STATE.REJECTED) {
      this.#catchCbs.forEach(callback => {
        callback(this.#value)
      })

      this.#catchCbs = [];
    }

  }

  #onSuccess(value) {
    if (this.#state !== STATE.PENDING) return;
    this.#value = value;
    this.#state = STATE.FULFILLED;
    this.#runCallbacks();
  }

  #onFail(value) {
    if (this.#state !== STATE.PENDING) return;
    this.#value = value;
    this.#state = STATE.REJECTED;
    this.#runCallbacks();
  }

  then(thenCb, catchCb) {
    return new aPromise((resolve, reject) => {
      this.#thenCbs.push(result => {
        if (thenCb === null) {
          resolve(result);
          return;
        }

        try {
          resolve(thenCb(result));
        } catch (error) {
          reject(error)
        }
      });

      this.#catchCbs.push(result => {
        if (catchCb === null) {
          resolve(result);
          return;
        }

        try {
          reject(catchCb(result));
        } catch (error) {
          reject(error)
        }
      });

      this.#runCallbacks();    
    })
        
  }

  catch(cb){
    this.then(undefined, cb);
  }

  finally(cb){
    
  }
}

module.exports = aPromise;

// const p = new Promise(cb);
