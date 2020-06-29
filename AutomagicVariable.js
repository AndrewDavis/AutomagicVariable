'use strict';

//Code published to: https://github.com/AndrewDavis/AutomagicVariable

class AutomagicVariableMap {
    static create() {
        let avm = {};
        avm.avm = avm;
        let returnValue;
        return new Proxy(avm, {
            get: function(targetAVM, propertyName, receiverProxy) {
                if (propertyName.substr(0, 1) == '_') {
                    //Getting a property as-is, no automagix involved.
                    return targetAVM[propertyName.substr(1)];
                } else if (typeof(targetAVM[propertyName]) !== 'undefined' &&
                    typeof(targetAVM[propertyName]._av) !== 'undefined') {
                    //Property is an AV.
                    returnValue = AutomagicVariable.getAVValue(targetAVM[propertyName]);
                    //See if it's a function.
                    if (typeof(returnValue) === 'function') {
                        //This avoids issues with several various JS objects like Maps.
                        returnValue.bind(targetAVM);
                    }
                    return returnValue;
                } else {
                    //Property doesn't exist.
                    return undefined;
                }
            },
            set: function(targetAVM, propertyName, newValue, receiverProxy) {
                //See if assigning an AV.
                if (newValue != null && typeof(newValue._av) !== 'undefined') {
                    //Assigning an AV: always replace.
                    targetAVM[propertyName] = newValue;
                } else {
                    //Assigning a non-AV value.
                    //See if the property is an AV.
                    if (typeof(targetAVM[propertyName]) !== 'undefined' &&
                        typeof(targetAVM[propertyName]._av) !== 'undefined') {
                        //Property is an AV: update value.
                        targetAVM[propertyName].value = newValue;
                    } else {
                        //Neither assigning an AV nor an AV: create a new AV.
                        targetAVM[propertyName] = AutomagicVariable.createValueAV(newValue);
                    }
                }
                return true;
            }
        });
    }
}

class AutomagicVariable {
    /**
     * Do not use this constructor externally! Use create() instead.
     */
    constructor() {
        this._av = this;
        this.private = {
            value: null,
            dependents: new Set(),
            isDirty: true
        };
    }

    static create(onRecompute) {
        let newAV = new AutomagicVariable();
        newAV.onRecompute = onRecompute;
        return newAV;
    }

    static createValueAV(initialValue) {
        let newAV = new AutomagicVariable();
        newAV.value = initialValue;
        newAV.onRecompute = function() {
            return this.value;
        }.bind(newAV);
        return newAV;
    }

    static getAVValue(av) {
        if (AutomagicVariable.RecomputingAVs.length > 0 && AutomagicVariable.RecomputingAVs[0] != av) {
            av.private.dependents.add(AutomagicVariable.RecomputingAVs[0]);
        }
        return av.value;
    }

    get value() {
        if (this.private.isDirty) {
            this.recompute();
        }
        return this.private.value;
    }

    set value(newValue) {
        this.private.value = newValue;
        this.markDependentsDirty();
    }

    recompute() {
        AutomagicVariable.RecomputingAVs.push(this);
        this.private.isDirty = false;
        let shouldMarkDependentsDirty = this.onRecompute(this);
        if (shouldMarkDependentsDirty !== false) {
            this.markDependentsDirty();
        }
        AutomagicVariable.RecomputingAVs.pop();
    }

    markDirty() {
        this.private.isDirty = true;
        this.markDependentsDirty();
    }

    markDependentsDirty() {
        for (let dependent of this.private.dependents) {
            dependent.markDirty();
        }
    }
}
AutomagicVariable.RecomputingAVs = [];

module.exports = { AutomagicVariableMap, AutomagicVariable };