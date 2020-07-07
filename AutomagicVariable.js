'use strict';

//Code published to: https://github.com/AndrewDavis/AutomagicVariable

//const  _AVOptimize = true;
//globalThis._AVOptimize = _AVOptimize;

globalThis._AVTypesByName = { 'const': 0, 'val': 1, 'auto': 2, 'autoVal': 3, 'autoOnly': 4 };
globalThis._AVTypesByValue = { 0: 'const', 1: 'val', 2: 'auto', 3: 'autoVal', 4: 'autoOnly' };

class AVMap {
    constructor(avConfigPropertyName = 'av') {
        //if (!_AVOptimize) {
        //    this._configPropertyName = avConfigPropertyName;
        //}
        Object.defineProperty(this, avConfigPropertyName, {
            configurable: false,
            enumerable: true,
            value: new _AVConfig(this, avConfigPropertyName),
            writable: false
        });
    }
}

//Don't use this class directly. This is basically a decorator of AVMap, which will have internal _AutomagicVariable
//instances and externally-facing getters and setters.
class _AVConfig {
    constructor(avObj, avConfigPropertyName) {
        //The actual AVMap class, with the externally-facing getters and setters for each property.
        this._avObj = avObj;
        //if (!_AVOptimize) {
        //    this._name = avConfigPropertyName;
        //}
        //An internal mapping of the AVMap class, with the actual _AutomagicVariable instances for each property.
        this._avObj._avMap = {};
        this._avMap = this._avObj._avMap;
        this._setup();
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

    static _setFunction(targetAVConfig, propertyName, newValue/*, receiverProxy*/) {
        //Invoke val();
        _AVConfig._PropertyNames.push(propertyName);
        targetAVConfig._avFunctions.val(newValue);
        return true;
    }

    static _deletePropertyFunction(targetAVConfig, propertyName) {
        if (typeof(targetAVConfig._avMap[propertyName]) === 'undefined') {
            throw 'Error: Attempting to delete non-existent Automagic Variable ' + propertyName + '!';
        }
        targetAVConfig._avMap[propertyName]._touched();
        delete targetAVConfig._avObj[propertyName];
        delete targetAVConfig._avMap[propertyName];
        return true;
    }

    get _currentPropertyName() {
        _AVConfig.TestPropertyName = _AVConfig._PropertyNames.pop()
        return _AVConfig.TestPropertyName;
    }

    _setup() {
        this._avFunctions = {
            //Creates a constant value; no automagix necessary here.
            const: function(value) {
                _AVConfig.CurrentName = this._currentPropertyName;
                this._ensureAVDoesntExist(_AVConfig.CurrentName);
                this._avMap[_AVConfig.CurrentName] =
                    _AutomagicVariable._const(this._avObj, _AVConfig.CurrentName, value);
            }.bind(this),

            //Creates a value which can change, and thus can have AV subscribers.
            val: function(value) {
                _AVConfig.CurrentName = this._currentPropertyName;
                this._ensureAVDoesntExist(_AVConfig.CurrentName);
                this._avMap[_AVConfig.CurrentName] =
                    _AutomagicVariable._val(this._avObj, _AVConfig.CurrentName, value);
            }.bind(this),

            //Creates a value which automagically recomputes based on subscriptions to other AV's, and handles any set
            //values in the recompute function.
            auto: function(onRecompute, value = undefined) {
                _AVConfig.CurrentName = this._currentPropertyName;
                this._ensureAVDoesntExist(_AVConfig.CurrentName);
                this._avMap[_AVConfig.CurrentName] =
                    _AutomagicVariable._auto(this._avObj, _AVConfig.CurrentName, _AVTypesByName.auto,
                        onRecompute, value);
            }.bind(this),

            //Creates a value which automagically recomputes based on subscriptions to other AV's, and handles any set
            //values by changing out the internal value.
            autoVal: function(onRecompute, value = undefined) {
                _AVConfig.CurrentName = this._currentPropertyName;
                this._ensureAVDoesntExist(_AVConfig.CurrentName);
                this._avMap[_AVConfig.CurrentName] =
                    _AutomagicVariable._auto(this._avObj, _AVConfig.CurrentName, _AVTypesByName.autoVal,
                        onRecompute, value);
            }.bind(this),

            //Creates a value which automagically recomputes based on subscriptions to other AV's, and blocks any set
            //values.
            autoOnly: function(onRecompute, value = undefined) {
                _AVConfig.CurrentName = this._currentPropertyName;
                this._ensureAVDoesntExist(_AVConfig.CurrentName);
                this._avMap[_AVConfig.CurrentName] =
                    _AutomagicVariable._auto(this._avObj, _AVConfig.CurrentName, _AVTypesByName.autoOnly, onRecompute);
            }.bind(this),

            //Returns the AV mapped at the property, if any. Pass this to subscribeTo().
            get: function() {
                return this._avMap[this._currentPropertyName];
            }.bind(this),

            //Subscribes the AV to an existing subscribee AV instance. Pass get() here.
            subscribeTo: function(subscribeeAV) {
                this._avMap[this._currentPropertyName]._subscribeTo(subscribeeAV);
            }.bind(this),

            //Marks all of the AV's subscribers as dirty.
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
            throw 'Error: Attempting to redefine Automagic Variable "' + name + '" (delete first)!';
        }
    }
}
_AVConfig._PropertyNames = [];

//Don't use this class directly.
class _AutomagicVariable {
    constructor(/*name, type, */value) {
        //if (!_AVOptimize) {
        //    this._name = name;
        //    this._type = type;
        //}
        this.value = value;
    }

