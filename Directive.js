class Directive {
    constructor(descriptor, vm, el) {
        this.vm = vm;
        this.el = el;
        console.log(el);
        // copy descriptor properties
        this.descriptor = descriptor;
        this.name = descriptor.name;
        this.expression = descriptor.expression;
    }
    _bind() {
        let name = this.name;
        let descriptor = this.descriptor;

        let def = descriptor.def;
        if (typeof def === 'function') {
            this.update = def;
        } else {
            // def={bind: ()=>{}, update:(){}}的时候， 将def的属性覆盖this的
            extend(this, def);
        }

        if (this.bind) {
            this.bind();
        }

        let dir = this;
        if (this.update) {
            this._update = function(val, oldVal) {
                // 值改变会触发这里
                if (!dir._locked) {
                    dir.update(val, oldVal);
                }
            };
        } else {
            this._update = function() {};
        }
        // 这里加watch
        let watcher = (this._watcher = new Watcher(
            this.vm,
            this.expression,
            this._update // callback
        ));
        this.update(watcher.value);
    }
}
