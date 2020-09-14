import {parseMessageWithKeysAsDINames} from "../utils/parseMessageWithKeysAsDINames"

export const parseIMU = ({data, attributes}) => parseMessageWithKeysAsDINames(data, attributes)
