'use strict';

//Code published to: https://github.com/AndrewDavis/AutomagicVariable

globalThis._AVTypesByName = { 'const': 0, 'val': 1, 'auto': 2 };
globalThis._AVTypesByValue = { 0: 'const', 1: 'val', 2: 'auto' };

class AVConfig {
    constructor(avObj) {
        this._avObj = avObj;
        this._avObj._avMap = {};
        this._avMap = this._avObj._avMap;
        this.setup();
        return new Proxy(this, {
            get: AVConfig._getFunction,
            set: AVConfig._setFunction
        });
    }

    static _getFunction(targetAVConfig, propertyName/*, receiverProxy*/) {
        AVConfig._PropertyNames.push(propertyName);
        return targetAVConfig._avFunctions;
    };

    static _setFunction(/*targetAVConfig, propertyName, newValue, receiverProxy*/) {
        //No!
        return false;
    }

    get _currentPropertyName() {
        return AVConfig._PropertyNames.pop();
    }

    setup() {
        this._avFunctions = {
            //Creates a constant value; no automagix necessary here.
            const: function(value) {
                let name = this._currentPropertyName;
                this._ensureAVDoesntExist(name);
                this._avMap[name] =
                    _AutomagicVariable.const(this._avObj, name, value);
            }.bind(this),

            //Creates a value which can change, and thus can have AV subscribers.
            val: function(value) {
                let name = this._currentPropertyName;
                this._ensureAVDoesntExist(name);
                this._avMap[name] = _AutomagicVariable.val(this._avObj, name, value);
            }.bind(this),

            //Creates a value which automagically recomputes based on subscriptions to other AV's.
            auto: function(onRecompute, value = undefined) {
                let name = this._currentPropertyName;
                this._ensureAVDoesntExist(name);
                this._avMap[name] = _AutomagicVariable.auto(this._avObj, name, onRecompute, value);
            }.bind(this),

            //Creates a reference to an existing AV instance.
            ref: function(existingAV) {
                let name = this._currentPropertyName;
                this._ensureAVDoesntExist(name);
                this._avMap[name] = existingAV._ref(this._avObj, name);
            }.bind(this),

            //Returns true if an AV is mapped at the property.
            exists: function() {
                return (typeof(this._avMap[this._currentPropertyName]) !== 'undefined');
            }.bind(this),

            //Returns the AV mapped at the property, if any.
            av: function() {
                return this._avMap[this._currentPropertyName];
            }.bind(this),

            subscribeTo: function() {

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
AVConfig._PropertyNames = [];

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
            set: newAV._recompute(value)
        };
        Object.defineProperty(avObj, name, newAV._desc);
        avObj.name = newAV;
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
}
_AutomagicVariable.EmptySet = new Set();
_AutomagicVariable._RecomputingAVs = [];

//module.exports = { AVConfig };