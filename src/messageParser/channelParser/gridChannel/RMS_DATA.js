import {flatten} from "ramda"
import {parseMessageWithKeysAsDINames} from "../utils/parseMessageWithKeysAsDINames"

export const parseRMSDATA = ({data, attributes}) => parseMessageWithKeysAsDINames(flatten([data]), attributes)
