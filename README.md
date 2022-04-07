![Cover logo](./cover.png?raw=true "Title")

### **A minimal React clone for building user interfaces**


### To run Act, follow these steps:

1. Clone the repo

```sh
git clone https://github.com/11CConnolly/Act.git
```

3. Install the dependencies

```sh
npm install
```

3. Create your Act app by changing the index.js file with any JSX code you want. Or leave it as it is as a demo. 
4. Run the project using npm

```sh
npm start
```

5. Open up localhost and you should see your Act app up and running!

Built following [Rodrigo Pomobo's excellent tutorial](https://pomb.us/build-your-own-react/)

Quick Summary
React handles asynchronous updates by breaking work down into WorkLoops and Fiber Trees - made up of fibers, which represent one unit of work or DOM element each. Fiber Trees are just graphs where the nodes have children, parents, and siblings. The goal of it is to make the next unit of work easy to figure out appending children to parents to build up the DOM from the provided JSX. We want to make sure the DOM node being created isn't interrupted so we're left with a half built UI, so we have the idea of a workInProgress. Changing the DOM uses reconsiliation to update or delete elements, which is done through tags attached to each node and then follows the same protcols as before
