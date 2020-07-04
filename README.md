# AutomagicVariable

# Currently Broken v2.0

**Work was in progress (but slow, due to the use of JS `Proxy`), but a newer and better 3.0 version is in the works instead.**

**Do not use AV in its current state until this message is removed!**

---
---
---
---
---
---
---
---
---
---

## Intro

Automagic Variable is a JavaScript library which solves the problem of keeping variables which depend on other variables
up-to-date.

## Example

For instance, say you're drawing text at the center of a container. You might have code like:
```js
let containerWidth = 400.0;
let containerHeight = 300.0;
let centerX;
let centerY;
function updateCenterPoint() {
    centerX = containerWidth * 0.5;
    centerY = containerHeight * 0.5;
}
```
This works just fine as it is; however, what if the container's dimensions:
- are updated in multiple various places in the code?
- are not necessarily changed every time around (i.e. there are conditions)?
- are updated individually, e.g. "This time around, only `containerWidth` needed to change"?

Now you need to call and maintain the calls to `updateCenterPoint()` in multiple places in your code.

### Complicating Things

Let's complicate things further, to make it more realistic. Suppose it's not always at the centerpoint that you wish to
draw your text, maybe it's according to some ratio.

Furthermore, you want to validate your calculations before setting them; it would be nice to be able to set minimum and
maximum values for each as well... And maybe you want to base those off of the ratios somewhat. Now your code looks
something like:
```js
let containerWidth = 400.0;
let containerHeight = 300.0;
let xRatio = 0.45;
let yRatio = 0.2;
let minPointX;
let maxPointX;
let minPointY;
let maxPointY;
let pointX;
let pointY;
function updateBounds() {
    minPointX = xRatio * 100.0;
    maxPointX = xRatio * 200.0;
    minPointY = yRatio * 150.0;
    maxPointY = yRatio * 250.0;
}
function updatePoint() {
    centerX = Math.max(minPointX, Math.min(maxPointX, containerWidth * xRatio));
    centerY = Math.max(minPointY, Math.min(maxPointY, containerHeight * yRatio));
}
```
But now, ***uh oh***, that `xRatio` and `yRatio` can change in multiple different places in the code. Not only that...
they are even being updated now from other classes and other code that you didn't write!

Now you're not assured that `updateBounds()` will always be called when it needs to be, nor `updatePoint()` when it
needs to be. Due to the fact that you're writing JavaScript, this means that you're potentially dealing with `null` or
`NaN` values elsewhere in your code, which don't show up for 200 more lines of code, etc.

*If only there were a way to have these values update automagically, passively recomputing lazily, only when you need
them to!*

**Enter Automagic Variable.**

## Theory

Normally in a language like JavaScript, you're coding **imperatively** (actively), explicitly telling the code what to
do, when, and in what order. This is often exactly what you want; it gives you the most control.

Sometimes, however, you don't really care about the details, you just want to tell the code what you're after and have
it automagically do what you told it to do. This is more along the lines of the **declarative** (passive) approach.

This is important not just because one might be lazy but also because it helps to ensure low code maintenance, low code
redundancy, and therefore far fewer bugs or errors, as well as less debugging, problem solving, and headache in result.
At some point, this becomes more valuable than the *maximum optimal most efficient way* for your code to operate,
because *perfectly working code is better than perfectly fast code*.

### Conclusion

I say therefore that the best approach is one which mixes this imperative and declarative functionality into one
language, and lets you the programmer decide which you would like to use here or there. This lightweight Automagic
Variable library provides you with just such functionality! :)

---

## How to Use it

First, the basics. There are 2 classes involved here: `AutomagicVariableMap` and `AutomagicVariable`. These have the
following aliases, for your convenience (these can of course be disabled by commenting them out):
```js
let AVMap = AutomagicVariableMap;
let AV = AutomagicVariable;
```
To solve the initial problem presented earlier, you'll first need to create an `AVMap`, which acts as a *necessary*
container for `AutomagicVariable`'s. Then, with that created, you can start assigning it some values as properties:
```js
let avm = AVMap.create();
avm.containerWidth = 400.0;
avm.containerHeight = 300.0;
```
You may not know it, but here we've just created 2 `AutomagicVariable`'s! They've been automagically created. More on
that later...

Now, for the automagic part:
```js
avm.centerX = AV.auto(function(self) {
    self.value = avm.containerWidth * 0.5;
});
avm.centerY = AV.auto(function(self) {
    self.value = avm.containerHeight * 0.5;
});
```
Here, we've explicitly created 2 `AV`'s, and we've given them automagic `recompute()` `function`s. The best part is, we
don't even need to call them! That's it, the code is all setup! They've been setup *declaratively*, such that whenever
the values of `avm.containerWidth` or `avm.containerHeight` change, they will automagically be marked as *dirty*
(touched, in need of an update).

Now, note that this does *not* mean that they will immediately be recomputed. Why? Because it's not necessary yet, and
their *dependencies* might get updated multiple times before their updated value is needed, e.g. other code might do:
```js
avm.containerWidth = 500.0;
avm.containerHeight = 400.0;
avm.containerWidth = 600.0;
avm.containerHeight = 500.0;
```
What happens at this point is, the next time the values of `avm.centerX` or `avm.centerY` are needed/requested in any
way, their `recompute()` `function` that you provided in their `AV`'s creation will be called, and their values
automagically updated:
```js
//Half of the last set boundary values.
console.log(avm.centerX); //300.0
console.log(avm.centerY); //250.0
```

