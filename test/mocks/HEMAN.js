export const HEMAN = {
  attributes: {
    channel: "heman",
    bike_id: "s_248",
    version: "v1"
  },
  data: [
    {
      seq_num: 283,
      error_code: "M043",
      start_timestamp: "1.570339273807e+09",
      end_timestamp: "",
      isvalid: -1,
      timestamp: 1570339273.807,
      global_seq: 503258175,
      bigsink_timestamp: "2019-10-06T05:22:38.902",
      bike_id: "s_248"
    }
  ]
}

// TODO:
// if there is no end_timestamp, use start_timestamp as timestamp, else use end_timestamp
// what should the data_item_name be?
// should error_code be used as native_code?
// confirm on isvalid, when should it become -1?
