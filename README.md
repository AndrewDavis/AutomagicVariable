# AutomagicVariable (v. 3.0)

## Intro

Automagic Variable ("**AV**") is a JavaScript library which solves the problem of keeping variables which subscribe
to/depend on other variables up-to-date, but only "lazily", on an as-needed basis.

---

## Theory

Normally in a language like JavaScript, you're coding **imperatively** (actively), explicitly telling the code what to
do, when, and in what order. This is often exactly what you want; it gives you the most control:
```js
let x = 100;
let halfX;
function updateHalfX() {
    halfX = x * 0.5;
}
updateHalfX(); //halfX == 50
//...
x = 200;
//Don't forget to update!
updateHalfX(); //halfX == 100
```

Sometimes, however, you don't really care about the details, you just want to tell the code what you're after and have
it automagically do what you told it to do. This is more along the lines of the **declarative** (passive) approach:
```js
let x = 100;
//Pseudo-code (not real JS):
let halfX: x * 0.5; //halfX == 50
//...
//If declarative, halfX will then auto-update as needed.
x = 200; //halfX == 100
```

This is important not just because one might be lazy but also because it helps to ensure low code maintenance, low code
redundancy, and therefore far fewer bugs or errors, as well as less debugging, problem solving, and headache as a
result. At some point, this becomes more valuable than the *maximal optimally most efficient way* for your code to
operate, because *perfectly working code is better than perfectly fast code*.

In conclusion, the best approach is one which mixes this imperative and declarative functionality into one language, and
lets you the programmer decide which you would like to use here or there.

Automagic Variable is a lightweight JavaScript library that provides just such functionality, while also making it easy
and intuitive to use and simultaneously prohibiting or discouraging invalid or improper utilization.

---

## Quick Example

Here's how you would actually implement the example above in JavaScript, using Automagic Variable:
```js
let [ avm, config ] = new AVMap();
//Setup avm.x.
config.x.val(100);
//Setup avm.halfX.
config.halfX.auto(function(self) {
    //Assign avm.halfX's new value here, using self.value.
    self.value = avm.x * 0.5;
});
//Thanks to AV, avm.halfX will then auto-update as needed.
avm.x = 200;
//avm.halfX updates itself on the first access afterwards.
//The function above will automagically be called from here.
console.log(avm.halfX); //100
```

Become very familiar with the above example before moving on.

---

## How to Use

### Setup

First, create a new `AVMap` instance, which all of your `AutomagicVariable`'s will be mapped to/accessed from, and
retrieve the `AVMap` and its automagically created `_config` instance using [destructuring
assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment):
```js
//AVMap constructor returns an array of the new AVMap instance and its internal
//configuration instance.
let [ avm, config ] = new AVMap();
```
Alternatively, you can do e.g.:
```js
let avm = new AVMap()[0];
let config = avm._config;
```
Then, use the automatically created `_config` property (by default) to access the `AVMap`'s internal configuration
instance. This will allow you to setup one of several AV types, by accessing the property names from the `_config`:
```js
//Value types:
//Create a constant AV, which basically has no automagic about it.
config.a.const(100);
//Create an AV which can be manually set, but which does not itself automagically update.
config.b.val(100);

//Actual usage, once setup (no ._config or config.).
avm.b = 200;
//BAD(!): avm.a = 200; //Throws an error!

//Automagic types:
//Create an AV which automagically recomputes its value inside the provided function.
config.c.auto(function(self/*, newValue*/) {
    self.value = avm.b * 2;
});
//Same as above, but if manually assigned to, the provided function will not be used;
//instead, the AV's value will be set directly to whatever is assigned.
config.d.autoVal(function(self) {
    self.value = avm.b * 2;
});
//Same as above, but it cannot be manually assigned to. It only gets its value from the provided
//function, ignoring any manual assignments.
config.e.autoOnly(function(self) {
    self.value = avm.b * 2;
});

//Can manually assign a value, but it's currently being ignored.
avm.c = 300; //avm.c doesn't change.
//Can manually assign a value, and since this is an autoVal type, its value will change.
avm.d = 300; //avm.d == 300
//Can't manually assign a value, since this is an autoOnly type; that is disallowed.
//BAD(!): avm.e = 300; //Throws an error!

//Here, it recomputes avm.c based on its provided function, which yields avm.b * 2 == 400.
console.log(avm.c); //400
```

