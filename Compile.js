const Compile = {
    compileToFunctions(template) {
        let ast = Parse(template);
        let { render, staticRenderFns } = this.generate(ast);
        return {
            render: this.createFunction(render),
            staticRenderFns: this.createFunction(staticRenderFns)
        };
    },
    getOuterHTML(el) {
        if (el.outerHTML) {
            return el.outerHTML;
        } else {
            let container = document.createElement('div');
            container.appendChild(el.cloneNode(true));
            return container.innerHTML;
        }
    },
    generate(ast) {
        const code = ast ? this.genElement(ast) : '_c("div")';
        return {
            render: `with(this){return ${code}}`,
            staticRenderFns: []
        };
    },
    genElement(ast) {
        let data = this.genData(ast),
            children = this.genChildren(ast);
        return (
            '_c("' +
            ast.tag +
            '"' +
            (data ? ',' + data : '') +
            (children ? ',' + children : '') +
            ')'
        );
    },
    genData(ast) {
        let data = '{';
        if (ast.attrs) {
            data += 'attrs:' + this.genProps(ast.attrs) + ',';
        }
        data = data.replace(/,$/, '') + '}';
        return data;
    },
    genProps(props) {
        // 只处理静态属性
        var staticProps = '';
        for (var i = 0; i < props.length; i++) {
            var prop = props[i];
            var value = this.transformSpecialNewlines(prop.value);
            staticProps += '"' + prop.name + '":' + value + ',';
        }
        staticProps = '{' + staticProps.slice(0, -1) + '}';
        return staticProps;
    },
    genChildren(ast) {
        let children = ast.children;
        if (children.length) {
            return (
                '[' +
                children
                    .map(child => {
                        return this.genNode(child);
                    })
                    .join(',') +
                ']'
            );
        }
    },
    genNode(node) {
        if (node.type === 1) {
            return this.genElement(node);
        } else {
            return this.genText(node);
        }
    },
    genText(text) {
        return (
            '_v(' +
            (text.type === 2
                ? text.expression // no need for () because already wrapped in _s()
                : this.transformSpecialNewlines(JSON.stringify(text.text))) +
            ')'
        );
    },
    patch(oldVnode, vnode) {
        let isInitialPatch = false;
        let insertedVnodeQueue = [];
        // 是真实dom吗
        let isRealElement = isDef(oldVnode.nodeType);
        if (isRealElement) {
            // 创建一个虚拟dom节点
            oldVnode = new VNode(
                oldVnode.tagName.toLowerCase(),
                {},
                [],
                undefined,
                oldVnode
            );
        }

        let oldElm = oldVnode.elm;
        let parentElm = oldElm.parentNode;

        createElm(vnode, insertedVnodeQueue, parentElm, oldElm.nextSibling);
        updateAttrs(oldVnode, vnode);

        if (isDef(parentElm)) {
            removeVnodes(parentElm, [oldVnode], 0, 0);
        }
        invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
        return vnode.elm;
    },
    transformSpecialNewlines(text) {
        // https://www.cnblogs.com/rrooyy/p/5349978.html
        return text.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    },
    createFunction(code, errors) {
        try {
            return new Function(code);
        } catch (err) {
            console.log('render转换为函数失败了');
            return function() {};
        }
    }
};
