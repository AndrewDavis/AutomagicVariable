# AutomagicVariable

## Intro

Automagic Variable is a JavaScript library which solves the problem of keeping variables which subscribe to/depend on
other variables up-to-date, but only "lazily", on an as-needed basis.

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
result. At some point, this becomes more valuable than the *maximum optimal most efficient way* for your code to
operate, because *perfectly working code is better than perfectly fast code*.

In conclusion, the best approach is one which mixes this imperative and declarative functionality into one language, and
lets you the programmer decide which you would like to use here or there.

Automagic Variable is a lightweight library provides just such functionality.

---

## How to Use

WIP...