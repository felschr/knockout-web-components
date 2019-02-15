# knockout-web-components
A bridge to be able to integrate web components with knockout.js

This project provides a custom bindingHandler to integrate web components into knockout applications more seamlessly.
It's compatible with standard web components and thus also allows integration of components from projects like [stencil](http://stenciljs.com).

## Installation

```sh
npm i github:FelschR/knockout-web-components
```
Soon this library will also be available via npm directly.

## Usage

Import the library in your app:
```js
import "knockout-web-components";
```
This will automatically add a new knockout bindingHandler with the name `webcomp`.

Now you can pass properties and event listeners via the data-bind attribute in your templates:
```html
<my-comp data-bind="webcomp: { value:'test', sum:0, onInput:() => { console.log('input') } }"></my-comp>
```

If you pass onservables as parameters here they will be unwraped and provided to the web component as plain JSON.

Parameters that start with `on` are treated like event listeners and internally it will call `addEventListener` on the web component to listen for events and invoke the function you provided.  
For the event registration the `on` prefix will be ignored and instead only the parts after it will be used. This also transforms the first letter of the event name to lowercase.  
For example `onInput` would listen for events with the name `input`.

### Stencil

I've created this library as part of my adoption of [stencil](http://stenciljs.com) within my application.  
It's a beautiful, lightweight web component compiler that produced 100% standards-based web components that can be used in any framework or no framework at all.