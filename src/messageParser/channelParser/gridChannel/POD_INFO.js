import {parseMessage} from "../bikeChannel/utils/parseMessage"

export const parsePODINFO = ({data, attributes}) => parseMessage(data, attributes)
