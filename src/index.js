import Act from "./Act";

/** @jsx Act.createElement */
// The following JSX code gets transpiled by our React clone
// TODO Make the style objects passed in an object
function App(props) {
  return <h1>Hello there {props.name}</h1>;
}
const element = (
  <div id="foo" style="background: salmon; width: 200px; height: 300px">
    <App name="General Kenobi" />
    <x>bar</x>
    <h2>Baz</h2>
    <b>Bob</b>
  </div>
);
const container = document.getElementById("root");
Act.render(element, container);
