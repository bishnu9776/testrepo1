import {parseChannelMessage} from "../../src/formatData/channelParser"
import {IMU} from "../mocks/IMU"
import probe from "../mocks/probe.json"

describe.skip("Parses IMU", () => {
  it("parses given messages", () => {
    expect(parseChannelMessage({...IMU, probe})).to.eql([])
  })
})
