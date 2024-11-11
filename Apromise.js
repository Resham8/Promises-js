const STATE = {
    FULFILLED : 'fulfilled',
    REJECTED: 'rejected',
    PENDING: 'pending'
}
class aPromise {
  #thenCbs = [];
  #state = STATE.PENDING;
  #value;

  constructor(cb) {
    try {
      cb(this.#onSuccess, this.#onFail);
    } catch (error) {
      this.#onFail(error);
    }
  }

  #onSuccess(value) {
    if (this.#state !== STATE.PENDING) return;
    this.#value = value;
    this.#state = STATE.FULFILLED;
  }

  #onFail(value) {
    if (this.#state !== STATE.PENDING) return;
    this.#value = value;
    this.#state = STATE.REJECTED;
  }

  then(cb) {
    this.#thenCbs.push(cb);
  }
}

module.exports = aPromise;

const p = new Promise(cb);
