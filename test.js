window.onload = function() {
    globalThis.HTML = document.getElementsByTagName('*');

    let avm = new AutomagicVariableMap();
    HTML.outputPre.innerHTML += (avm._avm == undefined ? 'not AVM' : 'AVM') + '\n';
    avm.blah = 7;
    HTML.outputPre.innerHTML += avm.blah;
    avm.blah = 8;
    HTML.outputPre.innerHTML += avm.blah;
};