'use strict';

//Code published to: https://github.com/AndrewDavis/AutomagicVariable

globalThis._AVTypesByName = { 'const': 0, 'val': 1, 'auto': 2 };
globalThis._AVTypesByValue = { 0: 'const', 1: 'val', 2: 'auto' };

class AVMap {
    constructor(avConfigPropertyName = 'av') {
        this[avConfigPropertyName] = new _AVConfig(this, avConfigPropertyName);
    }
}

//Don't use this class directly.
class _AVConfig {
    constructor(avObj, avConfigPropertyName) {
        //The actual AVMap class, with the getters and setters for each property.
        this._avObj = avObj;
        this.avConfigPropertyName = avConfigPropertyName;
        //An internal mapping of the AVMap class, with the actual _AutomagicVariable instances for each property.
        this._avObj._avMap = {};
        this._avMap = this._avObj._avMap;
        this.setup();
        return new Proxy(this, {
            get: _AVConfig._getFunction,
            set: _AVConfig._setFunction,
            deleteProperty: _AVConfig._deletePropertyFunction
        });
    }

    static _getFunction(targetAVConfig, propertyName/*, receiverProxy*/) {
        _AVConfig._PropertyNames.push(propertyName);
        return targetAVConfig._avFunctions;
    };

    static _setFunction(/*targetAVConfig, propertyName, newValue, receiverProxy*/) {
        //No!
        return false;
    }

    static _deletePropertyFunction(targetAVConfig, propertyName) {
        if (propertyName == this.avConfigPropertyName) {
            throw 'Error: Attempting to delete a reserved property name! (' + this.avConfigPropertyName + ')';
        }
        targetAVConfig._avMap[propertyName]._touched();
        delete targetAVConfig._avObj[propertyName];
        delete targetAVConfig._avMap[propertyName];
        return true;
    }

    get _currentPropertyName() {
        _AVConfig.TestPropertyName = _AVConfig._PropertyNames.pop()
        if (_AVConfig.TestPropertyName == this.avConfigPropertyName) {
            throw 'Error: Attempting to define a reserved property name! (' + this.avConfigPropertyName + ')';
        }
        return _AVConfig.TestPropertyName;
    }

    setup() {
        this._avFunctions = {
            //Creates a constant value; no automagix necessary here.
            const: function(value) {
                _AVConfig.CurrentName = this._currentPropertyName;
                this._ensureAVDoesntExist(_AVConfig.CurrentName);
                this._avMap[_AVConfig.CurrentName] =
                    _AutomagicVariable.const(this._avObj, _AVConfig.CurrentName, value);
            }.bind(this),

            //Creates a value which can change, and thus can have AV subscribers.
            val: function(value) {
                _AVConfig.CurrentName = this._currentPropertyName;
                this._ensureAVDoesntExist(_AVConfig.CurrentName);
                this._avMap[_AVConfig.CurrentName] =
                    _AutomagicVariable.val(this._avObj, _AVConfig.CurrentName, value);
            }.bind(this),

            //Creates a value which automagically recomputes based on subscriptions to other AV's.
            auto: function(onRecompute, value = undefined) {
                _AVConfig.CurrentName = this._currentPropertyName;
                this._ensureAVDoesntExist(_AVConfig.CurrentName);
                this._avMap[_AVConfig.CurrentName] =
                    _AutomagicVariable.auto(this._avObj, _AVConfig.CurrentName, onRecompute, value);
            }.bind(this),

            //Creates a reference to an existing AV instance. Pass get() here.
            ref: function(existingAV) {
                _AVConfig.CurrentName = this._currentPropertyName;
                this._ensureAVDoesntExist(_AVConfig.CurrentName);
                this._avMap[_AVConfig.CurrentName] = existingAV._ref(this._avObj, _AVConfig.CurrentName);
            }.bind(this),

            //Returns the AV mapped at the property, if any. Pass this to ref().
            get: function() {
                return this._avMap[this._currentPropertyName];
            }.bind(this),

            //Subscribes the AV to an existing subscribee AV instance. Pass get() here.
            subscribeTo: function(subscribeeAV) {
                this._avMap[this._currentPropertyName]._subscribeTo(subscribeeAV);
            }.bind(this),

            //Marks all of the AV's subscribers as dirty, recursively.
            touched: function() {
                this._avMap[this._currentPropertyName]._touched();
            }.bind(this),

            //Forces the AV to recompute, if possible. This is the equivalent to setting its value.
            recompute: function(value) {
                this._avObj[this._currentPropertyName] = value;
            }.bind(this),

            //Returns true if an AV is mapped at the property.
            exists: function() {
                return (typeof(this._avMap[this._currentPropertyName]) !== 'undefined');
            }.bind(this)
        };
        //Gets the AV's last value, without updating it.
        Object.defineProperty(this._avFunctions, 'last', {
            configurable: true,
            enumerable: true,
            get: function() {
                return this._avMap[this._currentPropertyName].value;
            }.bind(this)
        });
    }

