// import Koxy from "../main.ts";
// import Types from "../../types/types.ts";
// import dynamicValue from "./dynamicValue.ts";

// export default async function dynamicExecute(
//   window: Koxy,
//   input: { value: string; type: Types },
// ) {
//   const { value, type } = input;
//   const result = { value };

//   const regex = /\$\{(.*?)\}\$/;

//   while (regex.test(result.value)) {
//     const matches = result.value.match(regex);

//     if (!matches || !matches[1]) {
//       return result.value;
//     }

//     const inner = { value: matches[1] };
//     inner.value = dynamicValue(window, inner.value, type);
//     while (inner.value.includes("Deno")) {
//       inner.value = inner.value.replace("Deno", "Koxy");
//     }
//     const AsyncFunction = async function () {}.constructor;
//     const func = new AsyncFunction(
//       inner.value.includes("return") ? inner.value : `return ${inner.value}`,
//     );
//     const res = await func();
//     if (typeof res === "object") {
//       result.value = result.value.replace(matches[0], JSON.stringify(res));
//     } else {
//       result.value = result.value.replace(matches[0], res);
//     }
//   }

//   return result.value;
// }
