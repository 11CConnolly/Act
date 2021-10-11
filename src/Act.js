// Creates object from JSX passed to it, children are an array, of the child
const createElement = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
};

// Creating text elements for Children which are just text
const createTextElement = (text) => {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
};

/* // Rendering and appending elements to the DOM
const render = (element, container) => {
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode(element.type)
      : document.createElement(element.type);

  const isProperty = (key) => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  // This recursive call won't stop until the complete tree is rendered, getting in the way
  // Of other potential actions the browser needs to do e.g. handling user input
  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}; */

// Rendering out the JSX to DOM Elements. We pass in the root first, for which
// Work will begin once the browser is ready
const render = (element, container) => {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };
  nextUnitOfWork = wipRoot;
};

const createDom = (fiber) => {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  const isProperty = (key) => key !== "children";
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });

  return dom;
};

let nextUnitOfWork = null;
let wipRoot = null;

const performUnitOfWork = (fiber) => {
  // Add DOM node
  // The property .dom keeps track of the DOM node we want to create
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // Create fibers for elements children
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }

  // Return next unit of work
  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
};

const commitWork = (fiber) => {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
};

const commitRoot = () => {
  commitWork(wipRoot.child);
  wipRoot = null;
};

// The deadline passed in tells us how long we have until the browser needs control again
const workLoop = (deadline) => {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
};

// Performs set actions when the main thread is idle https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
// Part of the window API which is the currently running window that's exposed to the JS code that's running
requestIdleCallback(workLoop);

const Act = {
  createElement,
  render,
};

export default Act;
