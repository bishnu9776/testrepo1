import {isEmpty, isNil} from "ramda"

export const isNilOrEmpty = value => isNil(value) || isEmpty(value)
