import Act from "./Act";

/** @jsx Act.createElement */
// TODO Make the style objects passed in an object
const element = (
  <div id="foo" style="background: salmon; width: 200px; height: 300px">
    <x>bar</x>
    <h2>Baz</h2>
    <b />
  </div>
);
const container = document.getElementById("root");
Act.render(element, container);
