'use strict';

//Code published to: https://github.com/AndrewDavis/AutomagicVariable

let AVMGetFunction = function(targetAVM, propertyName, receiverProxy) {
    if (targetAVM[propertyName] === targetAVM) {
        //Getting the AVM itself.
        return targetAVM;
    } else if (typeof(targetAVM[propertyName]) !== 'undefined') {
        return targetAVM[propertyName].getUpdatedValue();
    } else {
        return undefined;
    }
};

let AVMSetFunction = function(targetAVM, propertyName, newValue, receiverProxy) {
    if (typeof(targetAVM[propertyName]) === 'undefined') {
        if (typeof(newValue._av) === 'undefined') {
            //Create a new value AV.
            targetAVM[propertyName] = AutomagicVariable.value(newValue);
        } else {
            //Assign an existing AV.
            targetAVM[propertyName] = newValue;
        }
        //Also, keep track of its name.
        //targetAVM[propertyName].name = targetAVM.valueOf() + '.' + propertyName;
    } else {
        targetAVM[propertyName].recompute(newValue);
    }
    return true;
};

let AVMDeletePropertyFunction = function(targetAVM, propertyName) {
    targetAVM[propertyName].touched();
    delete targetAVM[propertyName];
    return true;
};

//let AVMValueOfFunction = function(name) {
//    return name;
//};

//let AVMToStringFunction = function() {
//    return '[AVMap (' + this.valueOf() + ')]';
//};

class AutomagicVariableMap {
    static create(/*name = '<>'*/) {
        let avm = {};
        avm._ = avm;
        //avm.valueOf = AVMValueOfFunction.bind(avm, name);
        //avm.toString = AVMToStringFunction.bind(avm);
        return new Proxy(avm, {
            get: AVMGetFunction,
            set: AVMSetFunction,
            deleteProperty: AVMDeletePropertyFunction
        });
    }
}

let AVValueRecomputeFunction = function(self, newValue) {
    self.value = newValue;
};

class AutomagicVariable {
    /**
     * Do not use this constructor externally! Use auto(), value(), or autoValue() instead.
     * @param isDirty
     */
    constructor(isDirty) {
        //This begins with _ to differentiate it from any non-AV objects that might have an `av` property.
        this._av = this;
        this.private = {
            value: null,
            dependents: new Set(),
            isDirty: isDirty
        };
    }

    static auto(onRecompute = AVValueRecomputeFunction) {
        let newAV = new AutomagicVariable(true);
        newAV.private.onRecompute = onRecompute;
        newAV.recompute();
        return newAV;
    }

    static value(initialValue = undefined) {
        let newAV = new AutomagicVariable(false);
        newAV.private.onRecompute = AVValueRecomputeFunction;
        newAV.value = initialValue;
        return newAV;
    }

    static autoValue(onRecompute) {
        let newAV = new AutomagicVariable(false);
        newAV.private.onRecompute = function(self, newValue) {
            if (typeof(newValue) == 'undefined') {
                return onRecompute(self, newValue);
            } else {
                self.value = newValue;
            }
        };
        newAV.recompute();
        return newAV;
    }

    mergeInternalsFrom(av) {
        this.private.value = av.private.value;
        av.private.dependents.forEach(this.private.dependents.add, this.private.dependents);
        this.private.isDirty = av.private.isDirty;
        this.private.onRecompute = av.private.onRecompute;
    }

    getUpdatedValue() {
        if (AutomagicVariable.RecomputingAVs.length > 0) {
            if (AutomagicVariable.RecomputingAVs[0] == this) {
                AutomagicVariable.RecomputingAVs = [];
                throw 'Error: AutomagicVariable recursion detected!';
            } else {
                this.private.dependents.add(AutomagicVariable.RecomputingAVs[0]);
            }
        }
        return this.value;
    }

    recompute(newValue = undefined) {
        AutomagicVariable.RecomputingAVs.push(this);
        this.private.isDirty = false;
        let wasTouched = this.private.onRecompute(this, newValue);
        if (wasTouched !== false) {
            this.touched();
        }
        AutomagicVariable.RecomputingAVs.pop();
    }

    touch() {
        this.private.isDirty = true;
        this.touched();
    }

    touched() {
        for (let dependent of this.private.dependents) {
            dependent.touch();
        }
    }

    isDirty() {
        return this.private.isDirty;
    }

    addDependent(addMe) {
        this.private.dependents.add(addMe);
    }

    addDependency(addToMe) {
        addToMe.addDependent(this);
    }

    //toString() {
    //    return '[AV (' + this.name + ')]';
    //};

    //valueOf() {
    //    return this.name;
    //}

    //     /\  "public" functions  /\
    //     \/ "private"  functions \/

    get value() {
        if (this.private.isDirty) {
            this.recompute();
        }
        return this.private.value;
    }

    set value(newValue) {
        this.private.value = newValue;
    }
}
AutomagicVariable.RecomputingAVs = [];

let AVMap = AutomagicVariableMap;
let AV = AutomagicVariable;
module.exports = { AutomagicVariableMap, AVMap: AutomagicVariableMap, AutomagicVariable, AV: AutomagicVariable };