Before getting into the types, it's important to understand the distinction between the **`AVMap`** itself and its
**`_config`**.

### `AVMap` vs. `AVMap._config`

Here is the distinction:
- Use the **`_config`** to setup Automagic Variables for the first time, and to access them afterwards for anything other
  than basic get/set operations.
  - You would also use the **`_config`** for `delete` calls, which will then `delete` the property from the `AVMap` for
    you, e.g.:
      ```js
      //Good:
      delete config.a;
      ```
- Once an AV is setup, use `AVMap` itself to get/set the AV *value*.
  - Don't call `delete` on `AVMap` properties directly, it won't work like you think! This deletion behavior has been
    explicitly prohibited via. the use of a `Proxy`, to make sure it doesn't ever happen. So, code like this will error:
      ```js
      //Bad(!): delete avm.a;
      ```

Note that the `_config` itself is a JavaScript `Proxy` and is doing some magic behind the scenes; therefore, you cannot
store the configuration access for any particular property, e.g.:
```js
//BAD(!): let xConfig = config.x;
```

Now that you understand this distinction, let's go over the AV types, and then you'll see some more examples.

### The AV Types

Depending on how you create an AV, based on which function you call, you will experience different results:
- The *value* types (having values which are not to be automagically recomputed themselves):
  - `const()`: its value never changes, and thus it does not participate in the automagic process whatsoever; it acts as
    a regular variable
  - `val()`: its value can change, but only manually; it can however be subscribed to by any of the automagic types
- The *automagic* types (provide these with an `onRecompute()` `function`):
  - `auto()`: its value is automagically recomputed whenever it is accessed and has previously been marked "dirty" (in
    need of an update), by one of the Automagic Variables that it subscribes to for updates; if manually assigned a
    value later, nothing will happen unless your `onRecompute()` `function` explicity utilizes said value
    - `autoVal()`: same as `auto()`, except if you manually assign a value later, the variable will have that value
      until it is automagically recomputed
    - `autoOnly()`: same as `auto()`, except you cannot ever manually assign a value to it, and it will error if you try
      to do so

The *value* types are pretty self-explanatory and have already been demonstrated. The *automagic* types require some
examples. See below the code for more explanation:
```js
//Ignoring the newValue parameter.
config.ignoreManualChanges.auto(function(self/*, newValue*/) {
    //self.value = ...;
});
//This does nothing but invoke a recompute; the 10 is ignored.
avm.ignoreManualChanges = 10;

//Handling newValue is optional. If handled like this, it functions exactly like autoVal().
config.c.auto(function(self, newValue) {
    if (typeof(newValue) === 'undefined') {
        self.value = recompute();
    } else {
        self.value = newValue;
    }
});
//See above.
config.d.autoVal(function(self) {
    self.value = recompute();
});
//These manual changes (set calls), unlike above, will not be ignored.
avm.c = 10;
avm.d = 10;

//autoOnly ensures that only the recompute function can change the AV's value.
config.e.autoOnly(function(self) {
    //self.value = ...;
});
try {
    //Throws an error!
    avm.e = 10;
} catch (e) {

}
```
In the `onRecompute()` `function` that gets passed to `auto()`, `autoVal()`, or `autoOnly()`:
- The first parameter (`self`) is the Automagic Variable itself (`_AutomagicVariable` class instance).
  - You assign the AV's new value to `self.value`, if changing its value is desired; otherwise, it will simply maintain
    its old value (default `undefined`, if never set in the `onRecompute()` `function` or otherwise manually).
    - Note: Changing `self.value` operates inside of the AV instance and **not** via. the automagic setter `function`;
      therefore, assigning to it will **not** recursively reinvoke the setter `function`.
