import {expressApp} from "node-microservice"

const appFactory = () => {
  return expressApp()
}

export default appFactory
