'use strict';

//Code published to: https://github.com/AndrewDavis/AutomagicVariable

class AutomagicVariableMap {
    constructor() {
        return new Proxy(this, {
            get: function(targetAVM, propertyName, receiverProxy) {
                if (propertyName == '_avm') {
                    return targetAVM;
                } else if (typeof(returnValue) === 'function') {
                    return targetAVM[propertyName].bind(targetAVM);
                } else {
                    return targetAVM[propertyName];
                }
            },
            set: function(targetAVM, propertyName, newValue, receiverProxy) {
                return targetAVM[propertyName] = newValue;
            }
        });
    }
}

//module.exports = AutomagicVariableMap;