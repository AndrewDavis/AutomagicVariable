window.onload = function() {
    globalThis.HTML = document.getElementsByTagName('*');
    globalThis.print = function(printMe) {
        HTML.outputPre.innerHTML += printMe;
    };
    globalThis.printLine = function(printMe = '') {
        HTML.outputPre.innerHTML += printMe + '\n';
    };
    globalThis.alignRight = function(alignMe, amount) {
        return alignMe.padStart(amount);
    };
    globalThis.alignLeft = function(alignMe, amount) {
        return alignMe.padEnd(amount);
    };
    globalThis.alignInfo = function(alignMe) {
        return alignRight(alignMe, 35);
    };

    [ globalThis.avm, globalThis.config ] = new AVMap();
    printLine(alignInfo('Detect AVMap: ') + (typeof(avm._avMap) !== 'undefined' ? 'is AVMap' : 'is AVMap'));
    //printLine(alignInfo('Get avm property name: ') + avm._configPropertyName);
    config.var.val(10);
    printLine(alignInfo('Detect AV: ') + (config.var.exists() ? 'is AV' : 'not AV'));
    //printLine(alignInfo('Get AV property name: ') + config.var.get()._name);
    print(alignInfo('Testing reserved: '));
    try {
        config._config.val(0);
    } catch (e) {
        printLine(e);
    }
    printLine(alignInfo('Testing delete: ') + (delete config.var));
    printLine(alignInfo('Testing delete: ') + (delete config.var));
    printLine();

    config.constVar.const(7);
    print(alignInfo('Changing constVar: '));
    try {
        avm.constVar = 10;
    } catch (e) {
        printLine(e);
    }
    printLine(alignInfo('constVar: ') + avm.constVar);
    config.a.val(avm.constVar);
    config.b.auto(function(self) {
        self.value = avm.a + 2;
    });
    printLine(alignInfo('Initial a, b: ') + avm.a + ', ' + avm.b);
    avm.a = 8;
    printLine(alignInfo('Changed a to 8: ') + avm.a + ', ' + avm.b);
    config.c.autoOnly(function(self) { self.value = avm.a; });
    printLine(alignInfo('Referenced a by c: ') + avm.c);
    printLine();

    config.arr.val([]);
    config.last.auto(function(self) {
        if (avm.arr.length == 0) {
            self.value = null;
        } else {
            self.value = avm.arr[avm.arr.length - 1];
        }
    });
    printLine(alignInfo('Initial array + last element: ') + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 16) + 'last: ' + JSON.stringify(avm.last));
    avm.arr.push(5, 6, 7, 8);
    printLine(alignInfo('Pushed onto array: ') + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 16) + 'last: ' + JSON.stringify(avm.last));
    config.arr.touched();
    printLine(alignInfo('Marked array dirty: ') + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 16) + 'last: ' + JSON.stringify(avm.last));
    avm.arr = [];
    printLine(alignInfo('Cleared array: ') + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 16) + 'last: ' + JSON.stringify(avm.last));
    avm.arr.push(5, 6);
    printLine(alignInfo('Pushed onto array: ') + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 16) + 'last: ' + JSON.stringify(avm.last));
    config.last.recompute();
    printLine(alignInfo('Recomputed last: ') + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 16) + 'last: ' + JSON.stringify(avm.last));
    printLine();

    config.set.val(new Set());
    config.sum.auto(function(self) {
        let sum = 0.0;
        let set = avm.set;
        for (let item of set) {
            sum += item;
        }
        self.value = sum;
    });
    printLine(alignInfo('Initial set and sum: ') + JSON.stringify(Array.from(avm.set)) + ', ' + avm.sum);
    avm.set.add(5);
    avm.set.add(6);
    avm.set.add(7);
    printLine(alignInfo('Added to set: ') + JSON.stringify(Array.from(avm.set)) + ', ' + avm.sum);
    config.set.touched();
    printLine(alignInfo('Marked set dirty: ') + JSON.stringify(Array.from(avm.set)) + ', ' + avm.sum);
    printLine();

    config.map.val(new Map());
    printLine(alignInfo('Initial map: ') + JSON.stringify(Array.from(avm.map)));
    avm.map.set(5, '!');
    avm.map.set(6, '!');
    avm.map.set(7, '!');
    printLine(alignInfo('Added to map: ') + JSON.stringify(Array.from(avm.map)));
    printLine();

    config.i.val(0);
    config.j.auto(function(self) {
        self.value = avm.i + 1;
    });
    config.k.auto(function(self) {
        self.value = avm.j + 1;
    });
    printLine(alignInfo('Initial i, j, k: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    avm.j = 20;
    printLine(alignInfo('Changed j (auto with ignore): ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    print(alignInfo('Revising j without deleting: '));
    try {
        config.j.autoVal(function(self, newValue) {
            self.value = avm.i + 1;
        });
    } catch (e) {
        printLine(e);
    }
    delete config.j;
    config.j.autoVal(function(self, newValue) {
        self.value = avm.i + 1;
    });
    printLine(alignInfo('Deleted and revised j (autoVal): ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    avm.j = 20;
    printLine(alignInfo('Changed j: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    avm.i = 5;
    printLine(alignInfo('Changed i: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    delete config.j;
    config.j.autoOnly(function(self, newValue) {
        self.value = avm.i + 1;
    });
    printLine(alignInfo('Deleted and revised j (autoOnly): ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    print(alignInfo('Changing j: '));
    try {
        avm.j = 20;
    } catch (e) {
        printLine(e);
    }
    avm.i = 100;
    printLine(alignInfo('Changed i: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    delete config.k;
    printLine(alignInfo('Deleted k: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    delete config.k;
    printLine(alignInfo('Deleted k again: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    avm.i = 0;
    printLine(alignInfo('Changed i: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    delete config.i;
    printLine(alignInfo('Deleted i: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    config.i.val(0);
    printLine(alignInfo('Recreated i: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    delete config.k;
    config.k.autoVal(function(self, newValue) {
        self.value = avm.j + 1;
    });
    printLine(alignInfo('Recreated k: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    delete config.j;
    config.j.autoVal(function(self, newValue) {
        self.value = avm.i + 1;
    });
    printLine(alignInfo('Recreated j: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    printLine();

    config.valid.auto(function(self, newValue) {
        if (newValue != null) {
            self.value = newValue;
        }
    });
    printLine(alignInfo('Initial valid (unset): ') + avm.valid);
    avm.valid = 7;
    printLine(alignInfo('Set valid to 7: ') + avm.valid);
    avm.valid = null;
    printLine(alignInfo('Set valid to null: ') + avm.valid);
    printLine();

    [ globalThis.otherAVM, otherConfig ] = new AVMap();
    config.first.val(10);
    otherConfig.second.auto(function(self) {
        self.value = avm.first + 1;
    });
    printLine(alignInfo('Testing 2 AVM\'s: ') + avm.first + ', ' + otherAVM.second);
    printLine();

    //Throws recursion errors and thus breaks the rest of the tests.
    //try {
    //    print(alignInfo('Invoking recursion: '));
    //    //Throws recursion error.
    //    config.recursion.autoOnly(function(self) {
    //        self.value = avm.recursion + 1;
    //    });
    //} catch (e) {
    //    printLine(e);
    //}
    //try {
    //    config.recursion1.auto(function(self) {
    //        self.value = avm.recursion2;
    //    });
    //    config.recursion2.auto(function(self) {
    //        self.value = avm.recursion1;
    //    });
    //    print(alignInfo('Invoking dual recursion: '));
    //    //Throws recursion error.
    //    avm.recursion1 = 10;
    //} catch (e) {
    //    printLine(e);
    //}
    //printLine();

    c = new (class {
        constructor() {
            this.property = 'class property';
            config.classFuncUnbound = function() {
                return this.property;
            }
            config.classFuncBound = function() {
                return this.property;
            }.bind(this);
        }
    })();
    printLine(alignInfo('Class function unbound: ') + avm.classFuncUnbound());
    printLine(alignInfo('Class function bound: ') + avm.classFuncBound());
    let classFuncBound = avm.classFuncBound;
    printLine(alignInfo('Got first then called: ') + classFuncBound());
    printLine();

    config.nestedAVM.val(new AVMap()[0]);
    avm.nestedAVM._config.a = 10;
    avm.nestedAVM._config.b.auto(function(self) {
        self.value = avm.nestedAVM.a * 2;
    });
    printLine(alignInfo('Nested AVM initial a, b: ') + avm.nestedAVM.a + ', ' + avm.nestedAVM.b);
    avm.nestedAVM.a = 15;
    printLine(alignInfo('Nested AVM changed a: ') + avm.nestedAVM.a + ', ' + avm.nestedAVM.b);
    avm.nestedAVM = 'str';
    printLine(alignInfo('Reassign nested AVM: ') + avm.nestedAVM);
    printLine();
    printLine();

    config.w.val(0);
    config.x.auto(function(self) {
        self.value = avm.w + 1;
    });
    config.y.auto(function(self) {
        self.value = avm.x + 1;
    });
    config.z.auto(function(self) {
        self.value = avm.y + 1;
    });
    otherConfig.z.auto(function(self) {
        self.value = avm.y + 1;
    });
    otherConfig.combo.autoOnly(function(self) {
        self.value = (avm.w ? avm.w : 0) + (avm.x ? avm.x : 0) + (avm.y ? avm.y : 0) + (avm.z ? avm.z : 0) +
            (otherAVM.z ? otherAVM.z : 0);
    });
    function getWXYZZCombo() {
        return '  ' + alignLeft('w: ' + avm.w + ', ', 8) + alignLeft('x: ' + avm.x + ', ', 15) +
            alignLeft('y: ' + avm.y + ', ', 15) + alignLeft('z: ' + avm.z + ', ', 15) +
            alignLeft('other Z: ' + otherAVM.z + ', ', 22) + 'combo sum: ' + otherAVM.combo;
    }
    printLine(alignInfo('Initial w, x, y, z, z, and combo: ') + getWXYZZCombo());
    ++avm.w;
    printLine(alignInfo('Incremented w: ') + getWXYZZCombo());
    delete config.y;
    printLine(alignInfo('Deleted y: ') + getWXYZZCombo());
    ++avm.w;
    printLine(alignInfo('Incremented w: ') + getWXYZZCombo());
    delete config.x;
    printLine(alignInfo('Deleted x: ') + getWXYZZCombo());
    delete config.z;
    printLine(alignInfo('Deleted z: ') + getWXYZZCombo());
    delete otherConfig.z;
    printLine(alignInfo('Deleted other Z: ') + getWXYZZCombo());
    config.x.auto(function(self) {
        self.value = avm.w + 2;
    });
    printLine(alignInfo('Recreated x (w + 2): ') + getWXYZZCombo());
    ++avm.w;
    printLine(alignInfo('Incremented w: ') + getWXYZZCombo());
    config.y.auto(function(self) {
        self.value = avm.x + 2;
    });
    printLine(alignInfo('Recreated y (x + 2): ') + getWXYZZCombo());
    ++avm.w;
    printLine(alignInfo('Incremented w: ') + getWXYZZCombo());
    config.z.auto(function(self) {
        self.value = avm.y + 2;
    });
    printLine(alignInfo('Recreated z (y + 2): ') + getWXYZZCombo());
    ++avm.w;
    printLine(alignInfo('Incremented w: ') + getWXYZZCombo());
    otherConfig.z.auto(function(self) {
        self.value = avm.y + 2;
    });
    printLine(alignInfo('Recreated other Z (z + 2): ') + getWXYZZCombo());
    ++avm.w;
    printLine(alignInfo('Incremented w: ') + getWXYZZCombo());
    delete config.y;
    printLine(alignInfo('Deleted y: ') + getWXYZZCombo());
    ++avm.w;
    printLine(alignInfo('Incremented w: ') + getWXYZZCombo());
    config.y.auto(function(self) {
        self.value = avm.x + 5;
    });
    printLine(alignInfo('Recreated y (x + 5): ') + getWXYZZCombo());
    printLine();

    config.deleteMe.val(10);
    print(alignInfo('Deleting deleteMe improperly: '));
    try {
        delete avm.deleteMe;
    } catch (e) {
        printLine(e);
    }
    printLine();

    printLine();
    printLine('Performance testing (please wait):');
    //window.scrollTo(0, document.body.scrollHeight);
    setTimeout(performanceTesting, 0);
};

globalThis.performanceTesting = function() {
    let createPerformanceIterations = 1e5;
    let createPerformanceStr = '1e5';
    let assignPerformanceIterations = 5e5;
    let assignPerformanceStr = '5e5';
    let s;
    let e;
    let obj = {};
    let [ perfAVM, perfConfig ] = new AVMap();
    let q = {};
    function fakeNotify(n, objN) {
        q[n] = objN;
    }
    let getValue;

    s = performance.now();
    for (let n = 0; n < createPerformanceIterations; ++n) {
        obj = {};
    }
    e = performance.now();
    printLine(alignInfo(createPerformanceStr + ' objects create: ') + (e - s) + 'ms');
    s = performance.now();
    for (let n = 0; n < createPerformanceIterations; ++n) {
        [ perfAVM, perfConfig ] = new AVMap();
    }
    e = performance.now();
    printLine(alignInfo(createPerformanceStr + ' AVMaps create: ') + (e - s) + 'ms');
    printLine();

    s = performance.now();
    for (let n = 0; n < assignPerformanceIterations; ++n) {
        obj[n] = n;
    }
    e = performance.now();
    printLine(alignInfo(assignPerformanceStr + ' objects assign new: ') + (e - s) + 'ms');
    s = performance.now();
    for (let n = 0; n < assignPerformanceIterations; ++n) {
        perfConfig[n] = n;
    }
    e = performance.now();
    printLine(alignInfo(assignPerformanceStr + ' AVMaps assign new: ') + (e - s) + 'ms');
    printLine();

    s = performance.now();
    for (let n = 0; n < assignPerformanceIterations; ++n) {
        ++obj[n];
    }
    e = performance.now();
    printLine(alignInfo(assignPerformanceStr + ' objects assign only: ') + (e - s) + 'ms');
    s = performance.now();
    for (let n = 0; n < assignPerformanceIterations; ++n) {
        ++obj[n];
        fakeNotify(n, obj[n]);
    }
    e = performance.now();
    printLine(alignInfo(assignPerformanceStr + ' objects assign + notify: ') + (e - s) + 'ms');
    s = performance.now();
    for (let n = 0; n < assignPerformanceIterations; ++n) {
        ++perfAVM[n];
    }
    e = performance.now();
    printLine(alignInfo(assignPerformanceStr + ' AVMaps assign: ') + (e - s) + 'ms');
    printLine();

    s = performance.now();
    for (let n = 0; n < assignPerformanceIterations; ++n) {
        ++obj[0];
    }
    e = performance.now();
    printLine(alignInfo(assignPerformanceStr + ' objects assign [0] only: ') + (e - s) + 'ms');
    s = performance.now();
    for (let n = 0; n < assignPerformanceIterations; ++n) {
        ++obj[0];
        fakeNotify(n, obj[0]);
    }
    e = performance.now();
    printLine(alignInfo(assignPerformanceStr + ' objects assign [0] + notify: ') + (e - s) + 'ms');
    s = performance.now();
    for (let n = 0; n < assignPerformanceIterations; ++n) {
        ++perfAVM[0];
    }
    e = performance.now();
    printLine(alignInfo(assignPerformanceStr + ' AVMaps assign [0]: ') + (e - s) + 'ms');
    printLine('(This is more likely to be the actual speed in regular usage.)');
    printLine();

    s = performance.now();
    for (let n = 0; n < assignPerformanceIterations; ++n) {
        getValue = obj[n];
    }
    e = performance.now();
    printLine(alignInfo(assignPerformanceStr + ' objects get: ') + (e - s) + 'ms');
    s = performance.now();
    for (let n = 0; n < assignPerformanceIterations; ++n) {
        getValue = perfAVM[n];
    }
    e = performance.now();
    printLine(alignInfo(assignPerformanceStr + ' AVMaps get: ') + (e - s) + 'ms');
    printLine();

    s = performance.now();
    for (let n = 0; n < assignPerformanceIterations; ++n) {
        delete obj[n];
    }
    e = performance.now();
    printLine(alignInfo(assignPerformanceStr + ' objects delete: ') + (e - s) + 'ms');
    s = performance.now();
    for (let n = 0; n < assignPerformanceIterations; ++n) {
        delete perfConfig[n];
    }
    e = performance.now();
    printLine(alignInfo(assignPerformanceStr + ' AVMaps delete: ') + (e - s) + 'ms');
    printLine();
    printLine();


    s = performance.now();
    for (let n = 0; n < assignPerformanceIterations; ++n) {
        obj[n] = n;
    }
    e = performance.now();
    printLine(alignInfo(assignPerformanceStr + ' objects assign new: ') + (e - s) + 'ms');
    s = performance.now();
    for (let n = 0; n < assignPerformanceIterations; ++n) {
        perfConfig[n].const(n);
    }
    e = performance.now();
    printLine(alignInfo(assignPerformanceStr + ' AVMaps assign new const: ') + (e - s) + 'ms');
    printLine();

    s = performance.now();
    for (let n = 0; n < assignPerformanceIterations; ++n) {
        getValue = obj[n];
    }
    e = performance.now();
    printLine(alignInfo(assignPerformanceStr + ' objects get: ') + (e - s) + 'ms');
    s = performance.now();
    for (let n = 0; n < assignPerformanceIterations; ++n) {
        getValue = perfAVM[n];
    }
    e = performance.now();
    printLine(alignInfo(assignPerformanceStr + ' AVMaps get const: ') + (e - s) + 'ms');
    printLine();
    printLine();


    s = performance.now();
    for (let n = 0; n < assignPerformanceIterations; ++n) {
        getValue = obj[0];
    }
    e = performance.now();
    printLine(alignInfo(assignPerformanceStr + ' objects get [0]: ') + (e - s) + 'ms');
    s = performance.now();
    for (let n = 0; n < assignPerformanceIterations; ++n) {
        getValue = perfAVM[0];
    }
    e = performance.now();
    printLine(alignInfo(assignPerformanceStr + ' AVMaps get const [0]: ') + (e - s) + 'ms');
    printLine('(This is more likely to be the actual speed in regular usage.)');
    printLine();
};