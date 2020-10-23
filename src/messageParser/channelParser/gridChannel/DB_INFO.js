import {flatten} from "ramda"
import {parseMessageWithKeysAsDINames} from "../utils/parseMessageWithKeysAsDINames"

export const parseDBINFO = ({data, attributes}) => parseMessageWithKeysAsDINames(flatten([data]), attributes)
