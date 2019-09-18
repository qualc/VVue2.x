class MVue {
    constructor(opts = {}) {
        this.$options = opts;
        this.$data = opts.data();
        this.$el = document.querySelector(opts.el);

        installRenderHelpers(this);
        Observer(this.$data);
        Object.keys(this.$data).forEach(key => this._proxy(key));
        if (this.$el) {
            this.$mount(this.$el);
        }
    }
    _proxy(key) {
        var self = this;
        Object.defineProperty(self, key, {
            configurable: true,
            enumerable: true,
            get: function proxyGetter() {
                return self.$data[key];
            },
            set: function proxySetter(val) {
                self.$data[key] = val;
            }
        });
    }
    _render() {
        let vm = this;
        let { render } = vm.$options,
            vnode;
        try {
            vnode = render.call(vm, vm.$createElement);
        } catch (e) {
            console.log('解析模板出错了');
            vnode = vm._vnode;
        }
        if (Array.isArray(vnode) && vnode.length === 1) {
            vnode = vnode[0];
        }
        if (!(vnode instanceof VNode)) {
            if (Array.isArray(vnode)) {
                console.log('vnode类型异常');
            }
            vnode = createEmptyVNode();
        }
        return vnode;
    }
    __patch__ = Compile.patch;
    _update(vnode) {
        var vm = this;
        var prevEl = vm.$el;
        var prevVnode = vm._vnode;
        vm._vnode = vnode;
        // 第一次添加模板
        if (!prevVnode) {
            vm.$el = vm.__patch__(vm.$el, vnode, false /* removeOnly */);
        } else {
            // 非第一次的修改模板
            // updates
            vm.$el = vm.__patch__(prevVnode, vnode);
        }
    }
    $mount(el) {
        let vm = this;
        let template = Compile.getOuterHTML(el);
        let { render } = Compile.compileToFunctions(template);
        vm.$options.render = render;

        var updateComponent;
        updateComponent = function() {
            vm._update(vm._render());
        };
        new Watcher(vm, updateComponent, function() {});

        return vm;
    }
}
