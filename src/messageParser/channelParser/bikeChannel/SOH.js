import {parseMessageWithKeysAsDINames} from "../utils/parseMessageWithKeysAsDINames"

export const parseSOH = ({data, attributes}) => parseMessageWithKeysAsDINames(data, attributes)
