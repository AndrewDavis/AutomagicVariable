window.onload = function() {
    globalThis.HTML = document.getElementsByTagName('*');
    globalThis.print = function(printMe) {
        HTML.outputPre.innerHTML += printMe;
    }
    globalThis.printLine = function(printMe) {
        HTML.outputPre.innerHTML += printMe + '\n';
    }

    let avm = AutomagicVariableMap.create();
    globalThis.printLine((typeof(avm._avm) == 'undefined' ? 'not AVM' : 'AVM'));

    avm.a = 7;
    avm.b = AutomagicVariable.create(function(self) {
        self.value = avm.a + 2;
    });
    globalThis.printLine(avm.a + ', ' + avm.b);
    avm.a = 8;
    globalThis.printLine(avm.a + ', ' + avm.b);
    avm.c = avm._a;
    globalThis.printLine(avm.c);
    avm.c = 10;
    globalThis.printLine(avm.a + ', ' + avm.b + ', ' + avm.c);
};