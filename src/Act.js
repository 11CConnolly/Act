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

// Rendering out the JSX to DOM Elements. We pass in the root first, for which
// Work will begin once the browser is ready
const render = (element, container) => {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  // Array to keep track of nodes we want to remove during reconsiliation
  deletions = [];
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
let currentRoot = null;
let deletions = null;

const performUnitOfWork = (fiber) => {
  // Add DOM node
  // The property .dom keeps track of the DOM node we want to create
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);

  // Search and return the next unit of work
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

const reconcileChildren = (wipFiber, elements) => {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipRoot.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];

    // We make our new fiber, with the same props as a DOM element
    let newFiber = null;

    // Compare oldFiber to element
    // React would use keys here e.g., when elements change place in the array
    const sameType = oldFiber && element && element.type === oldFiber.type;

    // Update the node
    // When the old fiber and element have the same type, create a new fiber keeping
    // The DOM node from the old fiber and props from the element
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }

    // Add this node
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }

    // Delete the oldFiber's node
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    // If it's the first, it's the direct child, otherwise we set it as a sibling
    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    // Defining here the fiber to later refer set the sibling
    prevSibling = newFiber;
    index++;
  }
};

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);

// Compare props from old fiber to new fiber, and set props that are new or have changed
const updateDom = (dom, prevProps, nextProps) => {
  // Remove old or change event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Add event listener
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, prevProps[name]);
    });
  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = "";
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });
};

const commitWork = (fiber) => {
  // If no elements to commit, cancel
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;

  // Handling effect tags
  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    // Append the dom node to the parent
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    // Change DOM node
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    // Remove the dom node to the parent
    domParent.removeChild(fiber.dom);
  }

  domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
};

const commitRoot = () => {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
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
