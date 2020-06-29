window.onload = function() {
    globalThis.HTML = document.getElementsByTagName('*');

    let avm = AutomagicVariableMap.create();
    HTML.outputPre.innerHTML += (typeof(avm._avm) == 'undefined' ? 'not AVM' : 'AVM') + '\n';

    avm.a = 7;
    avm.b = AutomagicVariable.create(function(self) {
        self.value = avm.a + 2;
    });
    HTML.outputPre.innerHTML += avm.a + ', ' + avm.b + '\n';
    avm.a = 8;
    HTML.outputPre.innerHTML += avm.a + ', ' + avm.b + '\n';
    avm.c = avm._a;
    HTML.outputPre.innerHTML += avm.c + '\n';
    avm.c = 10;
    HTML.outputPre.innerHTML += avm.a + ', ' + avm.b + ', ' + avm.c + '\n';
};