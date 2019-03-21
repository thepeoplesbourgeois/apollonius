(function () {
  'use strict';

  /*! (c) Andrea Giammarchi - ISC */
  var self = undefined || /* istanbul ignore next */ {};
  self.CustomEvent = typeof CustomEvent === 'function' ?
    CustomEvent :
    (function (__p__) {
      CustomEvent[__p__] = new CustomEvent('').constructor[__p__];
      return CustomEvent;
      function CustomEvent(type, init) {
        if (!init) init = {};
        var e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, !!init.bubbles, !!init.cancelable, init.detail);
        return e;
      }
    }('prototype'));
  var CustomEvent$1 = self.CustomEvent;

  /*! (c) Andrea Giammarchi - ISC */
  var self$1 = undefined || /* istanbul ignore next */ {};
  try { self$1.WeakSet = WeakSet; }
  catch (WeakSet) {
    // requires a global WeakMap (IE11+)
    (function (WeakMap) {
      var all = new WeakMap;
      var proto = WeakSet.prototype;
      proto.add = function (value) {
        return all.get(this).set(value, 1), this;
      };
      proto.delete = function (value) {
        return all.get(this).delete(value);
      };
      proto.has = function (value) {
        return all.get(this).has(value);
      };
      self$1.WeakSet = WeakSet;
      function WeakSet(iterable) {
        all.set(this, new WeakMap);
        if (iterable)
          iterable.forEach(this.add, this);
      }
    }(WeakMap));
  }
  var WeakSet$1 = self$1.WeakSet;

  let now = null;
  const current = () => now;

  const empty = [];
  const setup = [];

  const $ = (value, args) =>
    typeof value === typeof $ ? value.apply(null, args) : value;

  const diff = (a, b) => (a.length !== b.length || a.some(diverse, b));

  const stacked = id => runner => {
    const state = {i: 0, stack: []};
    runner[id] = state;
    runner.before.push(() => {
      state.i = 0;
    });
  };

  let id = 0;
  const uid = () => '_$' + id++;

  const unstacked = id => {
    const {[id]: state, update} = now;
    const {i, stack} = state;
    state.i++;
    return {i, stack, update, unknown: i === stack.length};
  };

  var augmentor = fn => {
    const current = runner($);
    each(setup, current);
    $.reset = () => {
      each(current.reset, current);
      for (const key in current) {
        if (/^_\$/.test(key))
          current[key].stack.splice(0);
      }
    };
    return $;
    function $() {
      const prev = now;
      now = current;
      const {_, before, after, external} = current;
      try {
        let result;
        do {
          _.$ = _._ = false;
          each(before, current);
          result = fn.apply(_.c = this, _.a = arguments);
          each(after, current);
          if (external.length)
            each(external.splice(0), result);
        } while (_._);
        return result;
      }
      finally {
        _.$ = true;
        now = prev;
      }
    }
  };

  const each = (arr, value) => {
    const {length} = arr;
    let i = 0;
    while (i < length)
      arr[i++](value);
  };

  const runner = $ => {
    const _ = {
      _: true,
      $: true,
      c: null,
      a: null
    };
    return {
      _: _,
      before: [],
      after: [],
      external: [],
      reset: [],
      update: () => _.$ ? $.apply(_.c, _.a) : (_._ = true)
    };
  };

  function diverse(value, i) {
    return value !== this[i];
  }

  const id$1 = uid();

  let cancel, request;

  try {
    cancel = cancelAnimationFrame;
    request = requestAnimationFrame;
  } catch (o_O) {
    cancel = clearTimeout;
    request = setTimeout;
  }

  const create = (always, check, inputs, raf, cb, stack, i) => {
    const info = {
      always,
      cb,
      check,
      clean: null,
      inputs,
      raf,
      t: 0,
      update: check,
      fn: () => {
        set(stack[i], info.cb());
      }
    };
    return info;
  };

  const effect = raf => (cb, refs) => {
    const {i, stack, unknown} = unstacked(id$1);
    const comp = refs || empty;
    if (unknown) {
      const always = comp === empty;
      const check = always || !raf || typeof comp !== typeof effect;
      if (always || !raf || typeof comp !== typeof effect) {
        stack.push(create(always, check, comp, raf, cb, stack, i));
      } else {
        current().external.push(result => refs(cb, result));
        stack.push(create(always, always, empty, raf, effect, stack, i));
      }
    } else {
      const info = stack[i];
      const {check, always, inputs} = info;
      if (check && (always || diff(inputs, comp))) {
        info.cb = cb;
        info.inputs = comp;
        info.update = true;
      }
    }
  };

  const set = (info, clean) => {
    info.t = 0;
    info.clean = clean;
  };

  setup.push(runner => {
    const stack = [];
    const state = {i: 0, stack};
    const drop = (current, clean, raf, t) => {
      if (raf && t)
        cancel(t);
      else if (clean)
        clean();
      set(current, null);
    };
    runner[id$1] = state;
    runner.before.push(() => {
      state.i = 0;
    });
    runner.reset.push(() => {
      state.i = 0;
      for (let {length} = stack, i = 0; i < length; i++) {
        const current = stack[i];
        const {check, clean, raf, t} = current;
        if (check)
          drop(current, clean, raf, t);
      }
    });
    runner.after.push(() => {
      for (let {length} = stack, i = 0; i < length; i++) {
        const current = stack[i];
        const {check, clean, fn, raf, t, update} = current;
        if (check && update) {
          current.update = false;
          drop(current, clean, raf, t);
          if (raf)
            current.t = request(fn);
          else
            fn();
        }
      }
    });
  });

  const useEffect = effect(true);

  const id$2 = uid();

  setup.push(stacked(id$2));

  var useRef = value => {
    const {i, stack, unknown} = unstacked(id$2);
    if (unknown) {
      const info = {current: null};
      stack.push(info);
      info.current = $(value, empty);
    }
    return stack[i];
  };

  const id$3 = uid();

  setup.push(stacked(id$3));

  const id$4 = uid();

  setup.push(stacked(id$4));

  var useReducer = (reducer, value) => {
    const {i, stack, unknown, update} = unstacked(id$4);
    if (unknown) {
      const info = [null, action => {
        value = reducer(value, action);
        info[0] = value;
        update();
      }];
      stack.push(info);
      info[0] = $(value, empty);
    }
    return stack[i];
  };

  var useState = value => useReducer(
    (_, value) => $(value, [_]),
    value
  );

  const id$5 = uid();

  setup.push(stacked(id$5));

  /*! (c) Andrea Giammarchi */
  function disconnected(poly) {  var CONNECTED = 'connected';
    var DISCONNECTED = 'dis' + CONNECTED;
    var Event = poly.Event;
    var WeakSet = poly.WeakSet;
    var notObserving = true;
    var observer = new WeakSet;
    return function observe(node) {
      if (notObserving) {
        notObserving = !notObserving;
        startObserving(node.ownerDocument);
      }
      observer.add(node);
      return node;
    };
    function startObserving(document) {
      var dispatched = null;
      try {
        (new MutationObserver(changes)).observe(
          document,
          {subtree: true, childList: true}
        );
      }
      catch(o_O) {
        var timer = 0;
        var records = [];
        var reschedule = function (record) {
          records.push(record);
          clearTimeout(timer);
          timer = setTimeout(
            function () {
              changes(records.splice(timer = 0, records.length));
            },
            0
          );
        };
        document.addEventListener(
          'DOMNodeRemoved',
          function (event) {
            reschedule({addedNodes: [], removedNodes: [event.target]});
          },
          true
        );
        document.addEventListener(
          'DOMNodeInserted',
          function (event) {
            reschedule({addedNodes: [event.target], removedNodes: []});
          },
          true
        );
      }
      function changes(records) {
        dispatched = new Tracker;
        for (var
          record,
          length = records.length,
          i = 0; i < length; i++
        ) {
          record = records[i];
          dispatchAll(record.removedNodes, DISCONNECTED, CONNECTED);
          dispatchAll(record.addedNodes, CONNECTED, DISCONNECTED);
        }
        dispatched = null;
      }
      function dispatchAll(nodes, type, counter) {
        for (var
          node,
          event = new Event(type),
          length = nodes.length,
          i = 0; i < length;
          (node = nodes[i++]).nodeType === 1 &&
          dispatchTarget(node, event, type, counter)
        );
      }
      function dispatchTarget(node, event, type, counter) {
        if (observer.has(node) && !dispatched[type].has(node)) {
          dispatched[counter].delete(node);
          dispatched[type].add(node);
          node.dispatchEvent(event);
          /*
          // The event is not bubbling (perf reason: should it?),
          // hence there's no way to know if
          // stop/Immediate/Propagation() was called.
          // Should DOM Level 0 work at all?
          // I say it's a YAGNI case for the time being,
          // and easy to implement in user-land.
          if (!event.cancelBubble) {
            var fn = node['on' + type];
            if (fn)
              fn.call(node, event);
          }
          */
        }
        for (var
          // apparently is node.children || IE11 ... ^_^;;
          // https://github.com/WebReflection/disconnected/issues/1
          children = node.children || [],
          length = children.length,
          i = 0; i < length;
          dispatchTarget(children[i++], event, type, counter)
        );
      }
      function Tracker() {
        this[CONNECTED] = new WeakSet;
        this[DISCONNECTED] = new WeakSet;
      }
    }
  }

  const find = node => {
    const {childNodes} = node;
    const {length} = childNodes;
    let i = 0;
    while (i < length) {
      const child = childNodes[i++];
      if (child.nodeType === 1)
        return child;
    }
    throw 'unobservable';
  };

  const observe = disconnected({Event: CustomEvent$1, WeakSet: WeakSet$1});

  const observer = ($, element) => {
    const {nodeType} = element;
    if (nodeType) {
      const node = nodeType === 1 ? element : find(element);
      observe(node);
      const handler = {handleEvent, onconnected, ondisconnected, $, _: null};
      node.addEventListener('connected', handler, false);
      node.addEventListener('disconnected', handler, false);
    }
    else {
      const value = element.valueOf();
      // give a chance to facades to return a reasonable value
      if (value !== element)
        observer($, value);
    }
  };

  const useEffect$1 = (fn, inputs) => {
    const args = [fn];
    if (inputs)
      // if the inputs is an empty array
      // observe the returned element for connect/disconnect events
      // and invoke effects/cleanup on these events only
      args.push(inputs.length ? inputs : observer);
    return useEffect.apply(null, args);
  };

  // handlers methods
  function handleEvent(e) {
    this['on' + e.type]();
  }

  function onconnected() {
    ondisconnected.call(this);
    this._ = this.$();
  }

  function ondisconnected() {
    const {_} = this;
    this._ = null;
    if (_)
      _();
  }

  /*! (c) Andrea Giammarchi - ISC */
  var self$2 = undefined || /* istanbul ignore next */ {};
  try { self$2.WeakMap = WeakMap; }
  catch (WeakMap) {
    // this could be better but 90% of the time
    // it's everything developers need as fallback
    self$2.WeakMap = (function (id, Object) {    var dP = Object.defineProperty;
      var hOP = Object.hasOwnProperty;
      var proto = WeakMap.prototype;
      proto.delete = function (key) {
        return this.has(key) && delete key[this._];
      };
      proto.get = function (key) {
        return this.has(key) ? key[this._] : void 0;
      };
      proto.has = function (key) {
        return hOP.call(key, this._);
      };
      proto.set = function (key, value) {
        dP(key, this._, {configurable: true, value: value});
        return this;
      };
      return WeakMap;
      function WeakMap(iterable) {
        dP(this, '_', {value: '_@ungap/weakmap' + id++});
        if (iterable)
          iterable.forEach(add, this);
      }
      function add(pair) {
        this.set(pair[0], pair[1]);
      }
    }(Math.random(), Object));
  }
  var WeakMap$1 = self$2.WeakMap;

  /*! (c) Andrea Giammarchi - ISC */
  var templateLiteral = (function () {  var RAW = 'raw';
    var isNoOp = typeof document !== 'object';
    var templateLiteral = function (tl) {
      if (
        // for badly transpiled literals
        !(RAW in tl) ||
        // for some version of TypeScript
        tl.propertyIsEnumerable(RAW) ||
        // and some other version of TypeScript
        !Object.isFrozen(tl[RAW]) ||
        (
          // or for Firefox < 55
          /Firefox\/(\d+)/.test(
            (document.defaultView.navigator || {}).userAgent
          ) &&
          parseFloat(RegExp.$1) < 55
        )
      ) {
        var forever = {};
        templateLiteral = function (tl) {
          for (var key = '.', i = 0; i < tl.length; i++)
            key += tl[i].length + '.' + tl[i];
          return forever[key] || (forever[key] = tl);
        };
      } else {
        isNoOp = true;
      }
      return TL(tl);
    };
    return TL;
    function TL(tl) {
      return isNoOp ? tl : templateLiteral(tl);
    }
  }());

  function tta (template) {
    var length = arguments.length;
    var args = [templateLiteral(template)];
    var i = 1;
    while (i < length)
      args.push(arguments[i++]);
    return args;
  }

  /*! (c) Andrea Giammarchi - ISC */
  var Wire = (function (slice, proto) {

    proto = Wire.prototype;

    proto.ELEMENT_NODE = 1;
    proto.nodeType = 111;

    proto.remove = function (keepFirst) {
      var childNodes = this.childNodes;
      var first = this.firstChild;
      var last = this.lastChild;
      this._ = null;
      if (keepFirst && childNodes.length === 2) {
        last.parentNode.removeChild(last);
      } else {
        var range = this.ownerDocument.createRange();
        range.setStartBefore(keepFirst ? childNodes[1] : first);
        range.setEndAfter(last);
        range.deleteContents();
      }
      return first;
    };

    proto.valueOf = function (forceAppend) {
      var fragment = this._;
      var noFragment = fragment == null;
      if (noFragment)
        fragment = (this._ = this.ownerDocument.createDocumentFragment());
      if (noFragment || forceAppend) {
        for (var n = this.childNodes, i = 0, l = n.length; i < l; i++)
          fragment.appendChild(n[i]);
      }
      return fragment;
    };

    return Wire;

    function Wire(childNodes) {
      var nodes = (this.childNodes = slice.call(childNodes, 0));
      this.firstChild = nodes[0];
      this.lastChild = nodes[nodes.length - 1];
      this.ownerDocument = nodes[0].ownerDocument;
      this._ = null;
    }

  }([].slice));

  const {isArray} = Array;
  const wireType = Wire.prototype.nodeType;

  /*! (c) Andrea Giammarchi - ISC */
  var createContent = (function (document) {  var FRAGMENT = 'fragment';
    var TEMPLATE = 'template';
    var HAS_CONTENT = 'content' in create(TEMPLATE);

    var createHTML = HAS_CONTENT ?
      function (html) {
        var template = create(TEMPLATE);
        template.innerHTML = html;
        return template.content;
      } :
      function (html) {
        var content = create(FRAGMENT);
        var template = create(TEMPLATE);
        var childNodes = null;
        if (/^[^\S]*?<(col(?:group)?|t(?:head|body|foot|r|d|h))/i.test(html)) {
          var selector = RegExp.$1;
          template.innerHTML = '<table>' + html + '</table>';
          childNodes = template.querySelectorAll(selector);
        } else {
          template.innerHTML = html;
          childNodes = template.childNodes;
        }
        append(content, childNodes);
        return content;
      };

    return function createContent(markup, type) {
      return (type === 'svg' ? createSVG : createHTML)(markup);
    };

    function append(root, childNodes) {
      var length = childNodes.length;
      while (length--)
        root.appendChild(childNodes[0]);
    }

    function create(element) {
      return element === FRAGMENT ?
        document.createDocumentFragment() :
        document.createElementNS('http://www.w3.org/1999/xhtml', element);
    }

    // it could use createElementNS when hasNode is there
    // but this fallback is equally fast and easier to maintain
    // it is also battle tested already in all IE
    function createSVG(svg) {
      var content = create(FRAGMENT);
      var template = create('div');
      template.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>';
      append(content, template.firstChild.childNodes);
      return content;
    }

  }(document));

  /*! (c) Andrea Giammarchi - ISC */
  var self$3 = undefined || /* istanbul ignore next */ {};
  try { self$3.Map = Map; }
  catch (Map) {
    self$3.Map = function Map() {
      var i = 0;
      var k = [];
      var v = [];
      return {
        delete: function (key) {
          var had = contains(key);
          if (had) {
            k.splice(i, 1);
            v.splice(i, 1);
          }
          return had;
        },
        get: function get(key) {
          return contains(key) ? v[i] : void 0;
        },
        has: function has(key) {
          return contains(key);
        },
        set: function set(key, value) {
          v[contains(key) ? i : (k.push(key) - 1)] = value;
          return this;
        }
      };
      function contains(v) {
        i = k.indexOf(v);
        return -1 < i;
      }
    };
  }
  var Map$1 = self$3.Map;

  const append = (get, parent, children, start, end, before) => {
    if ((end - start) < 2)
      parent.insertBefore(get(children[start], 1), before);
    else {
      const fragment = parent.ownerDocument.createDocumentFragment();
      while (start < end)
        fragment.appendChild(get(children[start++], 1));
      parent.insertBefore(fragment, before);
    }
  };

  const eqeq = (a, b) => a == b;

  const identity = O => O;

  const indexOf = (
    moreNodes,
    moreStart,
    moreEnd,
    lessNodes,
    lessStart,
    lessEnd,
    compare
  ) => {
    const length = lessEnd - lessStart;
    /* istanbul ignore if */
    if (length < 1)
      return -1;
    while ((moreEnd - moreStart) >= length) {
      let m = moreStart;
      let l = lessStart;
      while (
        m < moreEnd &&
        l < lessEnd &&
        compare(moreNodes[m], lessNodes[l])
      ) {
        m++;
        l++;
      }
      if (l === lessEnd)
        return moreStart;
      moreStart = m + 1;
    }
    return -1;
  };

  const isReversed = (
    futureNodes,
    futureEnd,
    currentNodes,
    currentStart,
    currentEnd,
    compare
  ) => {
    while (
      currentStart < currentEnd &&
      compare(
        currentNodes[currentStart],
        futureNodes[futureEnd - 1]
      )) {
        currentStart++;
        futureEnd--;
      }  return futureEnd === 0;
  };

  const next = (get, list, i, length, before) => i < length ?
                get(list[i], 0) :
                (0 < i ?
                  get(list[i - 1], -0).nextSibling :
                  before);

  const remove = (get, parent, children, start, end) => {
    if ((end - start) < 2)
      parent.removeChild(get(children[start], -1));
    else {
      const range = parent.ownerDocument.createRange();
      range.setStartBefore(get(children[start], -1));
      range.setEndAfter(get(children[end - 1], -1));
      range.deleteContents();
    }
  };

  // - - - - - - - - - - - - - - - - - - -
  // diff related constants and utilities
  // - - - - - - - - - - - - - - - - - - -

  const DELETION = -1;
  const INSERTION = 1;
  const SKIP = 0;
  const SKIP_OND = 50;

  const HS = (
    futureNodes,
    futureStart,
    futureEnd,
    futureChanges,
    currentNodes,
    currentStart,
    currentEnd,
    currentChanges
  ) => {

    let k = 0;
    /* istanbul ignore next */
    let minLen = futureChanges < currentChanges ? futureChanges : currentChanges;
    const link = Array(minLen++);
    const tresh = Array(minLen);
    tresh[0] = -1;

    for (let i = 1; i < minLen; i++)
      tresh[i] = currentEnd;

    const keymap = new Map$1;
    for (let i = currentStart; i < currentEnd; i++)
      keymap.set(currentNodes[i], i);

    for (let i = futureStart; i < futureEnd; i++) {
      const idxInOld = keymap.get(futureNodes[i]);
      if (idxInOld != null) {
        k = findK(tresh, minLen, idxInOld);
        /* istanbul ignore else */
        if (-1 < k) {
          tresh[k] = idxInOld;
          link[k] = {
            newi: i,
            oldi: idxInOld,
            prev: link[k - 1]
          };
        }
      }
    }

    k = --minLen;
    --currentEnd;
    while (tresh[k] > currentEnd) --k;

    minLen = currentChanges + futureChanges - k;
    const diff = Array(minLen);
    let ptr = link[k];
    --futureEnd;
    while (ptr) {
      const {newi, oldi} = ptr;
      while (futureEnd > newi) {
        diff[--minLen] = INSERTION;
        --futureEnd;
      }
      while (currentEnd > oldi) {
        diff[--minLen] = DELETION;
        --currentEnd;
      }
      diff[--minLen] = SKIP;
      --futureEnd;
      --currentEnd;
      ptr = ptr.prev;
    }
    while (futureEnd >= futureStart) {
      diff[--minLen] = INSERTION;
      --futureEnd;
    }
    while (currentEnd >= currentStart) {
      diff[--minLen] = DELETION;
      --currentEnd;
    }
    return diff;
  };

  // this is pretty much the same petit-dom code without the delete map part
  // https://github.com/yelouafi/petit-dom/blob/bd6f5c919b5ae5297be01612c524c40be45f14a7/src/vdom.js#L556-L561
  const OND = (
    futureNodes,
    futureStart,
    rows,
    currentNodes,
    currentStart,
    cols,
    compare
  ) => {
    const length = rows + cols;
    const v = [];
    let d, k, r, c, pv, cv, pd;
    outer: for (d = 0; d <= length; d++) {
      /* istanbul ignore if */
      if (d > SKIP_OND)
        return null;
      pd = d - 1;
      /* istanbul ignore next */
      pv = d ? v[d - 1] : [0, 0];
      cv = v[d] = [];
      for (k = -d; k <= d; k += 2) {
        if (k === -d || (k !== d && pv[pd + k - 1] < pv[pd + k + 1])) {
          c = pv[pd + k + 1];
        } else {
          c = pv[pd + k - 1] + 1;
        }
        r = c - k;
        while (
          c < cols &&
          r < rows &&
          compare(
            currentNodes[currentStart + c],
            futureNodes[futureStart + r]
          )
        ) {
          c++;
          r++;
        }
        if (c === cols && r === rows) {
          break outer;
        }
        cv[d + k] = c;
      }
    }

    const diff = Array(d / 2 + length / 2);
    let diffIdx = diff.length - 1;
    for (d = v.length - 1; d >= 0; d--) {
      while (
        c > 0 &&
        r > 0 &&
        compare(
          currentNodes[currentStart + c - 1],
          futureNodes[futureStart + r - 1]
        )
      ) {
        // diagonal edge = equality
        diff[diffIdx--] = SKIP;
        c--;
        r--;
      }
      if (!d)
        break;
      pd = d - 1;
      /* istanbul ignore next */
      pv = d ? v[d - 1] : [0, 0];
      k = c - r;
      if (k === -d || (k !== d && pv[pd + k - 1] < pv[pd + k + 1])) {
        // vertical edge = insertion
        r--;
        diff[diffIdx--] = INSERTION;
      } else {
        // horizontal edge = deletion
        c--;
        diff[diffIdx--] = DELETION;
      }
    }
    return diff;
  };

  const applyDiff = (
    diff,
    get,
    parentNode,
    futureNodes,
    futureStart,
    currentNodes,
    currentStart,
    currentLength,
    before
  ) => {
    const live = new Map$1;
    const length = diff.length;
    let currentIndex = currentStart;
    let i = 0;
    while (i < length) {
      switch (diff[i++]) {
        case SKIP:
          futureStart++;
          currentIndex++;
          break;
        case INSERTION:
          // TODO: bulk appends for sequential nodes
          live.set(futureNodes[futureStart], 1);
          append(
            get,
            parentNode,
            futureNodes,
            futureStart++,
            futureStart,
            currentIndex < currentLength ?
              get(currentNodes[currentIndex], 0) :
              before
          );
          break;
        case DELETION:
          currentIndex++;
          break;
      }
    }
    i = 0;
    while (i < length) {
      switch (diff[i++]) {
        case SKIP:
          currentStart++;
          break;
        case DELETION:
          // TODO: bulk removes for sequential nodes
          if (live.has(currentNodes[currentStart]))
            currentStart++;
          else
            remove(
              get,
              parentNode,
              currentNodes,
              currentStart++,
              currentStart
            );
          break;
      }
    }
  };

  const findK = (ktr, length, j) => {
    let lo = 1;
    let hi = length;
    while (lo < hi) {
      const mid = ((lo + hi) / 2) >>> 0;
      if (j < ktr[mid])
        hi = mid;
      else
        lo = mid + 1;
    }
    return lo;
  };

  const smartDiff = (
    get,
    parentNode,
    futureNodes,
    futureStart,
    futureEnd,
    futureChanges,
    currentNodes,
    currentStart,
    currentEnd,
    currentChanges,
    currentLength,
    compare,
    before
  ) => {
    applyDiff(
      OND(
        futureNodes,
        futureStart,
        futureChanges,
        currentNodes,
        currentStart,
        currentChanges,
        compare
      ) ||
      HS(
        futureNodes,
        futureStart,
        futureEnd,
        futureChanges,
        currentNodes,
        currentStart,
        currentEnd,
        currentChanges
      ),
      get,
      parentNode,
      futureNodes,
      futureStart,
      currentNodes,
      currentStart,
      currentLength,
      before
    );
  };

  /*! (c) 2018 Andrea Giammarchi (ISC) */

  const domdiff = (
    parentNode,     // where changes happen
    currentNodes,   // Array of current items/nodes
    futureNodes,    // Array of future items/nodes
    options         // optional object with one of the following properties
                    //  before: domNode
                    //  compare(generic, generic) => true if same generic
                    //  node(generic) => Node
  ) => {
    if (!options)
      options = {};

    const compare = options.compare || eqeq;
    const get = options.node || identity;
    const before = options.before == null ? null : get(options.before, 0);

    const currentLength = currentNodes.length;
    let currentEnd = currentLength;
    let currentStart = 0;

    let futureEnd = futureNodes.length;
    let futureStart = 0;

    // common prefix
    while (
      currentStart < currentEnd &&
      futureStart < futureEnd &&
      compare(currentNodes[currentStart], futureNodes[futureStart])
    ) {
      currentStart++;
      futureStart++;
    }

    // common suffix
    while (
      currentStart < currentEnd &&
      futureStart < futureEnd &&
      compare(currentNodes[currentEnd - 1], futureNodes[futureEnd - 1])
    ) {
      currentEnd--;
      futureEnd--;
    }

    const currentSame = currentStart === currentEnd;
    const futureSame = futureStart === futureEnd;

    // same list
    if (currentSame && futureSame)
      return futureNodes;

    // only stuff to add
    if (currentSame && futureStart < futureEnd) {
      append(
        get,
        parentNode,
        futureNodes,
        futureStart,
        futureEnd,
        next(get, currentNodes, currentStart, currentLength, before)
      );
      return futureNodes;
    }

    // only stuff to remove
    if (futureSame && currentStart < currentEnd) {
      remove(
        get,
        parentNode,
        currentNodes,
        currentStart,
        currentEnd
      );
      return futureNodes;
    }

    const currentChanges = currentEnd - currentStart;
    const futureChanges = futureEnd - futureStart;
    let i = -1;

    // 2 simple indels: the shortest sequence is a subsequence of the longest
    if (currentChanges < futureChanges) {
      i = indexOf(
        futureNodes,
        futureStart,
        futureEnd,
        currentNodes,
        currentStart,
        currentEnd,
        compare
      );
      // inner diff
      if (-1 < i) {
        append(
          get,
          parentNode,
          futureNodes,
          futureStart,
          i,
          get(currentNodes[currentStart], 0)
        );
        append(
          get,
          parentNode,
          futureNodes,
          i + currentChanges,
          futureEnd,
          next(get, currentNodes, currentEnd, currentLength, before)
        );
        return futureNodes;
      }
    }
    /* istanbul ignore else */
    else if (futureChanges < currentChanges) {
      i = indexOf(
        currentNodes,
        currentStart,
        currentEnd,
        futureNodes,
        futureStart,
        futureEnd,
        compare
      );
      // outer diff
      if (-1 < i) {
        remove(
          get,
          parentNode,
          currentNodes,
          currentStart,
          i
        );
        remove(
          get,
          parentNode,
          currentNodes,
          i + futureChanges,
          currentEnd
        );
        return futureNodes;
      }
    }

    // common case with one replacement for many nodes
    // or many nodes replaced for a single one
    /* istanbul ignore else */
    if ((currentChanges < 2 || futureChanges < 2)) {
      append(
        get,
        parentNode,
        futureNodes,
        futureStart,
        futureEnd,
        get(currentNodes[currentStart], 0)
      );
      remove(
        get,
        parentNode,
        currentNodes,
        currentStart,
        currentEnd
      );
      return futureNodes;
    }

    // the half match diff part has been skipped in petit-dom
    // https://github.com/yelouafi/petit-dom/blob/bd6f5c919b5ae5297be01612c524c40be45f14a7/src/vdom.js#L391-L397
    // accordingly, I think it's safe to skip in here too
    // if one day it'll come out like the speediest thing ever to do
    // then I might add it in here too

    // Extra: before going too fancy, what about reversed lists ?
    //        This should bail out pretty quickly if that's not the case.
    if (
      currentChanges === futureChanges &&
      isReversed(
        futureNodes,
        futureEnd,
        currentNodes,
        currentStart,
        currentEnd,
        compare
      )
    ) {
      append(
        get,
        parentNode,
        futureNodes,
        futureStart,
        futureEnd,
        next(get, currentNodes, currentEnd, currentLength, before)
      );
      return futureNodes;
    }

    // last resort through a smart diff
    smartDiff(
      get,
      parentNode,
      futureNodes,
      futureStart,
      futureEnd,
      futureChanges,
      currentNodes,
      currentStart,
      currentEnd,
      currentChanges,
      currentLength,
      compare,
      before
    );

    return futureNodes;
  };

  /*! (c) Andrea Giammarchi - ISC */
  var importNode = (function (
    document,
    appendChild,
    cloneNode,
    createTextNode,
    importNode
  ) {
    var native = importNode in document;
    // IE 11 has problems with cloning templates:
    // it "forgets" empty childNodes. This feature-detects that.
    var fragment = document.createDocumentFragment();
    fragment[appendChild](document[createTextNode]('g'));
    fragment[appendChild](document[createTextNode](''));
    var content = native ?
      document[importNode](fragment, true) :
      fragment[cloneNode](true);
    return content.childNodes.length < 2 ?
      function importNode(node, deep) {
        var clone = node[cloneNode]();
        for (var
          childNodes = node.childNodes || [],
          length = childNodes.length,
          i = 0; deep && i < length; i++
        ) {
          clone[appendChild](importNode(childNodes[i], deep));
        }
        return clone;
      } :
      (native ?
        document[importNode] :
        function (node, deep) {
          return node[cloneNode](!!deep);
        }
      );
  }(
    document,
    'appendChild',
    'cloneNode',
    'createTextNode',
    'importNode'
  ));

  var trim = ''.trim || function () {
    return String(this).replace(/^\s+|\s+/g, '');
  };

  // Custom
  var UID = '-' + Math.random().toFixed(6) + '%';
  //                           Edge issue!
  if (!(function (template, content, tabindex) {
    return content in template && (
      (template.innerHTML = '<p ' + tabindex + '="' + UID + '"></p>'),
      template[content].childNodes[0].getAttribute(tabindex) == UID
    );
  }(document.createElement('template'), 'content', 'tabindex'))) {
    UID = '_dt: ' + UID.slice(1, -1) + ';';
  }
  var UIDC = '<!--' + UID + '-->';

  // DOM
  var COMMENT_NODE = 8;
  var ELEMENT_NODE = 1;
  var TEXT_NODE = 3;

  var SHOULD_USE_TEXT_CONTENT = /^(?:style|textarea)$/i;
  var VOID_ELEMENTS = /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i;

  function sanitize (template) {
    return template.join(UIDC)
            .replace(selfClosing, fullClosing)
            .replace(attrSeeker, attrReplacer);
  }

  var spaces = ' \\f\\n\\r\\t';
  var almostEverything = '[^ ' + spaces + '\\/>"\'=]+';
  var attrName = '[ ' + spaces + ']+' + almostEverything;
  var tagName = '<([A-Za-z]+[A-Za-z0-9:_-]*)((?:';
  var attrPartials = '(?:\\s*=\\s*(?:\'[^\']*?\'|"[^"]*?"|<[^>]*?>|' + almostEverything + '))?)';

  var attrSeeker = new RegExp(tagName + attrName + attrPartials + '+)([ ' + spaces + ']*/?>)', 'g');
  var selfClosing = new RegExp(tagName + attrName + attrPartials + '*)([ ' + spaces + ']*/>)', 'g');
  var findAttributes = new RegExp('(' + attrName + '\\s*=\\s*)([\'"]?)' + UIDC + '\\2', 'gi');

  function attrReplacer($0, $1, $2, $3) {
    return '<' + $1 + $2.replace(findAttributes, replaceAttributes) + $3;
  }

  function replaceAttributes($0, $1, $2) {
    return $1 + ($2 || '"') + UID + ($2 || '"');
  }

  function fullClosing($0, $1, $2) {
    return VOID_ELEMENTS.test($1) ? $0 : ('<' + $1 + $2 + '></' + $1 + '>');
  }

  function create$1(type, node, path, name) {
    return {name: name, node: node, path: path, type: type};
  }

  function find$1(node, path) {
    var length = path.length;
    var i = 0;
    while (i < length)
      node = node.childNodes[path[i++]];
    return node;
  }

  function parse(node, holes, parts, path) {
    var childNodes = node.childNodes;
    var length = childNodes.length;
    var i = 0;
    while (i < length) {
      var child = childNodes[i];
      switch (child.nodeType) {
        case ELEMENT_NODE:
          var childPath = path.concat(i);
          parseAttributes(child, holes, parts, childPath);
          parse(child, holes, parts, childPath);
          break;
        case COMMENT_NODE:
          if (child.textContent === UID) {
            parts.shift();
            holes.push(
              // basicHTML or other non standard engines
              // might end up having comments in nodes
              // where they shouldn't, hence this check.
              SHOULD_USE_TEXT_CONTENT.test(node.nodeName) ?
                create$1('text', node, path) :
                create$1('any', child, path.concat(i))
            );
          }
          break;
        case TEXT_NODE:
          // the following ignore is actually covered by browsers
          // only basicHTML ends up on previous COMMENT_NODE case
          // instead of TEXT_NODE because it knows nothing about
          // special style or textarea behavior
          /* istanbul ignore if */
          if (
            SHOULD_USE_TEXT_CONTENT.test(node.nodeName) &&
            trim.call(child.textContent) === UIDC
          ) {
            parts.shift();
            holes.push(create$1('text', node, path));
          }
          break;
      }
      i++;
    }
  }

  function parseAttributes(node, holes, parts, path) {
    var cache = new Map$1;
    var attributes = node.attributes;
    var remove = [];
    var array = remove.slice.call(attributes, 0);
    var length = array.length;
    var i = 0;
    while (i < length) {
      var attribute = array[i++];
      if (attribute.value === UID) {
        var name = attribute.name;
        // the following ignore is covered by IE
        // and the IE9 double viewBox test
        /* istanbul ignore else */
        if (!cache.has(name)) {
          var realName = parts.shift().replace(/^(?:|[\S\s]*?\s)(\S+?)\s*=\s*['"]?$/, '$1');
          var value = attributes[realName] ||
                        // the following ignore is covered by browsers
                        // while basicHTML is already case-sensitive
                        /* istanbul ignore next */
                        attributes[realName.toLowerCase()];
          cache.set(name, value);
          holes.push(create$1('attr', value, path, realName));
        }
        remove.push(attribute);
      }
    }
    length = remove.length;
    i = 0;
    while (i < length) {
      // Edge HTML bug #16878726
      var attr = remove[i++];
      if (/^id$/i.test(attr.name))
        node.removeAttribute(attr.name);
      // standard browsers would work just fine here
      else
        node.removeAttributeNode(attr);
    }

    // This is a very specific Firefox/Safari issue
    // but since it should be a not so common pattern,
    // it's probably worth patching regardless.
    // Basically, scripts created through strings are death.
    // You need to create fresh new scripts instead.
    // TODO: is there any other node that needs such nonsense?
    var nodeName = node.nodeName;
    if (/^script$/i.test(nodeName)) {
      // this used to be like that
      // var script = createElement(node, nodeName);
      // then Edge arrived and decided that scripts created
      // through template documents aren't worth executing
      // so it became this ... hopefully it won't hurt in the wild
      var script = document.createElement(nodeName);
      length = attributes.length;
      i = 0;
      while (i < length)
        script.setAttributeNode(attributes[i++].cloneNode(true));
      script.textContent = node.textContent;
      node.parentNode.replaceChild(script, node);
    }
  }

  // globals

  var parsed = new WeakMap$1;
  var referenced = new WeakMap$1;

  function createInfo(options, template) {
    var markup = sanitize(template);
    var transform = options.transform;
    if (transform)
      markup = transform(markup);
    var content = createContent(markup, options.type);
    cleanContent(content);
    var holes = [];
    parse(content, holes, template.slice(0), []);
    var info = {
      content: content,
      updates: function (content) {
        var callbacks = [];
        var len = holes.length;
        var i = 0;
        while (i < len) {
          var info = holes[i++];
          var node = find$1(content, info.path);
          switch (info.type) {
            case 'any':
              callbacks.push(options.any(node, []));
              break;
            case 'attr':
              callbacks.push(options.attribute(node, info.name, info.node));
              break;
            case 'text':
              callbacks.push(options.text(node));
              node.textContent = '';
              break;
          }
        }
        return function () {
          var length = arguments.length;
          var values = length - 1;
          var i = 1;
          if (len !== values) {
            throw new Error(
              values + ' values instead of ' + len + '\n' +
              template.join(', ')
            );
          }
          while (i < length)
            callbacks[i - 1](arguments[i++]);
          return content;
        };
      }
    };
    parsed.set(template, info);
    return info;
  }

  function createDetails(options, template) {
    var info = parsed.get(template) || createInfo(options, template);
    var content = importNode.call(document, info.content, true);
    var details = {
      content: content,
      template: template,
      updates: info.updates(content)
    };
    referenced.set(options, details);
    return details;
  }

  function domtagger(options) {
    return function (template) {
      var details = referenced.get(options);
      if (details == null || details.template !== template)
        details = createDetails(options, template);
      details.updates.apply(null, arguments);
      return details.content;
    };
  }

  function cleanContent(fragment) {
    var childNodes = fragment.childNodes;
    var i = childNodes.length;
    while (i--) {
      var child = childNodes[i];
      if (
        child.nodeType !== 1 &&
        trim.call(child.textContent).length === 0
      ) {
        fragment.removeChild(child);
      }
    }
  }

  /*! (c) Andrea Giammarchi - ISC */
  var hyperStyle = (function (){  // from https://github.com/developit/preact/blob/33fc697ac11762a1cb6e71e9847670d047af7ce5/src/varants.js
    var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
    var hyphen = /([^A-Z])([A-Z]+)/g;
    return function hyperStyle(node, original) {
      return 'ownerSVGElement' in node ? svg(node, original) : update(node.style, false);
    };
    function ized($0, $1, $2) {
      return $1 + '-' + $2.toLowerCase();
    }
    function svg(node, original) {
      var style;
      if (original)
        style = original.cloneNode(true);
      else {
        node.setAttribute('style', '--hyper:style;');
        style = node.getAttributeNode('style');
      }
      style.value = '';
      node.setAttributeNode(style);
      return update(style, true);
    }
    function toStyle(object) {
      var key, css = [];
      for (key in object)
        css.push(key.replace(hyphen, ized), ':', object[key], ';');
      return css.join('');
    }
    function update(style, isSVG) {
      var oldType, oldValue;
      return function (newValue) {
        var info, key, styleValue, value;
        switch (typeof newValue) {
          case 'object':
            if (newValue) {
              if (oldType === 'object') {
                if (!isSVG) {
                  if (oldValue !== newValue) {
                    for (key in oldValue) {
                      if (!(key in newValue)) {
                        style[key] = '';
                      }
                    }
                  }
                }
              } else {
                if (isSVG)
                  style.value = '';
                else
                  style.cssText = '';
              }
              info = isSVG ? {} : style;
              for (key in newValue) {
                value = newValue[key];
                styleValue = typeof value === 'number' &&
                                    !IS_NON_DIMENSIONAL.test(key) ?
                                    (value + 'px') : value;
                if (!isSVG && /^--/.test(key))
                  info.setProperty(key, styleValue);
                else
                  info[key] = styleValue;
              }
              oldType = 'object';
              if (isSVG)
                style.value = toStyle((oldValue = info));
              else
                oldValue = newValue;
              break;
            }
          default:
            if (oldValue != newValue) {
              oldType = 'string';
              oldValue = newValue;
              if (isSVG)
                style.value = newValue || '';
              else
                style.cssText = newValue || '';
            }
            break;
        }
      };
    }
  }());

  const OWNER_SVG_ELEMENT = 'ownerSVGElement';

  // returns nodes from wires and components
  const asNode = (item, i) => item.nodeType === wireType ?
    (
      (1 / i) < 0 ?
        (i ? item.remove(true) : item.lastChild) :
        (i ? item.valueOf(true) : item.firstChild)
    ) :
    item
  ;

  // returns true if domdiff can handle the value
  const canDiff = value => 'ELEMENT_NODE' in value;

  // generic attributes helpers
  const hyperAttribute = (node, original) => {
    let oldValue;
    let owner = false;
    const attribute = original.cloneNode(true);
    return newValue => {
      if (oldValue !== newValue) {
        oldValue = newValue;
        if (attribute.value !== newValue) {
          if (newValue == null) {
            if (owner) {
              owner = false;
              node.removeAttributeNode(attribute);
            }
            attribute.value = newValue;
          } else {
            attribute.value = newValue;
            if (!owner) {
              owner = true;
              node.setAttributeNode(attribute);
            }
          }
        }
      }
    };
  };

  // events attributes helpers
  const hyperEvent = (node, name) => {
    let oldValue;
    let type = name.slice(2);
    if (name.toLowerCase() in node)
      type = type.toLowerCase();
    return newValue => {
      if (oldValue !== newValue) {
        if (oldValue)
          node.removeEventListener(type, oldValue, false);
        oldValue = newValue;
        if (newValue)
          node.addEventListener(type, newValue, false);
      }
    };
  };

  // special attributes helpers
  const hyperProperty = (node, name) => {
    let oldValue;
    return newValue => {
      if (oldValue !== newValue) {
        oldValue = newValue;
        if (node[name] !== newValue) {
          node[name] = newValue;
          if (newValue == null) {
            node.removeAttribute(name);
          }
        }
      }
    };
  };

  // special hooks helpers
  const hyperRef = node => {
    return ref => {
      ref.current = node;
    };
  };

  // list of attributes that should not be directly assigned
  const readOnly = /^(?:form|list)$/i;

  // reused every slice time
  const slice = [].slice;

  // simplifies text node creation
  const text = (node, text) => node.ownerDocument.createTextNode(text);

  function Tagger(type) {
    this.type = type;
    return domtagger(this);
  }

  Tagger.prototype = {

    // there are four kind of attributes, and related behavior:
    //  * events, with a name starting with `on`, to add/remove event listeners
    //  * special, with a name present in their inherited prototype, accessed directly
    //  * regular, accessed through get/setAttribute standard DOM methods
    //  * style, the only regular attribute that also accepts an object as value
    //    so that you can style=${{width: 120}}. In this case, the behavior has been
    //    fully inspired by Preact library and its simplicity.
    attribute(node, name, original) {
      switch (name) {
        case 'class':
          if (OWNER_SVG_ELEMENT in node)
            return hyperAttribute(node, original);
          name = 'className';
        case 'data':
        case 'props':
          return hyperProperty(node, name);
        case 'style':
          return hyperStyle(node, original, OWNER_SVG_ELEMENT in node);
        case 'ref':
          return hyperRef(node);
        default:
          if (name.slice(0, 2) === 'on')
            return hyperEvent(node, name);
          if (name in node && !(
            OWNER_SVG_ELEMENT in node || readOnly.test(name)
          ))
            return hyperProperty(node, name);
          return hyperAttribute(node, original);

      }
    },

    // in a hyper(node)`<div>${content}</div>` case
    // everything could happen:
    //  * it's a JS primitive, stored as text
    //  * it's null or undefined, the node should be cleaned
    //  * it's a promise, update the content once resolved
    //  * it's an explicit intent, perform the desired operation
    //  * it's an Array, resolve all values if Promises and/or
    //    update the node with the resulting list of content
    any(node, childNodes) {
      const diffOptions = {node: asNode, before: node};
      const nodeType = OWNER_SVG_ELEMENT in node ? /* istanbul ignore next */ 'svg' : 'html';
      let fastPath = false;
      let oldValue;
      const anyContent = value => {
        switch (typeof value) {
          case 'string':
          case 'number':
          case 'boolean':
            if (fastPath) {
              if (oldValue !== value) {
                oldValue = value;
                childNodes[0].textContent = value;
              }
            } else {
              fastPath = true;
              oldValue = value;
              childNodes = domdiff(
                node.parentNode,
                childNodes,
                [text(node, value)],
                diffOptions
              );
            }
            break;
          case 'function':
            anyContent(value(node));
            break;
          case 'object':
          case 'undefined':
            if (value == null) {
              fastPath = false;
              childNodes = domdiff(
                node.parentNode,
                childNodes,
                [],
                diffOptions
              );
              break;
            }
          default:
            fastPath = false;
            oldValue = value;
            if (isArray(value)) {
              if (value.length === 0) {
                if (childNodes.length) {
                  childNodes = domdiff(
                    node.parentNode,
                    childNodes,
                    [],
                    diffOptions
                  );
                }
              } else {
                switch (typeof value[0]) {
                  case 'string':
                  case 'number':
                  case 'boolean':
                    anyContent(String(value));
                    break;
                  case 'function':
                    anyContent(value.map(invoke, node));
                    break;
                  case 'object':
                    if (isArray(value[0])) {
                      value = value.concat.apply([], value);
                    }
                  default:
                    childNodes = domdiff(
                      node.parentNode,
                      childNodes,
                      value,
                      diffOptions
                    );
                    break;
                }
              }
            } else if (canDiff(value)) {
              childNodes = domdiff(
                node.parentNode,
                childNodes,
                value.nodeType === 11 ?
                  slice.call(value.childNodes) :
                  [value],
                diffOptions
              );
            } else if ('text' in value) {
              anyContent(String(value.text));
            } else if ('any' in value) {
              anyContent(value.any);
            } else if ('html' in value) {
              childNodes = domdiff(
                node.parentNode,
                childNodes,
                slice.call(
                  createContent(
                    [].concat(value.html).join(''),
                    nodeType
                  ).childNodes
                ),
                diffOptions
              );
            } else if ('length' in value) {
              anyContent(slice.call(value));
            }
            break;
        }
      };
      return anyContent;
    },

    // style or textareas don't accept HTML as content
    // it's pointless to transform or analyze anything
    // different from text there but it's worth checking
    // for possible defined intents.
    text(node) {
      let oldValue;
      const textContent = value => {
        if (oldValue !== value) {
          oldValue = value;
          const type = typeof value;
          if (type === 'object' && value) {
            if ('text' in value) {
              textContent(String(value.text));
            } else if ('any' in value) {
              textContent(value.any);
            } else if ('html' in value) {
              textContent([].concat(value.html).join(''));
            } else if ('length' in value) {
              textContent(slice.call(value).join(''));
            }
          } else if (type === 'function') {
            textContent(value(node));
          } else {
            node.textContent = value == null ? '' : value;
          }
        }
      };
      return textContent;
    }
  };

  function invoke(callback) {
    return callback(this);
  }

  const wm = new WeakMap$1;
  const container = new WeakMap$1;

  let current$1 = null;

  // can be used with any useRef hook
  // returns an `html` and `svg` function
  const hook = useRef => ({
    html: createHook(useRef, html),
    svg: createHook(useRef, svg)
  });

  // generic content render
  function render(node, callback) {
    const value = update.call(this, node, callback);
    if (container.get(node) !== value) {
      container.set(node, value);
      appendClean(node, value);
    }
    return node;
  }

  // keyed render via render(node, () => html`...`)
  // non keyed renders in the wild via html`...`
  const html = outer$1('html');
  const svg = outer$1('svg');

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function appendClean(node, fragment) {
    node.textContent = '';
    node.appendChild(fragment);
  }

  function asNode$1(result, forceFragment) {
    return result.nodeType === wireType ?
      result.valueOf(forceFragment) :
      result;
  }

  function createHook(useRef, view) {
    return function () {
      const ref = useRef(null);
      if (ref.current === null)
        ref.current = view.for(ref);
      return asNode$1(ref.current.apply(null, arguments), false);
    };
  }

  function outer$1(type) {
    const wm = new WeakMap$1;
    tag.for = (identity, id) => {
      const ref = wm.get(identity) || set(identity);
      if (id == null)
        id = '$';
      return ref[id] || create(ref, id);
    };
    return tag;
    function create(ref, id) {
      let wire = null;
      const $ = new Tagger(type);
      return (ref[id] = function () {
        const result = $.apply(null, tta.apply(null, arguments));
        return wire || (wire = wiredContent(result));
      });
    }
    function set(identity) {
      const ref = {'$': null};
      wm.set(identity, ref);
      return ref;
    }
    function tag() {
      const args = tta.apply(null, arguments);
      return current$1 ?
        new Hole(type, args) :
        new Tagger(type).apply(null, args);
    }
  }

  function set$1(node) {
    const info = {
      i: 0, length: 0,
      stack: [],
      update: false
    };
    wm.set(node, info);
    return info;
  }

  function update(reference, callback) {
    const prev = current$1;
    current$1 = wm.get(reference) || set$1(reference);
    current$1.i = 0;
    const ret = callback.call(this);
    let value;
    if (ret instanceof Hole) {
      value = asNode$1(unroll(ret, 0), current$1.update);
      const {i, length, stack, update} = current$1;
      if (i < length)
        stack.splice(current$1.length = i);
      if (update)
        current$1.update = false;
    } else {
      value = asNode$1(ret, false);
    }
    current$1 = prev;
    return value;
  }

  function unroll(hole, level) {
    const {i, length, stack} = current$1;
    const {type, args} = hole;
    const stacked = i < length;
    current$1.i++;
    if (!stacked)
      current$1.length = stack.push({
        l: level,
        kind: type,
        tag: null,
        tpl: args[0],
        wire: null
      });
    unrollArray(args, 1, level + 1);
    const info = stack[i];
    if (stacked) {
      const {l:control, kind, tag, tpl, wire} = info;
      if (control === level && type === kind && tpl === args[0]) {
        tag.apply(null, args);
        return wire;
      }
    }
    const tag = new Tagger(type);
    const wire = wiredContent(tag.apply(null, args));
    info.l = level;
    info.kind = type;
    info.tag = tag;
    info.tpl = args[0];
    info.wire = wire;
    if (i < 1)
      current$1.update = true;
    return wire;
  }

  function unrollArray(arr, i, level) {
    for (const {length} = arr; i < length; i++) {
      const value = arr[i];
      if (typeof value === 'object' && value) {
        if (value instanceof Hole) {
          arr[i] = unroll(value, level - 1);
        } else if (isArray(value)) {
          arr[i] = unrollArray(value, 0, level++);
        }
      }
    }
    return arr;
  }

  function wiredContent(node) {
    const childNodes = node.childNodes;
    const {length} = childNodes;
    return length === 1 ?
      childNodes[0] :
      (length ? new Wire(childNodes) : node);
  }

  function Hole(type, args) {
    this.type = type;
    this.args = args;
  }

  const {html: html$1, svg: svg$1} = hook(useRef);

  var hookable = fn => augmentor(function () {
    const {current: info} = useRef({i: 0, $: []});
    const {i, $} = info;
    useEffect$1(() => {
      const {i, $} = info;
      if (i > $.length)
        $.splice(i);
      info.i = 0;
    });
    info.i++;
    if (i === $.length)
      $.push(augmentor(fn));
    return $[i].apply(this, arguments);
  });

  const App = hookable(() => {
    /* -------------    Setup   ------------- */

    const startingPoint = new URLSearchParams(window.location.search).get("find") ||
      "youtube-yBG10jlo9X0"; // Crash Course World Mythology #24: Ragnarok

    const [destination, setDestination] = useState(startingPoint);
    const [identifier, setIdentifier] = useState(destination);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [metadataPairs, setMetadataPairs] = useState([]);
    const [videoData, setVideoData] = useState(async () => {
      const resp = await fetch(`https://archive.org/metadata/${identifier}`);
      const json = await resp.json();
      return await json
    });

    const [relatedData, setRelatedData] = useState(async () => {
      const resp = await fetch(`https://be-api.us.archive.org/mds/v1/get_related/all/${identifier}`);
      const json = await resp.json();
      return await json;
    });
    const [errorMsg, setErrorMsg] = useState('');

    window.history.pushState({}, '', `?find=${identifier}`);

    /* -------------  Callbacks ------------- */

    async function fetchMetadata() {
      let metadataReq = fetch(`https://archive.org/metadata/${destination}`);
      metadataReq = await metadataReq;
      const metadataJson = await metadataReq.json();

      let relatedReq = fetch(`https://be-api.us.archive.org/mds/v1/get_related/all/${destination}`);
      relatedReq = await relatedReq;
      const relatedJson = await relatedReq.json();

      const {metadata: {title, description, ...metaRest}} = metadataJson;
      setTitle(title);
      setDescription(description);
      setMetadataPairs(Object.entries(metaRest));

      Promise
        .all(urls.map(url => fetch(url)))
        .then(async (responses) => {
          const promises = Promise.all(responses.map(r => r.json()));
          const [videoData, relatedData] = await promises;
          setErrorMsg('');
          setVideoData(await videoData);
          setRelatedData(awaitrelatedData);
          setIdentifier(destination);
          window.history.pushState({}, '', `?find=${identifier}`);
        })
        .catch(error => setErrorMsg("It looks like that wasn't in the archive. Make sure your identifier is correct."));
    }

    /* ------------- Components ------------- */

    const ErrorMessage = hookable(() => html$1`<div style=${{
    display: errorMsg === '' ? "none" : "block",
    position: "relative",
    top: -316,
    width: 512,
    height: 200
  }} class="error-message">${errorMsg}</div>
  `);

    const VideoDetails = hookable(() => html$1`
    <div class="details">
      <div>
        <h1>${title}</h1>
        <p>${description}</p>
      </div>
      <div>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            ${metadataPairs.map(([key, value]) => html$1`
              <tr>
                <td>${key}</td>
                <td>${JSON.stringify(value)}</td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    </div>
  `);

    // const RelatedVideos = hookable(async () => {
    //   const {hits: {hits: items}} = await relatedData;
    //   // debugger;
    //   const relatedVideos = items
    //     .map((item) => {
    //       const {_id: id, _source: {title: [title], description: [description]}} = item
    //       debugger;
    //       return html`
    //         <li>
    //           <a title=${description} onclick=${(event) => {
    //             event.preventDefault();
    //             setIdentifier(id);
    //             fetchMetadata();
    //           }}>
    //             <img src=${`https://archive.org/services/img/${id}`} height=80 width=120 />
    //             <span>${title}</span>
    //           </a>
    //         </li>
    //       `
    //     });
    //   // debugger;
    //   return html`
    //     <ul style=${{
    //       display: 'inline-block',
    //       height: 640,
    //       width: 220,
    //       backgroundColor: 'rgb(20, 20, 20)',
    //       color: '#FFF',
    //       textDecoration: 'none'
    //     }}>
    //       ${relatedVideos}
    //     </ul>
    //   `
    // });

    const Lookup = hookable(() => html$1`
    <div class="lookup">
      <form onsubmit=${(event) => {event.preventDefault(); fetchMetadata();}}>
        I want to see
        <span>
          archive.org/details/
          <input type="text" placeholder=${identifier} onchange=${({currentTarget: {value}}) => setDestination(value)} />
        </span>
      </form>
    </div>
  `);

    const VideoPlayer = hookable(() => html$1`
    <div style=${{
      display: 'flex',
      flexDirection: 'row',
    }}>
      <iframe
        src=${`https://archive.org/embed/${identifier}`}
        width="640"
        height="480"
        frameborder="0"
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
        playlist="1"
        allowfullscreen></iframe>
      ${ErrorMessage()}
    </div>
  `);

    return html$1`
    <div style=${{
        display: 'flex',
        flexDirection: 'column'
      }}>
      ${Lookup()}
      ${VideoPlayer()}
      ${VideoDetails()}
    </div>
  `;

  });

  render(document.body, App);

}());
//# sourceMappingURL=bundle.js.map
