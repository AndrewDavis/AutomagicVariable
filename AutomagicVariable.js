'use strict';

//Code published to: https://github.com/AndrewDavis/AutomagicVariable

//const _AVOptimize = true;
//globalThis._AVOptimize = _AVOptimize;

globalThis._AVTypesByName =  { 'deleted': 0, 'const': 1, 'val': 2, 'auto': 3, 'autoVal': 4, 'autoOnly': 5 };
globalThis._AVTypesByValue = { 0: 'deleted', 1: 'const', 2: 'val', 3: 'auto', 4: 'autoVal', 5: 'autoOnly' };

class AVMap {
    constructor(configPropertyName = '_config') {
        //if (!_AVOptimize) {
        //    this._configPropertyName = configPropertyName;
        //}
        Object.defineProperty(this, configPropertyName, {
            configurable: false,
            enumerable: true,
            value: new _AVConfig(this, configPropertyName),
            writable: false
        });
        //Disallow any attempts to externally delete any AVMap property.
        return [
            new Proxy(this, {
                deleteProperty: function(targetAVConfig, propertyName) {
                    throw 'Error: Attempting to delete Automagic Variable ' + propertyName +
                        '\'s externally facing property!';
                }
            }),
            this[configPropertyName]
        ];
    }
}

//Don't use this class directly. This is basically a decorator of AVMap, which will have internal _AutomagicVariable
//instances and externally-facing getters and setters.
class _AVConfig {
    constructor(avObj, configPropertyName) {
        //The actual AVMap class, with the externally-facing getters and setters for each property.
        this._avObj = avObj;
        //if (!_AVOptimize) {
        //    this._name = configPropertyName;
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
            return false;
        }
        //Have it manage its own deletion, which internally is only partial.
        targetAVConfig._avMap[propertyName]._partialDelete();
        //No more getter/setter access.
        delete targetAVConfig._avObj[propertyName];
        return true;
    }

    get _currentPropertyName() {
        return _AVConfig._PropertyNames.pop();
    }

    _setup() {
        this._avFunctions = {
            //Creates a constant value; no automagix necessary here.
            const: function(value) {
                _AVConfig.CurrentName = this._currentPropertyName;
                _AVConfig.CurrentGetAV = this._avMap[_AVConfig.CurrentName];
                if (typeof(_AVConfig.CurrentGetAV) !== 'undefined' && !_AVConfig.CurrentGetAV.isDeleted) {
                    //If you really want to modify an existing AV, delete it first!
                    throw 'Error: Attempting to redefine Automagic Variable "' + _AVConfig.CurrentName +
                        '" (delete first)!';
                }
                this._avMap[_AVConfig.CurrentName] =
                    _AutomagicVariable._const(_AVConfig.CurrentGetAV, this._avObj, _AVConfig.CurrentName, value);
            }.bind(this),

            //Creates a value which can change, and thus can have AV subscribers.
            val: function(value) {
                _AVConfig.CurrentName = this._currentPropertyName;
                _AVConfig.CurrentGetAV = this._avMap[_AVConfig.CurrentName];
                if (typeof(_AVConfig.CurrentGetAV) !== 'undefined' && !_AVConfig.CurrentGetAV.isDeleted) {
                    //If you really want to modify an existing AV, delete it first!
                    throw 'Error: Attempting to redefine Automagic Variable "' + _AVConfig.CurrentName +
                        '" (delete first)!';
                }
                this._avMap[_AVConfig.CurrentName] =
                    _AutomagicVariable._val(_AVConfig.CurrentGetAV, this._avObj, _AVConfig.CurrentName, value);
            }.bind(this),

            //Creates a value which automagically recomputes based on subscriptions to other AV's, and handles any set
            //values in the recompute function.
            auto: function(onRecompute, value) {
                _AVConfig.CurrentName = this._currentPropertyName;
                _AVConfig.CurrentGetAV = this._avMap[_AVConfig.CurrentName];
                if (typeof(_AVConfig.CurrentGetAV) !== 'undefined' && !_AVConfig.CurrentGetAV.isDeleted) {
                    //If you really want to modify an existing AV, delete it first!
                    throw 'Error: Attempting to redefine Automagic Variable "' + _AVConfig.CurrentName +
                        '" (delete first)!';
                }
                this._avMap[_AVConfig.CurrentName] =
                    _AutomagicVariable._auto(_AVConfig.CurrentGetAV, this._avObj, _AVConfig.CurrentName,
                        _AVTypesByName.auto, onRecompute, value);
            }.bind(this),

            //Creates a value which automagically recomputes based on subscriptions to other AV's, and handles any set
            //values by changing out the internal value.
            autoVal: function(onRecompute, value) {
                _AVConfig.CurrentName = this._currentPropertyName;
                _AVConfig.CurrentGetAV = this._avMap[_AVConfig.CurrentName];
                if (typeof(_AVConfig.CurrentGetAV) !== 'undefined' && !_AVConfig.CurrentGetAV.isDeleted) {
                    //If you really want to modify an existing AV, delete it first!
                    throw 'Error: Attempting to redefine Automagic Variable "' + _AVConfig.CurrentName +
                        '" (delete first)!';
                }
                this._avMap[_AVConfig.CurrentName] =
                    _AutomagicVariable._auto(_AVConfig.CurrentGetAV, this._avObj, _AVConfig.CurrentName,
                        _AVTypesByName.autoVal, onRecompute, value);
            }.bind(this),

            //Creates a value which automagically recomputes based on subscriptions to other AV's, and blocks any set
            //values.
            autoOnly: function(onRecompute, value) {
                _AVConfig.CurrentName = this._currentPropertyName;
                _AVConfig.CurrentGetAV = this._avMap[_AVConfig.CurrentName];
                if (typeof(_AVConfig.CurrentGetAV) !== 'undefined' && !_AVConfig.CurrentGetAV.isDeleted) {
                    //If you really want to modify an existing AV, delete it first!
                    throw 'Error: Attempting to redefine Automagic Variable "' + _AVConfig.CurrentName +
                        '" (delete first)!';
                }
                this._avMap[_AVConfig.CurrentName] =
                    _AutomagicVariable._auto(_AVConfig.CurrentGetAV, this._avObj, _AVConfig.CurrentName,
                        _AVTypesByName.autoOnly, onRecompute);
            }.bind(this),

            //Returns the AV mapped at the property, if any. Pass this to subscribeTo().
            get: function() {
                return this._avMap[this._currentPropertyName];
            }.bind(this),

            //Manually subscribes the AV to an existing subscribee AV instance. Pass get() here. Note: This is generally
            //unnecessary!
            subscribeTo: function(subscribeeAV) {
                this._avMap[this._currentPropertyName]._subscribeTo(subscribeeAV);
            }.bind(this),

            //Manually marks all of the AV's subscribers as dirty, recursively.
            touched: function() {
                this._avMap[this._currentPropertyName]._touched();
            }.bind(this),

            //Forces the AV to recompute, if possible. This is the equivalent to setting its value.
            recompute: function(value) {
                this._avMap[this._currentPropertyName]._recompute(value);
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
}
_AVConfig._PropertyNames = [];

//Don't use this class directly.
class _AutomagicVariable {
    constructor(value, name, type) {
        //if (!_AVOptimize) {
            this._name = name;
            this._type = type;
        //}
        this.value = value;
    }

    static _const(preexistingAV, avObj, name, value) {
        let newAV = new _AutomagicVariable(value, name, _AVTypesByName.const);
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
        newAV._updateSubscriptions(preexistingAV);
        return newAV;
    }

    static _val(preexistingAV, avObj, name, value) {
        let newAV = new _AutomagicVariable(value, name, _AVTypesByName.val);
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
        newAV._updateSubscriptions(preexistingAV);
        return newAV;
    }

    static _auto(preexistingAV, avObj, name, type, onRecompute, value) {
        let newAV = new _AutomagicVariable(undefined, name, type);
        newAV.subscribers = new Set();
        newAV.subscribees = [];
        //*Do not change onRecompute!* Instead, delete and recreate the AV. This will ensure that all subscriptions in
        //both directions are properly cleaned up.
        Object.defineProperty(newAV, 'onRecompute', {
            configurable: true,
            enumerable: true,
            writable: false,
            value: onRecompute
        });
        switch (type) {
            case _AVTypesByName.auto: {
                Object.defineProperty(avObj, name, {
                    configurable: true,
                    enumerable: true,
                    get: function() {
                        newAV._autoSubscribe();
                        if (newAV.isDirty) {
                            newAV._recompute();
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
                            newAV._recompute();
                        }
                        return newAV.value;
                    },
                    set: function(value) {
                        if (typeof(value) === 'undefined') {
                            //Auto.
                            newAV._recompute();
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
                            newAV._recompute();
                        }
                        return newAV.value;
                    },
                    set: function(value) {
                        if (typeof(value) === 'undefined') {
                            //Auto.
                            newAV._recompute();
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
        newAV._updateSubscriptions(preexistingAV);
        //Explicitly call _recompute() at least once, to establish subscribers.
        newAV._recompute();
        return newAV;
    }

    _recompute(value) {
        _AutomagicVariable._RecomputingAVs.push(this);
        this.isDirty = false;
        if (this.onRecompute(this, value) != false) {
            this._touched();
        }
        _AutomagicVariable._RecomputingAVs.pop();
    }

    _touched() {
        //if (_AutomagicVariable._AntiRecursionSet.has(this)) {
        //    //Recursion.
        //    return;
        //}
        ////No recursion.
        //_AutomagicVariable._AntiRecursionSet.add(this);
        for (let subscriber of this.subscribers) {
            subscriber.isDirty = true;
            //Has to be recursive, unfortunately, because the in-between variables may not be accessed and would in that
            //case leave their subscribers out-of-date.
            subscriber._touched();
        }
        //_AutomagicVariable._AntiRecursionSet.delete(this);
    }

    _autoSubscribe() {
        if (_AutomagicVariable._RecomputingAVs.length > 0) {
            _AutomagicVariable.CurrentRecomputingAV =
                _AutomagicVariable._RecomputingAVs[_AutomagicVariable._RecomputingAVs.length - 1];
            if (!this.subscribers.has(_AutomagicVariable.CurrentRecomputingAV)) {
                this.subscribers.add(_AutomagicVariable.CurrentRecomputingAV);
                _AutomagicVariable.CurrentRecomputingAV.subscribees.push(this);
            }
        }
    }

    _subscribeTo(subscribeeAV) {
        if (!subscribeeAV.subscribers.has(this)) {
            subscribeeAV.subscribers.add(this);
            this.subscribees.push(subscribeeAV);
        }
    }

    _partialDelete() {
        this.isDeleted = true;
        //Keep subscribers and subscribees around, because if the AV is ever recreated with the same name, the prior
        //subscribers and subscribees should update their subscriptions.
        delete this.onRecompute;
        //if (!_AVOptimize) {
        //    this._type = _AVTypesByName.deleted;
        //}
        delete this.isDirty;
        delete this.value;
        //Any subscribers will need to be marked dirty due to this partially deleted AV's value being deleted.
        this._touched();
    }

    _updateSubscriptions(preexistingAV) {
        //Perform a "merge" operation with a partially deleted AV, if needed.
        if (typeof(preexistingAV) !== 'undefined') {
            //Do not clear out any subscribees or subscribers which have been partially deleted, even after updating
            //them, as there may be other references by them in the future which need to be updated.
            if (typeof(preexistingAV.subscribees) !== 'undefined') {
                _AutomagicVariable.SubscribeesLength = preexistingAV.subscribees.length;
                for (_AutomagicVariable.CurrentSubscribeeIndex = 0;
                    _AutomagicVariable.CurrentSubscribeeIndex < _AutomagicVariable.SubscribeesLength;
                    ++_AutomagicVariable.CurrentSubscribeeIndex) {
                    preexistingAV.subscribees[_AutomagicVariable.CurrentSubscribeeIndex].subscribers.delete(preexistingAV);
                }
            }
            if (typeof(preexistingAV.subscribers) !== 'undefined') {
                for (_AutomagicVariable.CurrentSubscriber of preexistingAV.subscribers) {
                    //Remove all traces of the old.
                    _AutomagicVariable.CurrentSubscriber.subscribees.splice(
                        _AutomagicVariable.CurrentSubscriber.subscribees.indexOf(preexistingAV), 1);
                    //Replace subscriptions to the new.
                    _AutomagicVariable.CurrentSubscriber._subscribeTo(this);
                }
            }
        }
    }
}
_AutomagicVariable.EmptySet = new Set();
_AutomagicVariable._RecomputingAVs = [];
//_AutomagicVariable._AntiRecursionSet = new Set();

//module.exports = { AVMap };