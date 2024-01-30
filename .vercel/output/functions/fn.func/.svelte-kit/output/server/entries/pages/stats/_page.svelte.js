import { c as create_ssr_component, v as validate_component } from "../../../chunks/ssr.js";
import { W as WinChart } from "../../../chunks/WinChart.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  console.log(data);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  return `<div class="w-full">${validate_component(WinChart, "WinChart").$$render($$result, { data: data.graph, type: "collective" }, {}, {})}</div>`;
});
export {
  Page as default
};
