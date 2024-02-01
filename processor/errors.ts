
type Params = {
    position: string,
    err: string
}

export default function error({ position, err }: Params) {

    throw new Error(err);

}