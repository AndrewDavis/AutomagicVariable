'use strict';

//Code published to: https://github.com/AndrewDavis/AutomagicVariable

class AutomagicVariableMap {
    static create(/*name = '<>'*/) {
        let avm = {};
        avm._ = avm;
        //avm.valueOf = valueOfFunction.bind(avm, name);
        //avm.toString = toStringFunction.bind(avm);
        return new Proxy(avm, {
            get: AutomagicVariableMap.getFunction,
            set: AutomagicVariableMap.setFunction,
            deleteProperty: AutomagicVariableMap.deletePropertyFunction
        });
    }

    static getFunction(targetAVM, propertyName, receiverProxy) {
        if (targetAVM[propertyName] === targetAVM) {
            //Getting the AVM itself.
            return targetAVM;
        } else if (typeof(targetAVM[propertyName]) !== 'undefined') {
            return targetAVM[propertyName].getUpdatedValue();
        } else {
            return undefined;
        }
    };

    static setFunction(targetAVM, propertyName, newValue, receiverProxy) {
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

    static auto(onRecompute = AutomagicVariable.valueRecomputeFunction) {
        AutomagicVariable.AVNewAV = new AutomagicVariable(true);
        AutomagicVariable.AVNewAV.onRecompute = onRecompute;
        AutomagicVariable.AVNewAV.recompute();
        return AutomagicVariable.AVNewAV;
    }

    static value(initialValue = undefined) {
        AutomagicVariable.AVNewAV = new AutomagicVariable(false);
        AutomagicVariable.AVNewAV.onRecompute = AutomagicVariable.valueRecomputeFunction;
        //Setter inline.
        AutomagicVariable.AVNewAV.valueProperty = initialValue;
        return AutomagicVariable.AVNewAV;
    }

    static autoValue(onRecompute) {
        AutomagicVariable.AVNewAV = new AutomagicVariable(false);
        AutomagicVariable.AVNewAV.onRecompute = function(self, newValue) {
            if (typeof(newValue) === 'undefined') {
                return onRecompute(self, newValue);
            } else {
                //Setter inline.
                self.valueProperty = newValue;
            }
        };
        AutomagicVariable.AVNewAV.recompute();
        return AutomagicVariable.AVNewAV;
    }

    mergeInternalsFrom(av) {
        this.valueProperty = av.valueProperty;
        av.dependents.forEach(this.dependents.add, this.dependents);
        this.isDirty = av.isDirty;
        this.onRecompute = av.onRecompute;
    }

    getUpdatedValue() {
        if (AutomagicVariable.RecomputingAVs.length > 0) {
            if (AutomagicVariable.RecomputingAVs[0] === this) {
                AutomagicVariable.RecomputingAVs = [];
                throw 'Error: AutomagicVariable recursion detected!';
            } else {
                this.dependents.add(AutomagicVariable.RecomputingAVs[0]);
            }
        }
        //Getter inline.
        if (this.isDirty) {
            this.recompute();
        }
        return this.valueProperty;
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
        //Setter inline.
        self.valueProperty = newValue;
    };
}
AutomagicVariable.RecomputingAVs = [];

let AVMap = AutomagicVariableMap;
let AV = AutomagicVariable;
module.exports = { AutomagicVariableMap, AVMap: AutomagicVariableMap, AutomagicVariable, AV: AutomagicVariable };