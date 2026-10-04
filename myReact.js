// A tiny React-like library built from scratch.

let rootElement = null;
let rootContainer = null;

// 1. Create a virtual DOM object.
export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...(props || {}),
      children: children
        .flat()
        .filter(child => child !== null && child !== undefined && child !== false)
        .map(child =>
          typeof child === "object" ? child : createTextElement(child)
        )
    }
  };
}

function createTextElement(value) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: String(value),
      children: []
    }
  };
}

// 2. Render the virtual DOM into the real browser DOM.
export function render(element, container) {
  rootElement = element;
  rootContainer = container;

  container.replaceChildren();
  container.appendChild(createDom(element));
}

function createDom(element) {
  // Function component
  if (typeof element.type === "function") {
    resetHooks();
    const componentElement = element.type(element.props);
    return createDom(componentElement);
  }

  // Text node
  if (element.type === "TEXT_ELEMENT") {
    return document.createTextNode(element.props.nodeValue);
  }

  // Normal HTML element
  const dom = document.createElement(element.type);

  updateDom(dom, {}, element.props);

  element.props.children.forEach(child => {
    dom.appendChild(createDom(child));
  });

  return dom;
}

// 3. Add props and event listeners to a DOM node.
function updateDom(dom, previousProps, nextProps) {
  const isEvent = key => key.startsWith("on");
  const isProperty = key => key !== "children" && !isEvent(key);

  // Remove old event listeners
  Object.keys(previousProps)
    .filter(isEvent)
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, previousProps[name]);
    });

  // Add/update properties
  Object.keys(nextProps)
    .filter(isProperty)
    .forEach(name => {
      if (name === "style" && typeof nextProps[name] === "object") {
        Object.assign(dom.style, nextProps[name]);
      } else {
        dom[name] = nextProps[name];
      }
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

// --------------------
// 4. Tiny useState Hook
// --------------------

let hooks = [];
let hookIndex = 0;

function resetHooks() {
  hookIndex = 0;
}

export function useState(initialValue) {
  const currentIndex = hookIndex;

  if (hooks[currentIndex] === undefined) {
    hooks[currentIndex] = initialValue;
  }

  const setState = newValue => {
    const oldValue = hooks[currentIndex];

    hooks[currentIndex] =
      typeof newValue === "function"
        ? newValue(oldValue)
        : newValue;

    // Re-render the complete application.
    render(rootElement, rootContainer);
  };

  const state = hooks[currentIndex];
  hookIndex++;

  return [state, setState];
}
