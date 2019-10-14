import {flatten, pick} from "ramda"

const accKeys = ["acc_x_mps2", "acc_y_mps2", "acc_z_mps2"]
const gyrKeys = ["gyr_x_deg", "gyr_y_deg", "gyr_z_deg"]

export const parseIMU = ({data, attributes, probe}) => {
  return flatten(
    data.map(event => {
      // eslint-disable-next-line
      const {version, bike_id, channel} = attributes
      const timestamp = new Date(event.timestamp * 1000).toISOString()

      const accEvent = {
        value_xyz: {
          ...pick(accKeys, event)
        },
        ...probe[accKeys[0]],
        data_item_id: `acc-${version}`,
        data_item_name: "acc",
        device_uuid: bike_id,
        channel,
        timestamp,
        sequence: event.seq_num
      }

      const gyrEvent = {
        value_xyz: {
          ...pick(gyrKeys, event)
        },
        ...probe[gyrKeys[0]],
        data_item_id: `gyr-${version}`,
        data_item_name: "gyr",
        device_uuid: bike_id,
        channel,
        timestamp,
        sequence: event.seq_num
      }

      return [accEvent, gyrEvent]
    })
  )
}
