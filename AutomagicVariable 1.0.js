'use strict';

function noRecomputeDefined() {
    throw 'No recompute function defined!';
}

/**
 * @description No, not a typo! See constructor.
 * @class AutomagicVariable
 */
class AutomagicVariable {
    /**
     * Creates an AutomagicVariable.
     * @param [{ initialValue = undefined, onRecompute = undefined, dependencies = [], onValidate = undefined } = {}]
     * Optional parameters. initialValue is what it says and will start out the AV as not dirty.
     * onRecompute defines the recomputation function for if and when the AV is dirty.
     * dependencies is an array of other AV's (must be AV's!), which when any of them are set or
     * marked dirty will mark this AV as dirty. In order for AV to function properly, all of the
     * values that it depends upon must be listed in the dependencies (including in functions it
     * calls!), and AV.value ought to be utilized for best surety of proper use. onValidate
     * defines the validation function for if and when the value is ever set, including the
     * initialValue; its purpose is for post-validation corrections like bounds checking.
     * onRecompute and onValidate should *only* return (not set) what the updated value will be!
     * Don't touch the AV.private variables!
     */
    constructor({ initialValue = undefined, onRecompute = undefined, dependencies = [], onValidate = undefined } = {}) {
        //For internal use only!
        this.private = {
            //The actual value.
            value: initialValue,

            //Whether the value needs to be recomputed.
            isDirty: false,
            //An array of other AutomagicVariables to mark as dirty when this becomes dirty.
            //Note: not the same as the array passed in.
            dependents: [],

            //Detect infinite recursion...
            isMarkingDirty: false,
            isGettingValue: false,
            isValidating: false,

            //Maintain the same object structure for JS efficiency.
            onRecompute: null,
            hasRecompute: null,
            validate: null
        };

        if (Globals.isDefined(onValidate)) {
            this.private.validate = onValidate;
            if (Globals.isDefined(initialValue)) {
                this.private.validate(this);
            }
        }

        //Create an empty recompute function if needed, and determine isDirty's initial value.
        if (Globals.isUndefined(onRecompute)) {
            this.private.onRecompute = noRecomputeDefined.bind(this);
            this.private.hasRecompute = false;
            this.private.isDirty = false;
        } else {
            this.private.onRecompute = onRecompute.bind(this);
            this.private.hasRecompute = true;
            if (Globals.isDefined(initialValue)) {
                this.private.isDirty = false;
            } else {
                //If there's a recompute function specified, but no initial value specified, then
                //this variable starts out as dirty, needing to have its value computed.
                this.private.isDirty = true;
            }
        }

        //Go to every dependency listed and add this variable to its dependents array.
        for (let dependency of dependencies) {
            dependency.private.dependents.push(this);
        }

        //TODO: No need to create a new function each time, only need to rebind the same function.
        //Bind and set it here, but create it before the class declaration.
        //This was made private because it should not be called from outside of AutomagicVariable.
        this.private.setValueDirect = function (newValue) {
            this.private.oldValue = this.private.value;
            this.private.value = newValue;
            if (this.private.validate && !this.private.isValidating) {
                this.private.isValidating = true;
                let validateReturnValue = this.private.validate(this);
                //If there's a return value, set the value to that.
                if (Globals.isDefined(validateReturnValue)) {
                    this.private.setValueDirect(validateReturnValue);
                }
                this.private.isValidating = false;
            }
            this.private.oldValue = undefined;
            this.private.isDirty = false;
            this.markDependentsDirty();
        }.bind(this);
    }

    /**
     * @description Call this to explicitly mark this variable and its dependents as dirty,
     * meaning that their values need to be recomputed. Retrieving value will then first
     * automagically recompute the value.
     */
    markDirty() {
        if (this.private.isMarkingDirty) {
            throw 'Infinite recursion detected!';
        }
        this.private.isDirty = true;
        this.markDependentsDirty();
    }

    /**
     * @description Call this to explicitly mark this variable's dependents as dirty,
     * meaning that their values need to be recomputed. Retrieving value will then first
     * automagically recompute the value.
     */
    markDependentsDirty() {
        this.private.isMarkingDirty = true;
        for (let automagicVariable of this.private.dependents) {
            automagicVariable.markDirty();
        }
        this.private.isMarkingDirty = false;
    }

    /**
     * @description No touchy! Retrieve the value, automagically recomputing it first if
     * needed (if dirty). Do not retrieve this.private.value directly!
     */
    get value() {
        if (this.private.isGettingValue) {
            throw 'Infinite recursion detected!';
        }
        if (this.private.isDirty) {
            this.private.isGettingValue = true;
            let computeReturnValue = this.private.onRecompute();
            //If there's a return value, set the value to that.
            if (Globals.isDefined(computeReturnValue)) {
                this.private.setValueDirect(computeReturnValue);
            }
            this.private.isGettingValue = false;
        }
        return this.private.value;
    }

    /**
     * @description No touchy! Call this either straight up or in the onRecompute() function,
     * and it will automagically mark this variable's dependencies as dirty and itself as not
     * dirty. Do not set this.private.value directly!
     */
    set value(newValue) {
        if (this.private.hasRecompute) {
            throw 'Setting variable that has a recompute function!';
        }
        this.private.setValueDirect(newValue);
    }
}

module.exports = AutomagicVariable;