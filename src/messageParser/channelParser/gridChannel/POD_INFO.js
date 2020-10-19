import {flatten} from "ramda"
import {parseMessageWithKeysAsDINames} from "../utils/parseMessageWithKeysAsDINames"

export const parsePODINFO = ({data, attributes}) => parseMessageWithKeysAsDINames(flatten([data]), attributes)
