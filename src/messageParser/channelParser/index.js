import {getCreateBikeEventFromMessageFn} from "./bikeChannel"
import {getCreateCIEventFromMessageFn} from "./gridChannel"

const parserConfig = {
  bike: getCreateBikeEventFromMessageFn,
  ci: getCreateCIEventFromMessageFn
}

export const getChannelParser = () => parserConfig[process.env.VI_INPUT_TYPE || "bike"]
