'use strict';

//Code published to: https://github.com/AndrewDavis/AutomagicVariable

class AutomagicVariableMap {
    static create(/*name = '<>'*/) {
        let avmProperties = {};
        //For terseness.
        avmProperties._ = avmProperties;
        //For unique differentiation from other code.
        avmProperties._avm = avmProperties;
        //avmProperties.valueOf = valueOfFunction.bind(avmProperties, name);
        //avmProperties.toString = toStringFunction.bind(avmProperties);
        return new Proxy(avmProperties, {
            get: AutomagicVariableMap.getFunction,
            set: AutomagicVariableMap.setFunction,
            deleteProperty: AutomagicVariableMap.deletePropertyFunction
        });
    }

    static getFunction(targetAVM, propertyName, receiverProxy) {
        //See if the property is the AVM itself; if not, see if the property already exists.
        if (targetAVM[propertyName] === targetAVM) {
            //Getting the AVM itself: return it.
            return targetAVM;
        } else if (typeof(targetAVM[propertyName]) !== 'undefined') {
            //Property already exists: get and return its updated value.
            return targetAVM[propertyName].getUpdatedValue();
        } else {
            //Property does not exist: create a new value AV with initial value of undefined.
            targetAVM[propertyName] = AutomagicVariable.value(undefined);
            //Also, keep track of its name.
            //targetAVM[propertyName].name = targetAVM.valueOf() + '.' + propertyName;
        }
    };

    static setFunction(targetAVM, propertyName, newValue, receiverProxy) {
        //See if the property already exists.
        if (typeof(targetAVM[propertyName]) === 'undefined') {
            //Property does not exist. See if the new value is an AV.
            if (typeof(newValue._av) === 'undefined') {
                //New value is not an AV: create a new value AV.
                targetAVM[propertyName] = AutomagicVariable.value(newValue);
            } else {
                //New value is an existing AV: assign it.
                targetAVM[propertyName] = newValue;
            }
            //Also, keep track of its name.
            //targetAVM[propertyName].name = targetAVM.valueOf() + '.' + propertyName;
        } else {
            //Property already exists: assume it's an AV (should be), and recompute with the new value.
            targetAVM[propertyName].recompute(newValue);
        }
        return true;
    };

    static deletePropertyFunction(targetAVM, propertyName) {
        targetAVM[propertyName].touched();
        delete targetAVM[propertyName];
        return true;
    };

    //static valueOfFunction(name) {
    //    return name;
    //};

    //static toStringFunction() {
    //    return '[AVMap (' + this.valueOf() + ')]';
    //};
}

class AutomagicVariable {
    /**
     * Do not use this constructor externally! Use auto(), value(), or autoValue() instead.
     * @param isDirty
     */
    constructor(isDirty) {
        //This begins with _ to differentiate it from any non-AV objects that might have an `av` property.
        this._av = this;
        this.valueProperty = null;
        this.dependents = new Set();
        this.isDirty = isDirty;
    }

    static auto(onRecompute = AutomagicVariable.valueRecomputeFunction, initialValue = undefined) {
        AutomagicVariable.AVNewAV = new AutomagicVariable(true);
        AutomagicVariable.AVNewAV.onRecompute = onRecompute;
        AutomagicVariable.AVNewAV.recompute(initialValue);
        AutomagicVariable.AVNewAV._addRecomputingDependent();
        return AutomagicVariable.AVNewAV;
    }

    static value(initialValue = undefined) {
        AutomagicVariable.AVNewAV = new AutomagicVariable(false);
        AutomagicVariable.AVNewAV.onRecompute = AutomagicVariable.valueRecomputeFunction;
        AutomagicVariable.AVNewAV.recompute(initialValue);
        AutomagicVariable.AVNewAV._addRecomputingDependent();
        return AutomagicVariable.AVNewAV;
    }

    static autoValue(onRecompute, initialValue = undefined) {
        AutomagicVariable.AVNewAV = new AutomagicVariable(false);
        AutomagicVariable.AVNewAV.onRecompute = function(self, newValue) {
            if (typeof(newValue) === 'undefined') {
                return onRecompute(self, newValue);
            } else {
                self.value = newValue;
            }
        };
        AutomagicVariable.AVNewAV.recompute(initialValue);
        AutomagicVariable.AVNewAV._addRecomputingDependent();
        return AutomagicVariable.AVNewAV;
    }

    mergeInternalsFrom(av) {
        this.valueProperty = av.valueProperty;
        av.dependents.forEach(this.dependents.add, this.dependents);
        this.isDirty = av.isDirty;
        this.onRecompute = av.onRecompute;
    }

    getUpdatedValue() {
        this._addRecomputingDependent();
        return this.value;
    }

    recompute(newValue = undefined) {
        AutomagicVariable.RecomputingAVs.push(this);
        this.isDirty = false;
        if (this.onRecompute(this, newValue) !== false) {
            this.touched();
        }
        AutomagicVariable.RecomputingAVs.pop();
    }

    addDependent(addMe) {
        this.dependents.add(addMe);
    }

    addDependency(addToMe) {
        addToMe.addDependent(this);
    }

    touch() {
        this.isDirty = true;
        this.touched();
    }

    touched() {
        for (let dependent of this.dependents) {
            dependent.isDirty = true;
            dependent.touched();
        }
    }

    //toString() {
    //    return '[AV (' + this.name + ')]';
    //};

    //valueOf() {
    //    return this.name;
    //}

    //     /\  "public" functions  /\
    //     \/ "private"  functions \/

    _addRecomputingDependent() {
        if (AutomagicVariable.RecomputingAVs.length > 0) {
            if (AutomagicVariable.RecomputingAVs[0] === this) {
                AutomagicVariable.RecomputingAVs = [];
                throw 'Error: AutomagicVariable recursion detected!';
            } else {
                this.dependents.add(AutomagicVariable.RecomputingAVs[0]);
            }
        }
    }

    get value() {
        if (this.isDirty) {
            this.recompute();
        }
        return this.valueProperty;
    }

    set value(newValue) {
        this.valueProperty = newValue;
    }

    static valueRecomputeFunction(self, newValue) {
        self.value = newValue;
    };
}
AutomagicVariable.RecomputingAVs = [];

let AVMap = AutomagicVariableMap;
let AV = AutomagicVariable;
module.exports = { AutomagicVariableMap, AVMap: AutomagicVariableMap, AutomagicVariable, AV: AutomagicVariable };