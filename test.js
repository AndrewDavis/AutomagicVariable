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
        return alignRight(alignMe, 30);
    };

    globalThis.avm = new AVMap();
    printLine(alignInfo('Detect AVM: ') + (avm._avMap ? 'has AVM' : 'does not have AVM'));
    //printLine(alignInfo('Get config property name: ') + avm._configPropertyName);
    avm.av.var.val(10);
    printLine(alignInfo('Detect AV: ') + (avm.av.var.exists() ? 'is AV' : 'not AV'));
    //printLine(alignInfo('Get AV property name: ') + avm.av.var.get().name);
    print(alignInfo('Testing reserved: '));
    try {
        avm.av.av.val(0);
    } catch (e) {
        printLine(e);
    }
    printLine();

    avm.av.constVar.const(7);
    print(alignInfo('Changing constVar: '));
    try {
        avm.constVar = 10;
    } catch (e) {
        printLine(e);
    }
    printLine(alignInfo('constVar: ') + avm.constVar);
    avm.av.a.val(avm.constVar);
    avm.av.b.auto(function(self) {
        self.value = avm.a + 2;
    });
    printLine(alignInfo('Initial a, b: ') + avm.a + ', ' + avm.b);
    avm.a = 8;
    printLine(alignInfo('Changed a to 8: ') + avm.a + ', ' + avm.b);
    avm.av.c.ref(avm.av.a.get());
    printLine(alignInfo('Referenced a by c: ') + avm.c);
    avm.c = 10;
    printLine(alignInfo('Changed c to 10: ') + avm.a + ', ' + avm.b + ', ' + avm.c);
    printLine();

    avm.av.arr.val([]);
    avm.av.last.auto(function(self) {
        if (avm.arr.length == 0) {
            self.value = null;
        } else {
            self.value = avm.arr[avm.arr.length - 1];
        }
    });
    printLine(alignInfo('Initial array + last element: ') + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 16) + 'last: ' + JSON.stringify(avm.last));
    avm.arr.push(5, 6, 7, 8);
    printLine(alignInfo('Pushed onto array: ') + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 16) + 'last: ' + JSON.stringify(avm.last));
    avm.av.arr.touched();
    printLine(alignInfo('Marked array dirty: ') + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 16) + 'last: ' + JSON.stringify(avm.last));
    avm.arr = [];
    printLine(alignInfo('Cleared array: ') + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 16) + 'last: ' + JSON.stringify(avm.last));
    avm.arr.push(5, 6);
    printLine(alignInfo('Pushed onto array: ') + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 16) + 'last: ' + JSON.stringify(avm.last));
    avm.av.last.recompute();
    printLine(alignInfo('Recomputed last: ') + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 16) + 'last: ' + JSON.stringify(avm.last));
    printLine();

    avm.av.set.val(new Set());
    avm.av.sum.auto(function(self) {
        let sum = 0.0;
        sum = 0.0;
        for (let item of avm.set) {
            sum += item;
        }
        self.value = sum;
    });
    printLine(alignInfo('Initial set and sum: ') + JSON.stringify(Array.from(avm.set)) + ', ' + avm.sum);
    avm.set.add(5);
    avm.set.add(6);
    avm.set.add(7);
    printLine(alignInfo('Added to set: ') + JSON.stringify(Array.from(avm.set)) + ', ' + avm.sum);
    avm.av.set.touched();
    printLine(alignInfo('Marked set dirty: ') + JSON.stringify(Array.from(avm.set)) + ', ' + avm.sum);
    printLine();

    avm.av.map.val(new Map());
    printLine(alignInfo('Initial map: ') + JSON.stringify(Array.from(avm.map)));
    avm.map.set(5, '!');
    avm.map.set(6, '!');
    avm.map.set(7, '!');
    printLine(alignInfo('Added to map: ') + JSON.stringify(Array.from(avm.map)));
    printLine();

    avm.av.i.val(0);
    avm.av.j.auto(function(self) {
        self.value = avm.i + 1;
    });
    avm.av.k.auto(function(self) {
        self.value = avm.j + 1;
    });
    printLine(alignInfo('Initial i, j, k: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    avm.j = 20;
    printLine(alignInfo('Changed j: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    print(alignInfo('Revising j without deleting: '));
    try {
        avm.av.j.autoValue(function(self, newValue) {
            self.value = avm.i + 1;
        });
    } catch (e) {
        printLine(e);
    }
    delete avm.av.j;
    avm.av.j.autoValue(function(self, newValue) {
        self.value = avm.i + 1;
    });
    printLine(alignInfo('Deleted and revised j: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    avm.j = 20;
    printLine(alignInfo('Changed j: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    avm.i = 5;
    printLine(alignInfo('Changed i: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    delete avm.av.j;
    avm.av.j.autoOnly(function(self, newValue) {
        self.value = avm.i + 1;
    });
    printLine(alignInfo('Deleted and revised j: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    print(alignInfo('Changing j: '));
    try {
        avm.j = 20;
    } catch (e) {
        printLine(e);
    }
    avm.i = 100;
    printLine(alignInfo('Changed i: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    avm.av.iRef.ref(avm.av.i.get());
    avm.av.kRef.ref(avm.av.k.get());
    printLine(alignInfo('iRef &= i; kRef &= k: ') +
        'i: ' + avm.i + ', iRef: ' + avm.iRef + ', j: ' + avm.j + ', k: ' + avm.k + ', kRef: ' + avm.kRef);
    delete avm.av.k;
    printLine(alignInfo('Deleted k: ') +
        'i: ' + avm.i + ', iRef: ' + avm.iRef + ', j: ' + avm.j + ', k: ' + avm.k + ', kRef: ' + avm.kRef);
    avm.i = 0;
    printLine(alignInfo('Changed i: ') +
        'i: ' + avm.i + ', iRef: ' + avm.iRef + ', j: ' + avm.j + ', k: ' + avm.k + ', kRef: ' + avm.kRef);
    print(alignInfo('Deleting iRef: '));
    try {
        delete avm.av.iRef;
    } catch (e) {
        printLine(e);
    }
    delete avm.av.i;
    printLine(alignInfo('Deleted i: ') +
        'i: ' + avm.i + ', iRef: ' + avm.iRef + ', j: ' + avm.j + ', k: ' + avm.k + ', kRef: ' + avm.kRef);
    avm.av.i.val(0);
    printLine(alignInfo('Recreated i: ') +
        'i: ' + avm.i + ', iRef: ' + avm.iRef + ', j: ' + avm.j + ', k: ' + avm.k + ', kRef: ' + avm.kRef);
    printLine();

    //avm.valid = AV.auto(function(self, newValue) {
    //    if (newValue != null) {
    //        self.value = newValue;
    //    }
    //});
    //printLine(alignInfo('Initial valid (unset): ') + avm.valid);
    //avm.valid = 7;
    //printLine(alignInfo('Set valid to 7: ') + avm.valid);
    //avm.valid = null;
    //printLine(alignInfo('Set valid to null: ') + avm.valid);
    //printLine();

    //globalThis.otherAVM = AVMap.create();
    //avm.first = 10;
    //otherAVM.second = AV.auto(function(self) {
    //    self.value = avm.first + 1;
    //});
    //printLine(alignInfo('Testing 2 AVM\'s: ') + avm.first + ', ' + otherAVM.second);
    //printLine();

    //try {
    //    avm.recursion = AV.auto(function(self, newValue) {
    //        if (typeof(newValue) == 'undefined') {
    //            self.value = avm.recursion;
    //        } else {
    //            self.value = newValue;
    //        }
    //    });
    //    printLine(alignInfo('Testing recursion initial: ') + avm.recursion);
    //    avm.recursion = 10;
    //    printLine(alignInfo('Set recursion to 10: ') + avm.recursion);
    //    avm._.recursion.touch();
    //    print(alignInfo('Marked recursion as dirty: '));
    //    //Throws recursion error.
    //    printLine(avm.recursion);
    //} catch (e) {
    //    printLine(e);
    //}
    //printLine();

    //try {
    //    avm.recursion1 = AV.auto(function(self, newValue) {
    //        if (typeof(newValue) == 'undefined') {
    //            self.value = avm.recursion2;
    //        } else {
    //            self.value = newValue;
    //        }
    //    });
    //    avm.recursion2 = AV.auto(function(self) {
    //        self.value = avm.recursion1;
    //    });
    //    printLine(alignInfo('Testing dual rec. initial: ') + avm.recursion1 + ', ' + avm.recursion2);
    //    avm.recursion1 = 10;
    //    printLine(alignInfo('Set recursion1 to 10: ') + avm.recursion1 + ', ' + avm.recursion2);
    //    avm._.recursion1.touch();
    //    print(alignInfo('Marked recursion1 as dirty: '));
    //    //Throws recursion error.
    //    printLine(avm.recursion1 + ', ' + avm.recursion2);
    //} catch (e) {
    //    printLine(e);
    //}
    //printLine();

    //function f() {
    //    avm.fValue = 'f() called at ' + performance.now() + 'ms';
    //};
    //printLine(alignInfo('Function listener initial: ') + avm.fValue);
    //f();
    //printLine(alignInfo('Function listener after call: ') + avm.fValue);
    //let passTime = performance.now();
    //while (performance.now() == passTime) {

    //}
    //f();
    //printLine(alignInfo('Called again (delayed): ') + avm.fValue);
    //printLine();

    //c = new (class {
    //    constructor() {
    //        this.property = 'class property';
    //        avm.classFuncUnbound = function() {
    //            return this.property;
    //        }
    //        avm.classFuncBound = function() {
    //            return this.property;
    //        }.bind(this);
    //    }
    //})();
    //printLine(alignInfo('Class function unbound: ') + avm.classFuncUnbound());
    //printLine(alignInfo('Class function bound: ') + avm.classFuncBound());
    //let classFuncBound = avm.classFuncBound;
    //printLine(alignInfo('Got first then called: ') + classFuncBound());
    //printLine();

    //avm.nestedAVM = AVMap.create();
    //avm.nestedAVM.a = 10;
    //avm.nestedAVM.b = AV.auto(function(self) {
    //    self.value = avm.nestedAVM.a * 2;
    //});
    //printLine(alignInfo('Nested AVM initial a, b: ') + avm.nestedAVM.a + ', ' + avm.nestedAVM.b);
    //avm.nestedAVM.a = 15;
    //printLine(alignInfo('Nested AVM changed a: ') + avm.nestedAVM.a + ', ' + avm.nestedAVM.b);
    //avm.nestedAVM = 'str';
    //printLine(alignInfo('Reassign nested AVM: ') + avm.nestedAVM);
    //printLine();

    //printLine('Performance testing:');
    //setTimeout(performanceTesting, 50);
};

//globalThis.performanceTesting = function() {
//    let performanceIterations = 1e6;
//    let s;
//    let e;
//    let obj = {};
//    let perfAVM = AVMap.create();

//    s = performance.now();
//    for (let n = 0; n < performanceIterations; ++n) {
//        obj = {};
//    }
//    e = performance.now();
//    printLine(alignInfo('1e6 objects create: ') + (e - s) + 'ms');
//    s = performance.now();
//    for (let n = 0; n < performanceIterations; ++n) {
//        perfAVM = AVMap.create();
//    }
//    e = performance.now();
//    printLine(alignInfo('1e6 AVMaps create: ') + (e - s) + 'ms');
//    printLine();

//    s = performance.now();
//    for (let n = 0; n < performanceIterations; ++n) {
//        obj[n] = n;
//    }
//    e = performance.now();
//    printLine(alignInfo('1e6 objects assign new: ') + (e - s) + 'ms');
//    s = performance.now();
//    for (let n = 0; n < performanceIterations; ++n) {
//        perfAVM[n] = n;
//    }
//    e = performance.now();
//    printLine(alignInfo('1e6 AVMaps assign new: ') + (e - s) + 'ms');
//    printLine();

//    s = performance.now();
//    for (let n = 0; n < performanceIterations; ++n) {
//        ++obj[n];
//    }
//    e = performance.now();
//    printLine(alignInfo('1e6 objects assign: ') + (e - s) + 'ms');
//    s = performance.now();
//    for (let n = 0; n < performanceIterations; ++n) {
//        ++perfAVM[n];
//    }
//    e = performance.now();
//    printLine(alignInfo('1e6 AVMaps assign: ') + (e - s) + 'ms');
//    printLine();
//};