- The `return` value of this function, if `false` (or equivalent), will ensure that the subscribers of the AV will not
  be marked dirty (in need of an update) from that particular `onRecompute()` call.
  - Otherwise, the `return` value does nothing. Note that *not* `return`ing anything from the function defaults to
    `undefined`, which is **not** equivalent to `false`, and will therefore mark all subscribers as dirty.

In the `onRecompute()` `function` that gets passed to `auto()` (but not `autoVal()` or `autoOnly()`), the second
parameter (`newValue`) is the value being manually assigned to the AV, whatever it is. You can do or not do (ignore)
whatever you like with this parameter, and it is not required.

### Automagic Subscriptions

One of the great features about Automagic Variable is that it does not require you to explicitly provide an AV's
subscriptions/dependencies. Let's examine this code, for instance:
```js
let [ avm, config ] = new AVMap();
config.i.val(0);
config.j.autoOnly(function(self) {
    self.value = avm.i + 1;
});
config.k.autoOnly(function(self) {
    self.value = avm.j + 1;
});
```
Here, the value of `avm.j` will always be `avm.i + 1`, and the value of `avm.k` will always be `avm.j + 1` (and thus
always `avm.i + 2`). Likewise, even if `avm.i` is modified but `avm.j` is never accessed, when `avm.k` is accessed it
will first invoke an update to `avm.j`, because `avm.i`'s change will **recursively** mark its subscribers as dirty,
which includes `avm.k`, which accesses `avm.j` in its `onRecompute()` function.

But if you think about how this works, you're probably wondering, "How the heck does it automagically keep track of the
subscriptions?"

The answer is that whenever any AV is accessed whatsoever from inside of any other AV's `onRecompute()` `function`, that
AV automagically adds the recomputing AV to its internal `Set` of **subscribers**. This is detected by maintaining a
global stack of recomputing AV's and checking the top of this stack when getting any *non-const* type AV's value. This
happens **additively** for **every** *automagic* type AV, for **every** `onRecompute()` call. (This adds only a very
small performance cost in comparison with the functionality and immense maintainability and bug-elimination gained.)

### Conditions + Etc.

Since it automagically checks for subscribers every time, this means that it will still function properly even if you
have e.g. **AV** conditions inside of the `onRecompute()` `function`, like so:
```js
config.condition.val(true);
config.something.autoOnly(function(self) {
    //This is safe *because* avm.condition is an AV.
    if (avm.condition) {
        //self.value = ...
    } else {
        //self.value = ...
    }
});
avm.condition = false;
```
Since `avm.condition` above is an AV, `avm.something` is added to its subscribers, and therefore, whenever its value
changes, `avm.something` will also update upon its next access.

Now, if you were to do something like this, utilizing a
condition that is **not** an AV, then it may not function properly(!):
```js
let condition = true;
config.something.autoOnly(function(self) {
    //This is UNSAFE because when condition changes, avm.something will not then automagically update!
    if (condition) {
        //self.value = ...
    } else {
        //self.value = ...
    }
});
condition = false;
```
So a good general rule of thumb is to *always use AV's instead of regular variables inside of any AV's `onRecompute()`
`function`*.

### Objects + Etc.

Here is unfortunately one case where Automagic Variable will require some manual attention and care: *any kind of object
or collection access*. This is because these types of variables are often not *set* but rather *accessed* (*get*) and
*then* performed upon in some fashion. Take the `Set` summation example from earlier:
```js
let [ avm, config ] = new AVMap();
config.set.val(new Set());
config.sum.autoOnly(function(self) {
    let sum = 0.0;
    let set = avm.set;
    for (let item of set) {
        sum += item;
    }
    self.value = sum;
});
//These calls do *not* automagically update avm.sum!
avm.set.add(5);
avm.set.add(6);
avm.set.add(7);
//avm.sum will be out-of-date!
console.log(avm.sum);
```
You'll have to make sure that whenever the object or collection is *modified*, to then access it via. the `_config`
and call `touched()` on it, like so:
```js
//Mark the avm.set's subscribers as dirty.
config.set.touched();
//avm.sum will now be up-to-date.
console.log(avm.sum);
```
So long as you make sure to do that, all will be well.

