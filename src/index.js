import ko from "knockout";

/**
 * @typedef {{ [name: string]: EventListener }} EventListenerMap
 * @typedef {{ [name: string]: any }} ComponentParams
 */

/**
 * A map of active event listeners for .
 * Each entry is for a separate web component.
 * @type {WeakMap<Node, EventListenerMap>}
 */
const eventListenerMap = new WeakMap();

/**
 * @type {KnockoutBindingHandler<Node, ComponentParams, any>}
 */
const bindingHandler = {
    init: function(element) {
        eventListenerMap.set(element, {});

        // cleanup event listeners when web component is disposed
        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
            const listeners = eventListenerMap.get(element);
            if (listeners) {
                Object.keys(listeners).forEach((key) => {
                    removeListenerByKey(element, key, listeners);
                });
            }

            eventListenerMap.delete(element);
        });
    },
    update: function(element, valueAccessor) {
        const params = ko.unwrap(valueAccessor());

        const listeners = eventListenerMap.get(element);

        const paramNames = Object.keys(params);

        // remove event listeners that are not provided anymore
        Object.keys(listeners)
            .filter(key =>
                !paramNames.some(name => getEventName(name) === key))
            .forEach((key) =>
                removeListenerByKey(element, key, listeners));

        // assign passed properties to web component
        paramNames.forEach((name) => {
            let prop;
            // if passed property is observable convert it
            if (ko.isObservable(params[name])) {
                prop = ko.toJS(params[name]);
            } else {
                prop = ko.toJS(params[name]);
            }

            setProperty(element, prop, listeners, name);
        });
    }
};
ko.bindingHandlers["webcomp"] = bindingHandler;

/**
 * Set the property or event listener of a web component.
 * @param {Node} element The web component to set the property of.
 * @param {*} prop The property value that is to be set.
 * @param {EventListenerMap} listeners The map of event listeners for the web component.
 * @param {string} paramName The name of the property or event listener to be set (event listeners start with `on`).
 */
function setProperty(element, prop, listeners, paramName) {
    // if is function treat as event listener
    if (paramName.startsWith("on") && typeof prop === "function") {
        const eventName = getEventName(paramName);

        const listener = prop;
        const oldListener = listeners[eventName];
        if (listener !== oldListener) {
            if (oldListener) {
                element.removeEventListener(eventName, oldListener);
            }

            listeners[eventName] = listener;
            element.addEventListener(eventName, listener);
        }
    } else {
        element[paramName] = prop;
    }
}

/**
 * Remove an event listener from a web component.
 * @param {Node} element
 * @param {string} key
 * @param {{[name: string]: EventListener}} listeners
 */
function removeListenerByKey(element, key, listeners) {
    const listener = listeners[key];
    element.removeEventListener(key, listener);
    delete listeners[key];
}

/**
 * Returns the actual event name from given parameter name.
 * @param {string} paramName
 */
function getEventName(paramName) {
    return paramName.replace(/on./, str => str[str.length - 1].toLowerCase());
}
