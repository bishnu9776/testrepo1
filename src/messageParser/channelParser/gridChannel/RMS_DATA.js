import {parseMessageWithKeysAsDINames} from "../utils/parseMessageWithKeysAsDINames"

export const parseRMSDATA = ({data, attributes}) => parseMessageWithKeysAsDINames(data, attributes)
