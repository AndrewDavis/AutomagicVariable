window.onload = function() {
    globalThis.HTML = document.getElementsByTagName('*');
    globalThis.print = function(printMe) {
        HTML.outputPre.innerHTML += printMe;
    }
    globalThis.printLine = function(printMe = '') {
        HTML.outputPre.innerHTML += printMe + '\n';
    }
    globalThis.alignRight = function(alignMe, amount) {
        return alignMe.padStart(amount);
    }
    globalThis.alignLeft = function(alignMe, amount) {
        return alignMe.padEnd(amount);
    }

    globalThis.avm = AVMap.create('avm');
    printLine(alignRight('Detect AVM: ', 30) + (avm._avm == avm ? 'not AVM' : 'is AVM'));
    avm.var = 10;
    printLine(alignRight('Detect AV: ', 30) + (avm._var && typeof(avm._var._av) == avm._var ? 'not AV' : 'is AV'));
    printLine(alignRight('AVM toString(), valueOf(): ', 30) + avm.toString() + ', ' + avm.valueOf());
    printLine(alignRight('AV toString(), valueOf(): ', 30) + avm._var.toString() + ', ' + avm._var.valueOf());
    printLine();

    avm.a = 7;
    avm.b = AV.auto(function(self) {
        self.value = avm.a + 2;
    });
    printLine(alignRight('Initial a, b: ', 30) + avm.a + ', ' + avm.b);
    avm.a = 8;
    printLine(alignRight('Changed a to 8: ', 30) + avm.a + ', ' + avm.b);
    avm.c = avm._a;
    printLine(alignRight('Copied a to c: ', 30) + avm.c);
    avm.c = 10;
    printLine(alignRight('Changed c to 10: ', 30) + avm.a + ', ' + avm.b + ', ' + avm.c);
    printLine();

    avm.arr = [];
    avm.last = AV.auto(function(self) {
        if (avm.arr.length == 0) {
            self.value = null;
        } else {
            self.value = avm.arr[avm.arr.length - 1];
        }
    });
    printLine(alignRight('Initial array + last element: ', 30) + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 16) + 'last: ' + JSON.stringify(avm.last));
    avm.arr.push(5, 6, 7, 8);
    printLine(alignRight('Pushed onto array: ', 30) + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 16) + 'last: ' + JSON.stringify(avm.last));
    avm._arr.touched();
    printLine(alignRight('Marked array dirty: ', 30) + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 16) + 'last: ' + JSON.stringify(avm.last));
    avm.arr = [];
    printLine(alignRight('Cleared array: ', 30) + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 16) + 'last: ' + JSON.stringify(avm.last));
    printLine();

    avm.set = new Set();
    avm.sum = AV.auto(function(self) {
        self.value = 0.0;
        for (let item of avm.set) {
            self.value += item;
        }
    });
    printLine(alignRight('Initial set and sum: ', 30) + JSON.stringify(Array.from(avm.set)) + ', ' + avm.sum);
    avm.set.add(5);
    avm.set.add(6);
    avm.set.add(7);
    printLine(alignRight('Added to set: ', 30) + JSON.stringify(Array.from(avm.set)) + ', ' + avm.sum);
    avm._set.touched();
    printLine(alignRight('Marked set dirty: ', 30) + JSON.stringify(Array.from(avm.set)) + ', ' + avm.sum);
    printLine();

    avm.i = 0;
    avm.j = AV.auto(function(self) {
        self.value = avm.i + 1;
    });
    avm.k = AV.auto(function(self) {
        self.value = avm.j + 1;
    });
    printLine(alignRight('Initial i, j, k: ', 30) + avm.i + ', ' + avm.j + ', ' + avm.k);
    avm.j = 20;
    printLine(alignRight('Changed j: ', 30) + avm.i + ', ' + avm.j + ', ' + avm.k);
    avm.j = AV.autoValue(function(self, newValue) {
        self.value = avm.i + 1;
    });
    printLine(alignRight('Revised j: ', 30) + avm.i + ', ' + avm.j + ', ' + avm.k);
    avm.j = 20;
    printLine(alignRight('Changed j: ', 30) + avm.i + ', ' + avm.j + ', ' + avm.k);
    avm.i = 5;
    printLine(alignRight('Changed i: ', 30) + avm.i + ', ' + avm.j + ', ' + avm.k);
    delete avm.k;
    printLine(alignRight('Deleted k: ', 30) + avm.i + ', ' + avm.j + ', ' + avm.k);
    avm.i = 0;
    printLine(alignRight('Changed i: ', 30) + avm.i + ', ' + avm.j + ', ' + avm.k);
    delete avm.i;
    printLine(alignRight('Deleted i: ', 30) + avm.i + ', ' + avm.j + ', ' + avm.k);
    printLine();

    avm.valid = AV.auto(function(self, newValue) {
        if (newValue != null) {
            self.value = newValue;
        }
    });
    printLine(alignRight('Initial valid (unset): ', 30) + avm.valid);
    avm.valid = 7;
    printLine(alignRight('Set valid to 7: ', 30) + avm.valid);
    avm.valid = null;
    printLine(alignRight('Set valid to null: ', 30) + avm.valid);
    printLine();

    globalThis.otherAVM = AVMap.create('otherAVM');
    avm.first = 10;
    otherAVM.second = AV.auto(function(self) {
        self.value = avm.first + 1;
    });
    printLine(alignRight('Testing 2 AVM\'s: ', 30) + avm.first + ', ' + otherAVM.second);
    printLine();

    try {
        avm.recursion = AV.auto(function(self, newValue) {
            if (typeof(newValue) == 'undefined') {
                self.value = avm.recursion;
            } else {
                self.value = newValue;
            }
        });
        printLine(alignRight('Testing recursion initial: ', 30) + avm.recursion);
        avm.recursion = 10;
        printLine(alignRight('Set recursion to 10: ', 30) + avm.recursion);
        avm._recursion.touch();
        print(alignRight('Marked recursion as dirty: ', 30));
        //Throws recursion error.
        printLine(avm.recursion);
    } catch (e) {
        printLine(e);
    }
    printLine();

    try {
        avm.recursion1 = AV.auto(function(self, newValue) {
            if (typeof(newValue) == 'undefined') {
                self.value = avm.recursion2;
            } else {
                self.value = newValue;
            }
        });
        avm.recursion2 = AV.auto(function(self) {
            self.value = avm.recursion1;
        });
        printLine(alignRight('Testing dual rec. initial: ', 30) + avm.recursion1 + ', ' + avm.recursion2);
        avm.recursion1 = 10;
        printLine(alignRight('Set recursion1 to 10: ', 30) + avm.recursion1 + ', ' + avm.recursion2);
        avm._recursion1.touch();
        print(alignRight('Marked recursion1 as dirty: ', 30));
        //Throws recursion error.
        printLine(avm.recursion1 + ', ' + avm.recursion2);
    } catch (e) {
        printLine(e);
    }
    printLine();

    function f() {
        avm.fValue = 'f() called at ' + performance.now() + 'ms';
    };
    printLine(alignRight('Function listener initial: ', 30) + avm.fValue);
    f();
    printLine(alignRight('Function listener after call: ', 30) + avm.fValue);
    let passTime = performance.now();
    while (performance.now() == passTime) {

    }
    f();
    printLine(alignRight('Called again (delayed): ', 30) + avm.fValue);
    printLine();

    c = new (class {
        constructor() {
            this.property = 'class property';
            avm.classFuncUnbound = function() {
                return this.property;
            }
            avm.classFuncBound = function() {
                return this.property;
            }.bind(this);
        }
    })();
    printLine(alignRight('Class function unbound: ', 30) + avm.classFuncUnbound());
    printLine(alignRight('Class function bound: ', 30) + avm.classFuncBound());
    let classFuncBound = avm.classFuncBound;
    printLine(alignRight('Got first then called: ', 30) + classFuncBound());
    printLine();

    avm.nestedAVM = AVMap.create('nestedAVM');
    avm.nestedAVM.a = 10;
    avm.nestedAVM.b = AV.auto(function(self) {
        self.value = avm.nestedAVM.a * 2;
    });
    printLine(alignRight('Nested AVM initial a, b: ', 30) + avm.nestedAVM.a + ', ' + avm.nestedAVM.b);
    avm.nestedAVM.a = 15;
    printLine(alignRight('Nested AVM changed a: ', 30) + avm.nestedAVM.a + ', ' + avm.nestedAVM.b);
    avm.nestedAVM = 'str';
    printLine(alignRight('Reassign nested AVM: ', 30) + avm.nestedAVM);
    printLine();
};