import {flatten} from "ramda"
import {parseMessageWithKeysAsDINames} from "../utils/parseMessageWithKeysAsDINames"

export const parseNETWORKDATA = ({data, attributes}) => parseMessageWithKeysAsDINames(flatten([data]), attributes)
