# Wieldy
The easy to use, lightwight, and especially lovable reactive framework... You're welcome :)

## Setting the scope

Defining a wieldy scope is stupid easy:
```js
var app = new WieldyScope(document.body);
```
You can preset wieldables for the scope by passing an object to the scope constructor:
```js
var app = new WieldyScope(document.body, {
  title: "This is the title"
});

app.title() // Returns "This is the title"
```

## Simple Example Application:
You will notice that in this example "tasks" and "task" are not defined in the WieldyScope constructor.
If a wieldable is referenced but does not exist, wieldy will create it in the scope.
```html
  <h1>Task manager</h1>
  <div id="main">
    <input type="text" bind="task-on:keyup" placeholder="I need to...">
    <button onclick="addItem()">Add</button>

    <h2>Tasks</h2>
    <div bind="tasks:innerHTML">
      <p>${value} <button onclick="deleteItem(${index})">Done</button></p>
    </div>
  </div>
  <script src="wieldy.js"></script>
  <script>
  var app = new WieldyScope(document.getElementById("main"));

  function addItem() {
    app.tasks.push(app.task());
    app.task("");
  }
  function deleteItem(id) {
    app.tasks.splice(id,1);
  }
  </script>
```

## Wieldy binding syntax
Basic syntax is as follows, to bind a wieldable in the scope to an attribute (like href) or a property of the DOM element (like innerHTML) you simply provide the wieldable and the attribute, or property, you want to bind to seperated by a colon.
```html
<a bind="link:href"></a>
<div bind="title:innerHTML"></div>
```
Now whenever those wieldables change, the attribute "href" and property "innerHTML" will update in real time.

You can have multiple bindings by seperating them with commas:
```html
<a bind="link:href,title:innerHTML"></a>
```

## Binding on events
Binding on an event means you are setting the value of a wieldable when the given event occurs.
To bind to an event, you must use the "-on" after the wieldable is specified and preceed with the name of the event after the colon.

Syntax: 
```html
<div bind="wieldable-on:event" value="value"></div>
```

For example: You can set a wieldable to the value of an attribute or DOM property like so:
```html
<button bind="title-on:click" value="New value">Click me</button>
```

Notice: The wieldable will be set to the value of the attribute on the element.
If the element is an input of some kind, it will get the value of the input element.
```html
<input type="text" bind="title-on:keyup">
```



# Using Wieldables

What is a wieldable?
A wieldable is a wieldy observable: an entity that can be observed and controlled easily.
Anything can be a wieldable (strings, ints, objects, and arrays)
For example, you can make a string a wieldable 
```js
var str = new Wieldable("hello")
```

You can get the string value like so:
```js
str() // returns "hello"
```

And you can set the string like so:
```js
str("hello world") // sets str to "hello world"
```

You can also observe a wieldable, and react to it when it changes:
```js
var listener = str.observe(function(str){
  console.log(str)
})
```

Now when you make a change, your reaction will take affect:
```
str("Hello World!") // sets str to "hello world" and triggers the listener
// console: "Hello World!"
```

You can also stop and start observing a wieldable whenever you want:
```js
listener.stop() // stops observing
listener.start() // starts observing again

Arrays are just as easy:
```js
var arr = new Wieldable([1,2,3,4]);
```

You can push, pop, shift, unshift, splice, slice and get the length of arrays just like normal:
```js
arr.push(5) // [1,2,3,4,5]
arr.pop() // [1,2,3,4]
arr.shift() //[2,3,4]
arr.unshift(1) // [1,2,3,4]
arr.splice(1,1) // [1,3,4]
arr.slice(0,2) // [1,3]
arr.length // 3
```

Objects are always fun.
You can make a wieldable object like so:
```js
// OBJECTS

var obj = new Wieldable({
  name: "Seth Vandebrooke",
  number: "123-456-7890",
  email: "example@email.com"
});
```

A wieldable object becomes an object who's properties become wieldables themselves: 
```js
obj.email() // "example@email.com"
obj.name("seth") // "seth"
obj.name() // "seth"
```

You can get the literal object by calling it as a function with no parameters:
```js
obj() // { name:"seth", number:"123-456-7890", email:"example@email.com" }
```