#### Why not consider the object/collection to be touched whenever it's accessed instead?<br/>OR:<br/>Why not use some kind of a notifying object wrapper/`Proxy` instead?

This could be done; however, it would probably reduce the performance too much for many applications.

---

## What about deletions and AV `onRecompute()` `function` modifications?

When you use `delete`, make sure to use it on the **AV** itself and **not** on the `AVMap`:
```js
let [ avm, config ] = new AVMap();
config.property.const(true);
//BAD(!): delete avm.property;
//Good:
delete config.property;
```
This will automagically take care of the deletion of the property from the `AVMap` (`avm.property`) as well.

If you want to modify an AV's `onRecompute()` `function` *in place*, **don't**. This is explicitly prohibited in the
code itself, because there's the potential for different subscribers and subscribees both when this happens. *If the old
subscribers and subscribees are not cleaned up, there could be unwanted artifacts that cause bugs in other code as a
result!* This is why it is prohibited behavior.

If, however, you would like to `delete` and *then recreate* an AV, go right ahead. Not only will this work, but it has
been implemented such that deletion is only *partial* and thus, if you delete and then recreate an AV in place, it will
maintain and update the subscriptions and subscribees as it should **but also** *unlink* itself from its own
subscriptions and subscribees unless and until recreated. It's the most ideal setup that one could hope for. This means
that you can have code like:
```js
config.i.val(0);
config.j.auto(function(self) {
    self.value = avm.i + 1;
});
config.k.auto(function(self) {
    self.value = avm.j + 1;
});
//Delete and then recreate avm.j.
delete config.j;
config.j.autoOnly(function(self) {
    self.value = avm.i + 2;
});
//Delete avm.k, which is no longer wanted.
delete config.k;
```
Note that you can also change the type of an AV this way, if wanted.

---

## How performant is AV?

For regular usage, it performs ~10-20X slower than a (highly optimized) JS object for get/set operations, and ~25-200X
slower for everything else (e.g. setup, deletion, etc.). Several notes about this though:
- This is with perhaps the best equivalent code that can be utilized to compare the two; it might actually be more
performant than that in actuality and under regular coding circumstances.
- AV is still very fast, and the performance cost is likely not due to anything that AV can do better; it's just that JS
  objects are extremely optimized. Some ~4.5-5k AV `get()` and ~1.8-2k AV `set()` operations only take 1 ms to complete,
  for instance.
- AV was not designed to be extremely fast with the creation of Automagic Variables, but rather most optimized for the
  *utilization* (get/set) of said variables after-the-fact.

If using AV but in performance-critical code, you can always (and most probably should) create temporary variables to
store the latest value and refrain from interacting with AV until the performance-critical code is complete. Here's an
example:
```js
let [ avm, config ] = new AVMap();
config.set.val(new Set([ 5, 6, 7, 8 ]));
config.sum.auto(function(self) {
    //Use a temporary variable here for better performance.
    let sum = 0.0;
    let set = avm.set;
    for (let item of set) {
        sum += item;
    }
    //Only interact with the AV when needed, for better performance.
    self.value = sum;
});
```

---

## Extra Documentation

### AVMap

To detect if an object is an AVMap, check if `typeof(avm._avMap) !== 'undefined'`.

### Config

You can see all of the `_config` `function`s and properties (with comments) by examing the `_AVConfig` class's `_setup`
`function`. They are:
- `const()`, `val()`, `auto()`, `autoVal()`, and `autoOnly()`, which have already been demonstrated and documented
  above.
- `get()`: Returns the AV (`_AutomagicVariable` instance) mapped at the property, if any. Pass this to `subscribeTo()`.
  - Example: `config.property.get()`
    - From here, you can access `.value`, `.isDirty`, and, if they exist, `.onRecompute`, `.subscribers`,
      `.subscribees`, `.isDeleted`, `._name`, and `._type`.
- `subscribeTo(subscribeeAV)`: Manually subscribes the AV to an existing subscribee AV instance. Pass `get()` here.
  Note: This is generally unnecessary!
  - Example: `config.subscriber.subscribeTo(config.subscribeeAV.get())`
    - Whenever `avm.subscribeeAV` changes, `avm.subscriber` will then be marked as dirty (in need of an update upon
      next access).
