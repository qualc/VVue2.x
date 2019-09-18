class Watcher {
    constructor(vm, expOrFn, callback) {
        this.vm = vm;
        this.getter = expOrFn;
        this.callback = callback;
        this.value = this.get();
    }
    update() {
        /*
        this.get() 就已经触发了页面的更新， 其他操作是针对于 实例的 watch 属性的
        */
        const value = this.get();
        const oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            this.callback.call(this.vm, value, oldVal);
        }
    }
    get() {
        let vm = this.vm,
            value;
        Dep.target = this; //储存订阅器
        try {
            value = this.getter.call(vm, vm);
        } catch (e) {
            throw e;
        } finally {
            Dep.target = null;
        }
        return value;
    }
}
