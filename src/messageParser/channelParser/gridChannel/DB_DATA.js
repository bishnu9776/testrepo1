import {flatten} from "ramda"
import {parseMessageWithKeysAsDINames} from "../utils/parseMessageWithKeysAsDINames"

export const parseDBDATA = ({data, attributes}) => parseMessageWithKeysAsDINames(flatten([data]), attributes)
