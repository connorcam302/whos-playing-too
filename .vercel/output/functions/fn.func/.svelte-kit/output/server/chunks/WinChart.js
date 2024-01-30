import { c as create_ssr_component, a as add_attribute } from "./ssr.js";
import "chart.js/auto";
import dayjs from "dayjs";
const WinChart = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data, type } = $$props;
  const makeDataSets = (data2) => {
    const dataSets2 = [];
    for (let i = 0; i < data2.length; i++) {
      dataSets2.push({
        id: data2[i].player.id,
        label: data2[i].player.username,
        backgroundColor: data2.length > 1 ? `hsl(${data2[i].player.id * 18 % 360}, 70%, 50%)` : "#f43f5e",
        borderColor: data2.length > 1 ? `hsl(${data2[i].player.id * 18 % 360}, 70%, 50%)` : "#f43f5e",
        data: data2[i].data,
        pointRadius: 0
      });
    }
    return dataSets2;
  };
  let dataSets = makeDataSets(data);
  if (type == "days" || type == "collective") {
    Array.from({ length: dataSets[0].data.length }, (_, i) => dayjs().subtract(i, "day").format("DD/MM")).reverse();
  } else {
    Array.from({ length: dataSets[0].data.length }, (_, i) => (i + 1).toString());
  }
  let chartCanvas;
  const findHighestValue = (arrayOfArrays) => {
    let highestValue = Number.MIN_SAFE_INTEGER;
    for (const subArray of arrayOfArrays) {
      for (const number of subArray) {
        if (number > highestValue) {
          highestValue = number;
        }
      }
    }
    return highestValue;
  };
  const findLowestValue = (arrayOfArrays) => {
    let lowestValue = Number.MAX_SAFE_INTEGER;
    for (const subArray of arrayOfArrays) {
      for (const number of subArray) {
        if (number < lowestValue) {
          lowestValue = number;
        }
      }
    }
    return lowestValue;
  };
  findHighestValue(dataSets.map((dataSet) => dataSet.data));
  findLowestValue(dataSets.map((dataSet) => dataSet.data));
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  return `<canvas id="myChart"${add_attribute("this", chartCanvas, 0)}></canvas>`;
});
export {
  WinChart as W
};
