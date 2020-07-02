# AutomagicVariable

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
- Are updated in multiple various places in the code?
- Are not necessarily changed every time they're updated?
- Are updated individually, e.g. this time around, only `containerWidth` needed to change?

Now you need to call and maintain calls to `updateCenterPoint()` in multiple places in your code.

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
`NaN` values elsewhere in your code, etc.

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

I **declare** that the best approach is one which mixes this imperative and declarative functionality into one language,
and lets you the programmer decide which you would like to use here or there. Therefore, having my wants stated, I have
as a result then **imperatively** coded this lightweight Automagic Variable library to provide just such functionality!
:)

---

## How to Use it

First, the basics. There are 2 classes involved here: `AutomagicVariableMap` and `AutomagicVariable`. These have the
following aliases, for your convenience:
```js
let AVMap = AutomagicVariableMap;
let AV = AutomagicVariable;
```
To solve the initial problem presented above, you'll first need to create an AVMap, which acts as a *necessary*
container for `AutomagicVariable`'s. Then, with that created, you can start assigning it some values as properties:
```js
let avm = AVMap.create();
avm.containerWidth = 400.0;
avm.containerHeight = 300.0;
```
You may not know it, but here we've just created 2 `AutomagicVariable`'s! They've been automagically created. More on
that later.

Now, for the automagic part:
```js
avm.centerX = AV.auto(function(self) {
    self.value = avm.containerWidth * 0.5;
});
avm.centerY = AV.auto(function(self) {
    self.value = avm.containerHeight * 0.5;
});
```
Here, we've explicitly created 2 AV's, and we've given then automagic `recompute()` functions. The best part is, we
don't even need to call them! That's it! The code is all setup! They've been setup *declaratively*, such that whenever
the values of `avm.containerWidth` or `avm.containerHeight` change, they will automagically be marked as *dirty*
(touched, in need of an update).

Now, note that this does *not* mean that they will immediately be recomputed. Why? Because it's not necessary yet, and
their *dependencies* might get updated multiple times before their updated value is needed, e.g.:
```js
avm.containerWidth = 500.0;
avm.containerHeight = 400.0;
avm.containerWidth = 600.0;
avm.containerHeight = 500.0;
```
What happens at this point is, the next time the values of `avm.centerX` or `avm.centerY` are needed/requested in any
way, their `recompute()` function that you provided in their AV's creation will be called, and their values updated:
```js
//Half of the last values set.
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
And that's all! All of these values will now automagically update, only when you need them to, and always be as valid as
you've made them to be here. Not too bad, eh?

Now you might be saying, "Hold on though... This code is more verbose!" Yes, currently, it is *slightly* more verbose.
However, consider the benefits you get in return:
- *You Only* need to write this *Code Once* (*#YOCO*): there's no need to call functions all over your code to keep things
  up-to-date.
- No bugs whatsoever.
- You can divert your complete focus to the rest of your code.

## More to Come!

There's a lot more to put here!