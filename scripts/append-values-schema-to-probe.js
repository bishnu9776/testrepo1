import fs from "fs"
import path from "path"
import probe from "../../kubernetes-ather/releases/staging/files/probe-gen-2.json"

const updatedProbe = {}

Object.keys(probe).filter(dataItem => !probe[dataItem]["values_schema"]).forEach(dataItem => {
  const dataItemProbe = probe[dataItem]
  if (dataItemProbe.category === "EVENT") {
    updatedProbe[dataItem] = {...dataItemProbe, "values_schema": {"type": "string"}}
  }
  if (dataItemProbe.category === "CONDITION") {
    updatedProbe[dataItem] = {...dataItemProbe, "values_schema": {"$ref": "values_schema.json#/condition"}}
  } else {
    updatedProbe[dataItem] = {...dataItemProbe, "values_schema": {"type": "number"}}
  }
})

Object.keys(probe).filter(dataItem => probe[dataItem]["values_schema"]).forEach(dataItem => {
  if (probe[dataItem].category === "EVENT" && probe[dataItem]["values_schema"].type !== "string") {
    console.log(dataItem)
  }
  updatedProbe[dataItem] = probe[dataItem]
})

fs.writeFileSync(path.join(__dirname, "probe-gen-2.json"), JSON.stringify(updatedProbe, null, 2))
