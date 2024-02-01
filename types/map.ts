import Block from "./block.ts";
import Condition from "./condition.ts";
import Pointer from "./pointer.ts";

type FlowMap = Record<string, Block | Pointer | Condition>;

export default FlowMap;