- `touched()`: Manually marks all of the AV's subscribers as dirty, recursively.
  - Example: `config.property.touched()`
- `recompute(value)`: Forces the AV to recompute, if possible. This is the equivalent to setting its value.
  - Example: `config.property.recompute(value) == (avm.property = value);`
- `exists()`: Returns true if an AV is mapped at the property.
  - Example: `config.doIExist.exists() == true/false`
- `last`: Gets the AV's last value, **without** updating it (no `onRecompute()` will be invoked).
  - Example:
  `config.property.last == config.property.get().value == self.value (inside of the onRecompute() function)`

---

## What else is good to know besides the above?

### Don't use internals!

Don't use the `_AVConfig` or `_AutomagicVariable` classes directly, nor any of their `_`-prefixed `function`s or
properties. These are meant to be internal-only. If you do touch any of this (highly unlikely, except perhaps when
debugging), make sure you know exactly what you're doing!

You only need to use `new AVMap()` and access its `_config.` properties. The default `_config` property (`[1]` of what's
returned) on the AVMap itself (`[0]` of what's returned) is `_config`; if you want to change that, you can do so by
specifying a different property name in the `AVMap()` constructor, e.g.: `new AVMap('configPropertyName')` and then
access `avm.configPropertyName`. This of course only applies to that particular `AVMap` instance.

### Ensuring Values are Always Valid

This is one of the prime benefits of using AV: you can have variables which always have the most recently valid value.
To do this, you would do something like:
```js
config.valid.autoOnly(function(self, newValue) {
    //Validate that newValue is not null; if it is, don't update its value.
    //You could also have it print or throw an error, etc.
    if (newValue != null) {
        self.value = newValue;
    }
});
avm.valid = 7; //avm.valid == 7
avm.valid = null; //avm.valid == 7
```

### References

If you wish to have one AV reference another, the best you're going to be able to do is:
```js
config.a.val(0);
config.c.autoOnly(function(self) { self.value = avm.a; });
```
But with this, you won't be able to change `avm.c` and have it change the value of `avm.a`. If you try to do that,
you'll run into a recursive situation.

### Recursion

There are 2 ways to induce recursion using AV's `onRecompute()` `function` improperly. It has been decided that testing
for this is not needed, since the browser will freeze and throw `InternalError: too much recursion` in such a case
anyways. **Note** however that this error does seem to make the JavaScript engine unhappy to continue functioning
*properly*, even if you `catch` the error.

The first and most obvious way to induce recursion is by self-referencing a variable within its own `onRecompute()`
`function`, like so:
```js
//Throws recursion error.
config.recursion.autoOnly(function(self) {
    self.value = avm.recursion + 1;
});
```
If you have code like the above, you may have just wanted to do something like:
```js
//Does not throw recursion error.
config.recursion.autoOnly(function(self) {
    ++self.value;
});
```

The second way to induce recursion is by having a cyclic AV recomputation of some sort, e.g.:
```js
config.recursion1.auto(function(self) {
    self.value = avm.recursion2;
});
config.recursion2.auto(function(self) {
    self.value = avm.recursion1;
});
//Throws recursion error.
avm.recursion1 = 10;
```

So just be on the lookout to make sure you don't write any cyclic AV recomputation. If the code runs and doesn't *ever*
throw this error, then you're good to go.

### Optimization vs. Debugging

The original code would store the `_config` property name in the `AVMap` and `_config` (`_AVConfig`) instances, as well
as a `_name` and `_type` property in the AV (`_AutomagicVariable`) instances. This was then optimized away with an
`_AVOptimize` boolean, which was then optimized away even further by commenting out all of that code... These would be
great to have back in the code for AV-specific debugging purposes, however!

### Freezing/Pausing Concepts: Turned Down

Freezing of an AV's value and pausing updates of an AV's subscribers (temporarily refraining from marking them as dirty)
were both considered but deemed totally unnecessary, a further cost to performance, and likely also a bad idea in
general. If functionality like this is wanted, either utilize a boolean *value* type AV or create a temporary variable
instead.