import {parseMessage} from "../utils/parseMessage"

export const parseSOH = ({data, attributes}) => parseMessage(data, attributes)
