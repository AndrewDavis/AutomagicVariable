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

    let avm = AutomagicVariableMap.create();
    printLine('Detect AVM: ' + (typeof(avm._avm) == 'undefined' ? 'not AVM' : 'AVM'));
    printLine();

    avm.a = 7;
    avm.b = AutomagicVariable.create(function(self) {
        self.value = avm.a + 2;
    });
    printLine(alignRight('Initial a, b: ', 20) + avm.a + ', ' + avm.b);
    avm.a = 8;
    printLine(alignRight('Changed a to 8: ', 20) + avm.a + ', ' + avm.b);
    avm.c = avm._a;
    printLine(alignRight('Copied a to c: ', 20) + avm.c);
    avm.c = 10;
    printLine(alignRight('Changed c to 10: ', 20) + avm.a + ', ' + avm.b + ', ' + avm.c);
    printLine();

    avm.arr = [];
    avm.last = AutomagicVariable.create(function(self) {
        if (avm.arr.length == 0) {
            self.value = null;
        } else {
            self.value = avm.arr[avm.arr.length - 1];
        }
    });
    printLine(alignRight('Initial array + last element: ', 30) + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 20) + 'last: ' + JSON.stringify(avm.last));
    avm.arr.push(5, 6, 7, 8);
    printLine(alignRight('Pushed onto array: ', 30) + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 20) + 'last: ' + JSON.stringify(avm.last));
    avm._arr.markDirty();
    printLine(alignRight('Marked array dirty: ', 30) + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 20) + 'last: ' + JSON.stringify(avm.last));
    avm.arr = [];
    printLine(alignRight('Cleared array: ', 30) + alignRight('arr: ' + JSON.stringify(avm.arr) + ', ', 20) + 'last: ' + JSON.stringify(avm.last));
    printLine();

    avm.set = new Set();
    avm.sum = AutomagicVariable.create(function(self) {
        self.value = 0.0;
        for (let item of avm.set) {
            self.value += item;
        }
    });
    printLine(alignRight('Initial Set and sum: ', 30) + JSON.stringify(Array.from(avm.set)) + ', ' + avm.sum);
    avm.set.add(5);
    avm.set.add(6);
    avm.set.add(7);
    printLine(alignRight('Added to Set: ', 30) + JSON.stringify(Array.from(avm.set)) + ', ' + avm.sum);
    avm._set.markDirty();
    printLine(alignRight('Marked Set dirty: ', 30) + JSON.stringify(Array.from(avm.set)) + ', ' + avm.sum);
    printLine();

    avm.i = 0;
    avm.j = AutomagicVariable.create(function(self) {
        self.value = avm.i + 1;
    });
    avm.k = AutomagicVariable.create(function(self) {
        self.value = avm.j + 1;
    });
    printLine(alignRight('Initial i, j, k: ', 30) + avm.i + ', ' + avm.j + ', ' + avm.k);
    avm.j = 20;
    printLine(alignRight('Changed j: ', 30) + avm.i + ', ' + avm.j + ', ' + avm.k);
    avm.i = 5;
    printLine(alignRight('Changed i: ', 30) + avm.i + ', ' + avm.j + ', ' + avm.k);
    printLine();
};