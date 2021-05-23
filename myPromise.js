// 状态定义
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

// promise 类实现
class MyPromise {
    constructor(excutor) {
        try {
            excutor(this.resolve, this.reject)
        } catch (e) {
            this.reject(e)
        }
    }
    // 状态
    status = PENDING;
    // 成功之后的值
    value = undefined;
    // 失败之后的原因
    reason = undefined;
    // 成功回调
    successCallback = [];
    // 失败回调
    failCallback = []
    resolve = value => {
        if (this.status !== PENDING) return;
        this.status = FULFILLED;
        this.value = value;
        while (this.successCallback.length) {
            this.successCallback.shift()(this.value)
        }
    }
    reject = reason => {
        if (this.status !== PENDING) return;
        this.status = REJECTED;
        this.reason = reason;
        while (this.failCallback.length) {
            this.failCallback.shift()(this.reason)
        }

    }
    then(successCallback, failCallback) {
        let returnPromise = new MyPromise((resolve, reject) => {
            // do somethings
            if (this.status === FULFILLED) {
                try {
                    let x = successCallback(this.value)
                    // 封装函数做判断普通值还是promise对象
                    resolvePromise(x, resolve, reject)
                } catch (e) {
                    reject(e)
                }
            } else if (this.status === REJECTED) {
                try {
                    let x = failCallback(this.reason)
                    //  封装函数做判断普通值还是promise对象
                    resolvePromise(x, resolve, reject)
                } catch (e) {
                    reject(e)
                }
            } else {
                this.successCallback.push(successCallback);
                this.failCallback.push(failCallback);
            }
        })
        return returnPromise
    }
    finall(callback) {
        return this.then(value => {
            return MyPromise.resolve(callback()).then(() => value)
        }, reason => {
            return MyPromise.resolve(callback()).then(() => { throw reason })
        })
    }
    catch(failCallback) {
        return this.then(undefined, failCallback)
    }
    static all(array) {
        let result = [];
        let index = 0;
        return new MyPromise((resolve, reject) => {
            function addData(key, value) {
                result[key] = value;
                index++;
                if (index === array.length) {
                    resolve(result)
                }
            }
            for (let i = 0; i < array.length; i++) {
                let current = array[i]
                // 判断是普通值还是promise对象
                if (current instanceof MyPromise) {
                    current.then(value => addData(i, value), reason => reject(reason))
                } else {
                    addData(i, array[i])
                }
            }
       })
    }
    static resolve(value) {
        if (value instanceof MyPromise) return value;
        return new MyPromise(resolve => resolve(value))
    }


}


function resolvePromise(x, resolve, reject) {
    if (x instanceof MyPromise) {
        // promise 对象
        x.then(resolve, reject)
    } else {
        // 普通值
        resolve(x)
    }
}


ßß