## Now for the More Complicated Example

Okay, simple enough! Now what about the more complicated example? You could code it like this:
```js
let avm = AVMap.create();
avm.containerWidth = 400.0;
avm.containerHeight = 300.0;
avm.xRatio = 0.45;
avm.yRatio = 0.2;
avm.minPointX = AV.auto(function(self) {
    self.value = avm.xRatio * 100.0;
});
avm.maxPointX = AV.auto(function(self) {
    self.value = avm.xRatio * 200.0;
});
avm.minPointY = AV.auto(function(self) {
    self.value = avm.yRatio * 150.0;
});
avm.maxPointY = AV.auto(function(self) {
    self.value = avm.yRatio * 250.0;
});
avm.centerX = AV.auto(function(self) {
    self.value = Math.max(avm.minPointX, Math.min(avm.maxPointX, avm.containerWidth * avm.xRatio));
});
avm.centerY = AV.auto(function(self) {
    self.value = Math.max(avm.minPointY, Math.min(avm.maxPointY, avm.containerHeight * avm.yRatio));
});
```
And that's all! All of these values will now automagically update, only when you need them to, and will always be as
valid as you've made them to be here. Not too bad, eh?

Now you might be saying, "Hold on though... This code is more verbose!" Yes, currently, it is *slightly* more verbose.
However, consider the benefits you get in return:
- *You Only* need to write this *Code Once* (*#YOCO*): there's no need to call `function`s all over your code to keep things
  up-to-date.
- No bugs whatsoever.
- You can now divert your complete focus to the rest of your code.

---

## How it Works

The main magic behind AV is the JavaScript `Proxy`. The `Proxy` allows control over an object's properties' accessors.
It functions much like a getter and setter `function` would, except that these `function`s are applied to **all** of the
object's properties, not just an individual property.

Because a `Proxy` only allows control over an object's properties and *not* over the object itself, Automagic Variable
cannot function ideally on its own. This current implementation is actually Automagic Variable 2.0; version 1.0 did not
use a `Proxy`, and as a result, every single access to an `AV`'s value required the use of a `.value`, which was mildly
obnoxious.

To fix this in AV 2.0, another class was created: `AutomagicVariableMap` (`AVMap`). AVMap allows you to create a single
instance of it (or as many as you like, but typically you would only need/want 1 per class instance that uses it), and then use
that instance for all of your `AV`'s. In this manner, the `AV` class can function similarly to how it did in 1.0, while
the `AVMap` class is what actually implements the `Proxy`, so that you can access an `AV` like so:
```js
let avm = AVMap.create();
//Setter #1.
avm.myAV = 100;
```
`AVMap.create()` here simply creates and returns a new `Proxy` instance, nothing tricky there. `avm.myAV = 100;`, on the
other hand, invokes the `Proxy`'s setter `function`. Its logic does 1 of 3 things:

- If the property does not yet exist (like in the above case):
  - (1.) If the new value (`100` here) is determined not to be an `AV` (`true`), it will automagically create a
    **value**-type `AV`, which wraps the new value (`100`), and then assign that new `AV` to the property (`avm.myAV`).
  - (2.) If the new value is determined to *already* be an `AV`, then it merely assigns the existing `AV` to the
    property.
- If the property *already* exists:
  - (3.) It is assumed to always be an `AV` (should be), and that property's `recompute()` function is then invoked with
    the new value (`100`).

You've already seen case #1 above. #2 and #3 would look like this:
```js
//Setter #2.
avm.myOtherAV = AV.auto(function(self) {
    self.value = avm.myAV * 2;
});
//Setter #3 (because `avm.myAV` already exists).
avm.myAV = 150;
```
The `function` provided to `AV.auto()` above is the `AV`'s `onRecompute()` `function`, which acts as a callback
`function` (or event handler) for whenever its `recompute()` `function` is invoked, which is usually done automagically.

Note that `avm.myOtherAV`'s current value, as it stands, is `200`. Why? Because its `onRecompute()` `function` was
automagically invoked upon creation of the `AV`. You may think this is unnecessary; however, it needs to be invoked at
least once in order to establish its **dependencies** - or, rather, to add itself as a **dependent** to its
*dependencies*.

Before we examine that, first let's finish up with the value of `avm.myOtherAV`. So when you go to log its value, what
will you get?
```js
//Getter #2.
console.log(avm.myOtherAV);
```
Answer: `300`. While the above code *looks* like it's merely logging the value of a property, it's *actually* calling
the `avm` `Proxy`'s getter `function`, which has similar logic to the setter `function` and does, once again, 1 of 3
things:

- If the property refers to the `avm` itself (which would be `avm._` or `avm._avm` both):
  - (1.) Returns the `AVMap` instance. (The main purpose of this is to determine whether an object is an AVM.)
- If the property does not refer to the `avm` itself:
  - If the property exists:
    - (2.) Recomputes (if necessary, if dirty) and returns the updated value.
  - If the property does not exist:
    - (3.) ???

### Dependencies and Dependents

---

## Why it is the Way it is

In this section, justification will be provided for the mechanics of AV.

---

## More to Come!

There's more to put here!