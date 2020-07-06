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
    globalThis.config = avm.av;
    printLine(alignInfo('Detect AVM: ') + (avm._avMap ? 'has AVM' : 'does not have AVM'));
    //printLine(alignInfo('Get config property name: ') + avm._configPropertyName);
    config.var.val(10);
    printLine(alignInfo('Detect AV: ') + (config.var.exists() ? 'is AV' : 'not AV'));
    //printLine(alignInfo('Get AV property name: ') + config.var.get().name);
    print(alignInfo('Testing reserved: '));
    try {
        config.av.val(0);
    } catch (e) {
        printLine(e);
    }
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
    config.c.auto(function(self) { self.value = avm.a; });
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
    printLine(alignInfo('Changed j: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    print(alignInfo('Revising j without deleting: '));
    try {
        config.j.autoValue(function(self, newValue) {
            self.value = avm.i + 1;
        });
    } catch (e) {
        printLine(e);
    }
    delete config.j;
    config.j.autoValue(function(self, newValue) {
        self.value = avm.i + 1;
    });
    printLine(alignInfo('Deleted and revised j: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    avm.j = 20;
    printLine(alignInfo('Changed j: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    avm.i = 5;
    printLine(alignInfo('Changed i: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    delete config.j;
    config.j.autoOnly(function(self, newValue) {
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
    delete config.k;
    printLine(alignInfo('Deleted k: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    avm.i = 0;
    printLine(alignInfo('Changed i: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    delete config.i;
    printLine(alignInfo('Deleted i: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
    config.i.val(0);
    printLine(alignInfo('Recreated i: ') + avm.i + ', ' + avm.j + ', ' + avm.k);
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

    globalThis.otherAVM = new AVMap();
    config.first.val(10);
    otherAVM.av.second.auto(function(self) {
        self.value = avm.first + 1;
    });
    printLine(alignInfo('Testing 2 AVM\'s: ') + avm.first + ', ' + otherAVM.second);
    printLine();

    try {
        print(alignInfo('Invoking recursion: '));
        config.recursion.auto(function(self, newValue) {
            if (typeof(newValue) === 'undefined') {
                self.value = avm.recursion;
            } else {
                self.value = newValue;
            }
        });
    } catch (e) {
        printLine(e);
    }
    try {
        config.recursion1.auto(function(self, newValue) {
            if (typeof(newValue) === 'undefined') {
                self.value = avm.recursion2;
            } else {
                self.value = newValue;
            }
        });
        config.recursion2.auto(function(self) {
            self.value = avm.recursion1;
        });
        avm.recursion1 = 10;
        print(alignInfo('Invoking dual recursion: '));
        //Throws recursion error.
        print(avm.recursion2);
    } catch (e) {
        printLine(e);
    }
    printLine();

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