    static _const(avObj, name, value) {
        let newAV = new _AutomagicVariable(/*name, _AVTypesByName.const, */value);
        newAV.subscribers = _AutomagicVariable.EmptySet;
        Object.defineProperty(avObj, name, {
            configurable: true,
            enumerable: true,
            get: function() {
                return newAV.value;
            },
            set: function(newValue) {
                //If you really want this capability, then use val()...
                throw 'Error: Attempting to set Automagic Variable const value for "' + name + '"! (old: ' +
                    newAV.value + ', new: ' + newValue + ')'
            }
        });
        return newAV;
    }

    static _val(avObj, name, value) {
        let newAV = new _AutomagicVariable(/*name, _AVTypesByName.val, */value);
        newAV.subscribers = new Set();
        Object.defineProperty(avObj, name, {
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
        });
        return newAV;
    }

    static _auto(avObj, name, type, onRecompute, value = undefined) {
        let newAV = new _AutomagicVariable(/*name, type, */undefined);
        newAV.subscribers = new Set();
        newAV.onRecompute = onRecompute;
        newAV.isDirty = false;
        switch (type) {
            case _AVTypesByName.auto: {
                Object.defineProperty(avObj, name, {
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
                        newAV._recompute(value);
                    }
                });
                break;
            }
            case _AVTypesByName.autoVal: {
                Object.defineProperty(avObj, name, {
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
                        if (typeof(value) === 'undefined') {
                            //Auto.
                            newAV._recompute(value);
                        } else {
                            //Value.
                            newAV.value = value;
                            newAV._touched();
                        }
                    }
                });
                break;
            }
            case _AVTypesByName.autoOnly: {
                Object.defineProperty(avObj, name, {
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
                        if (typeof(value) === 'undefined') {
                            //Auto.
                            newAV._recompute(value);
                        } else {
                            //Auto only.
                            throw 'Error: Attempting to set Automagic Variable auto-only value for "' + name +
                                '"! (old: ' + newAV.value + ', new: ' + value + ')'
                        }
                    }
                });
                break;
            }
            default: {
                throw 'Error: Unsupported Automagic Variable auto type "' + type + '" for "' + name + '"!';
                break;
            }
        }
        //Invoke the setter to recompute with the given value.
        avObj[name] = value;
        return newAV;
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
        }
    }

    _autoSubscribe() {
        if (_AutomagicVariable._RecomputingAVs.length > 0) {
            this.subscribers.add(_AutomagicVariable._RecomputingAVs[_AutomagicVariable._RecomputingAVs.length - 1]);
        }
    }

    _subscribeTo(subscribeeAV) {
        subscribeeAV.subscribers.add(this);
    }
}
_AutomagicVariable.EmptySet = new Set();
_AutomagicVariable._RecomputingAVs = [];

//module.exports = { AVMap };