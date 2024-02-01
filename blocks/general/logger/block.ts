import Koxy from "../../../processor/main.ts";

type Params = {
    value: unknown // Hello
}

const _name = "Logger";
const _icon = "list";
const _description = "Log something to the console";

const log = (value: unknown) => {
    return value;
}

export default function logger({ value }: Params, window: Koxy): void {

    // console.log(value);
    log(value);

    window.processResult({
        success: true
    })

}