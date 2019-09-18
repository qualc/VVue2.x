function Observer(data) {
    if (!data || typeof data != 'object') {
        return;
    }
    // 开始劫持 data 的所有 key value
    Object.entries(data).forEach(([k, v]) => defineReactive(data, k, v));
}

function defineReactive(obj, key, value) {
    let dep = new Dep();
    // 递归监听
    Observer(value);
    Object.defineProperty(obj, key, {
        get: function() {
            // Dep.target 是 watcher 实例对象
            if (Dep.target) {
                dep.addSub(Dep.target);
            }
            return value;
        },
        set: function(nvalue) {
            if (nvalue != value) {
                value = nvalue;
                dep.notify();
            }
        }
    });
}

// 监听发布函数
class Dep {
    constructor() {
        this.subList = [];
    }
    addSub(sub) {
        this.subList.push(sub);
    }
    notify() {
        console.log('属性变化通知 Watcher 执行更新视图函数');
        this.subList.forEach(sub => {
            sub.update();
        });
    }
}
Dep.target = null;
