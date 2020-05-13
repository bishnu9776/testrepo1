import {parseMessage} from "./utils/parseMessage"

export const parseIMU = ({data, attributes}) => parseMessage(data, attributes)
