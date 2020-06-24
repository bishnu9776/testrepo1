module.exports = [
  {
    name: "P1_over_voltage",
    description: "phase 1 over voltage",
    decode: "((bytes >> 0) & 1)"
  },
  {
    name: "P1_under_voltage",
    description: "phase 1 under voltage",
    decode: "((bytes >> 1) & 1)"
  },
  {
    name: "P1_over_current",
    description: "phase 1 over current",
    decode: "((bytes >> 2) & 1)"
  },
  {
    name: "P2_over_voltage",
    description: "phase 2 over voltage",
    decode: "((bytes >> 3) & 1)"
  },
  {
    name: "P2_under_voltage",
    description: "phase 2 under voltage",
    decode: "((bytes >> 4) & 1)"
  },
  {
    name: "P2_over_current",
    description: "phase 2 over current",
    decode: "((bytes >> 5) & 1)"
  },
  {
    name: "P3_over_voltage",
    description: "phase 3 over voltage",
    decode: "((bytes >> 6) & 1)"
  },
  {
    name: "P3_under_voltage",
    description: "phase 3 under voltage",
    decode: "((bytes >> 7) & 1)"
  },
  {
    name: "P3_over_current",
    description: "phase 3 over current",
    decode: "((bytes >> 8) & 1)"
  },
  {
    name: "Bad_frequency",
    description: "Bad frequency",
    decode: "((bytes >> 9) & 1)"
  }
]
