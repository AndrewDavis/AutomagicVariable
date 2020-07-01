'use strict';

//Code published to: https://github.com/AndrewDavis/AutomagicVariable

let AVMTargetProperty;
let AVMGetFunction = function(targetAVM, propertyName, receiverProxy) {
    AVMTargetProperty = targetAVM[propertyName];
    if (AVMTargetProperty == targetAVM) {
        //Getting the AVM itself.
        return targetAVM;
    } else if (typeof(AVMTargetProperty) !== 'undefined') {
        //Property exists.
        if (typeof(AVMTargetProperty._av) !== 'undefined') {
            //Property is an AV.
            AVMTargetProperty = AutomagicVariable._getValue(AVMTargetProperty);
            //See if it's a function.
            if (typeof(AVMTargetProperty) === 'function') {
                //This avoids issues with several various JS objects like Maps.
                AVMTargetProperty.bind(targetAVM);
            }
            return AVMTargetProperty;
        } else {
            //Property exists but isn't an AV.
            return AVMTargetProperty;
        }
    } else {
        //Property doesn't exist; try retrieving the property after '_', if applicable.
        if (propertyName.substr(0, 1) === '_') {
            AVMTargetProperty = targetAVM[propertyName.substr(1)];
        }
        return AVMTargetProperty;
    }
};

let AVMSetFunction = function(targetAVM, propertyName, newValue, receiverProxy) {
    AVMTargetProperty = targetAVM[propertyName];
    //See if assigning an AV.
    if (newValue != null && typeof(newValue._av) !== 'undefined') {
        //Assigning an AV.
        if (typeof(AVMTargetProperty) !== 'undefined' && typeof(AVMTargetProperty._av) !== 'undefined') {
            //Assigning an AV to an existing AV: always merge internals.
            AVMTargetProperty.mergeInternalsFrom(newValue);
        } else {
            //Assigning an AV to non-existent property: simply assign.
            targetAVM[propertyName] = newValue;
            //Also, keep track of its name.
            targetAVM[propertyName]._name = targetAVM._name + '.' + propertyName;
        }
    } else {
        //Assigning a non-AV value.
        //See if the property is an AV.
        if (typeof(AVMTargetProperty) !== 'undefined' && typeof(AVMTargetProperty._av) !== 'undefined') {
            //Property is an AV: update value.
            AutomagicVariable._setValue(AVMTargetProperty, newValue);
        } else {
            //Neither assigning an AV nor an AV: create a new value AV.
            targetAVM[propertyName] = AutomagicVariable.value(newValue);
            //Also, keep track of its name.
            targetAVM[propertyName]._name = targetAVM._name + '.' + propertyName;
        }
    }
    return true;
};

let AVMDeletePropertyFunction = function(targetAVM, propertyName) {
    AVMTargetProperty = targetAVM[propertyName];
    //See if the property is an AV.
    if (typeof(AVMTargetProperty) !== 'undefined' && typeof(AVMTargetProperty._av) !== 'undefined') {
        //Mark all of its dependents as dirty, since it's about to be deleted.
        AVMTargetProperty.touched();
    }
    //In any case, delete the property.
    delete targetAVM[propertyName];
    return true;
};

let AVMToStringFunction = function() {
    return '[AVMap (' + this._name + ')]';
};

class AutomagicVariableMap {
    static create(name = '<>') {
        let avm = {};
        avm._avm = avm;
        avm._name = name;
        avm.toString = AVMToStringFunction.bind(avm);
        avm.valueOf = avm.toString;
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
        newAV._recompute();
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
        newAV._recompute();
        return newAV;
    }

    mergeInternalsFrom(av) {
        this.private.value = av.private.value;
        av.private.dependents.forEach(this.private.dependents.add, this.private.dependents);
        this.private.isDirty = av.private.isDirty;
        this.private.onRecompute = av.private.onRecompute;
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

    toString() {
        return '[AV (' + this._name + ')]';
    };

    valueOf() {
        return this.toString();
    }

    //     /\  "public" functions  /\
    //     \/ "private"  functions \/

    static _getValue(av) {
        if (AutomagicVariable.RecomputingAVs.length > 0) {
            if (AutomagicVariable.RecomputingAVs[0] == av) {
                AutomagicVariable.RecomputingAVs = [];
                throw 'Error: AutomagicVariable recursion detected!';
            } else {
                av.private.dependents.add(AutomagicVariable.RecomputingAVs[0]);
            }
        }
        return av.value;
    }

    static _setValue(av, newValue) {
        av._recompute(newValue);
    }

    _recompute(newValue = undefined) {
        AutomagicVariable.RecomputingAVs.push(this);
        this.private.isDirty = false;
        let wasTouched = this.private.onRecompute(this, newValue);
        if (wasTouched !== false) {
            this.touched();
        }
        AutomagicVariable.RecomputingAVs.pop();
    }

    get value() {
        if (this.private.isDirty) {
            this._recompute();
        }
        return this.private.value;
    }

    set value(newValue) {
        this.private.value = newValue;
        this.touched();
    }
}
AutomagicVariable.RecomputingAVs = [];

let AVMap = AutomagicVariableMap;
let AV = AutomagicVariable;
module.exports = { AutomagicVariableMap, AVMap: AutomagicVariableMap, AutomagicVariable, AV: AutomagicVariable };