function isUndef(v) {
    return v === undefined || v === null;
}

function isDef(v) {
    return v !== undefined && v !== null;
}

function isTrue(v) {
    return v === true;
}

function isFalse(v) {
    return v === false;
}
function isPrimitive(value) {
    return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'symbol' ||
        typeof value === 'boolean'
    );
}

function invokeInsertHook(vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    if (initial == true && isDef(vnode.parent)) {
        vnode.parent.data.pendingInsert = queue;
    } else {
        for (let i = 0; i < queue.length; ++i) {
            queue[i].data.hook.insert(queue[i]);
        }
    }
}

function createEmptyVNode(text) {
    const node = new VNode();
    node.text = text;
    // node.isComment = true;
    return node;
}

function createTextVNode(val) {
    return new VNode(undefined, undefined, undefined, String(val));
}

function createElm(
    vnode,
    insertedVnodeQueue,
    parentElm,
    refElm,
    nested,
    ownerArray,
    index
) {
    vnode.isRootInsert = !nested;
    let data = vnode.data;
    let children = vnode.children;
    let tag = vnode.tag;
    if (isDef(tag)) {
        // 根据tag创建标签
        vnode.elm = document.createElement(tag);
        // setScope(vnode);
        // 创建子元素
        createChildren(vnode, children, insertedVnodeQueue);
        // 执行 create 生命钩子
        // if (isDef(data)) {
        //     invokeCreateHooks(vnode, insertedVnodeQueue);
        // }
        // 添加元素
        insert(parentElm, vnode.elm, refElm);
    } else {
        vnode.elm = document.createTextNode(vnode.text);
        insert(parentElm, vnode.elm, refElm);
    }
}
function updateAttrs(oldVnode, vnode) {
    if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
        return;
    }
    let elm = vnode.elm;
    let oldAttrs = oldVnode.data.attrs || {};
    let attrs = vnode.data.attrs || {};
    for (key in attrs) {
        let cur = attrs[key];
        let old = oldAttrs[key];
        if (old !== cur) {
            elm.setAttribute(key, attrs[key]);
        }
    }
}
function createChildren(vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
        for (var i = 0; i < children.length; ++i) {
            createElm(
                children[i],
                insertedVnodeQueue,
                vnode.elm,
                null,
                true,
                children,
                i
            );
        }
    } else if (isPrimitive(vnode.text)) {
        vnode.elm.appendChild(createTextVNode(String(vnode.text)));
    }
}
function insert(parent, elm, refElm) {
    if (isDef(parent)) {
        if (isDef(refElm)) {
            if (refElm.parentNode === parent) {
                parent.insertBefore(elm, refElm);
            }
        } else {
            parent.appendChild(elm);
        }
    }
}
function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
        var ch = vnodes[startIdx];
        if (isDef(ch)) {
            removeNode(ch.elm);
            // 这里调用 destroy
        }
    }
}
function removeNode(el) {
    if (el.parentNode) {
        el.parentNode.removeChild(el);
    }
}
function createElement(context, tag, data, children, normalizationType) {
    if (isDef(data) && isDef(data.is)) {
        tag = data.is;
    }
    if (!tag) {
        return createEmptyVNode();
    }
    if (Array.isArray(children) && typeof children[0] === 'function') {
        data = data || {};
        data.scopedSlots = { default: children[0] };
        children.length = 0;
    }

    let vnode, ns;
    if (typeof tag === 'string') {
        vnode = new VNode(tag, data, children, undefined, undefined, context);
    }
    if (Array.isArray(vnode)) {
        return vnode;
    } else if (isDef(vnode)) {
        return vnode;
    } else {
        return createEmptyVNode();
    }
}

function installRenderHelpers(target) {
    target._c = (a, b, c, d) => createElement(target, a, b, c, d, false);
    target._v = createTextVNode;
    target._s = str => str.toString();
}