    _ensureAVDoesntExist(name) {
        if (typeof(this._avMap[name]) !== 'undefined') {
            //If you really want to overwrite an existing AV, delete it first!
            throw 'Error: Attempting to redefine an AutomagicVariable! (' + name + ')';
        }
    }
}
_AVConfig._PropertyNames = [];

//Don't use this class directly.
class _AutomagicVariable {
    constructor(name, type, value) {
        this.name = name;
        this.type = type;
        this.value = value;
    }

    static const(avObj, name, value) {
        let newAV = new _AutomagicVariable(name, _AVTypesByName.const, value);
        newAV.subscribers = _AutomagicVariable.EmptySet;
        newAV._desc = {
            configurable: true,
            enumerable: true,
            get: function() {
                return newAV.value;
            },
            set: function(newValue) {
                //If you really want this capability, then use val()...
                throw 'Error: Attempting to set a const value! (' + name + ', old: ' +
                    newAV.value + ', new: ' + newValue + ')'
            }
        };
        Object.defineProperty(avObj, name, newAV._desc);
        return newAV;
    }

    static val(avObj, name, value) {
        let newAV = new _AutomagicVariable(name, _AVTypesByName.val, value);
        newAV.subscribers = new Set();
        newAV._desc = {
            configurable: true,
            enumerable: true,
            get: function() {
                newAV._autoSubscribe();
                return newAV.value;
            },
            set: function(newValue) {
                newAV.value = newValue;
                newAV._touched();
            }
        };
        Object.defineProperty(avObj, name, newAV._desc);
        return newAV;
    }

    static auto(avObj, name, onRecompute, value = undefined) {
        let newAV = new _AutomagicVariable(name, _AVTypesByName.auto, undefined);
        newAV.subscribers = new Set();
        newAV.onRecompute = onRecompute;
        newAV.isDirty = false;
        newAV._desc = {
            configurable: true,
            enumerable: true,
            get: function() {
                newAV._autoSubscribe();
                if (newAV.isDirty) {
                    newAV._recompute(undefined);
                }
                return newAV.value;
            },
            set: function(value) {
                return newAV._recompute(value);
            }
        };
        Object.defineProperty(avObj, name, newAV._desc);
        avObj[name] = value;
        return newAV;
    }

    _ref(avObj, name) {
        Object.defineProperty(avObj, name, this._desc);
    }

    _recompute(value) {
        _AutomagicVariable._RecomputingAVs.push(this);
        this.isDirty = false;
        if (this.onRecompute(this, value) !== false) {
            this._touched();
        }
        _AutomagicVariable._RecomputingAVs.pop();
    }

    _touched() {
        for (let subscriber of this.subscribers) {
            subscriber.isDirty = true;
            subscriber._touched();
        }
    }

    _autoSubscribe() {
        if (_AutomagicVariable._RecomputingAVs.length > 0) {
            _AutomagicVariable.LastRecomputingAV = _AutomagicVariable._RecomputingAVs[
                _AutomagicVariable._RecomputingAVs.length - 1];
            if (_AutomagicVariable.LastRecomputingAV === this) {
                _AutomagicVariable._RecomputingAVs = [];
                throw 'Error: Automagic Variable recursion detected! (' + this.name + ')';
            }
            this.subscribers.add(_AutomagicVariable.LastRecomputingAV);
        }
    }

    _subscribeTo(subscribeeAV) {
        subscribeeAV.subscribers.add(this);
    }
}
_AutomagicVariable.EmptySet = new Set();
_AutomagicVariable._RecomputingAVs = [];

//module.exports = { AVMap };