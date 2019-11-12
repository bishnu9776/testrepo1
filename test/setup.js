import mocha from "mocha"
import chai from "chai"
import sinon from "sinon"
import sinonChai from "sinon-chai"

global.describe = mocha.describe
global.it = mocha.it
global.before = mocha.before
global.beforeEach = mocha.beforeEach
global.after = mocha.after
global.afterEach = mocha.after
global.expect = chai.expect
chai.use(sinonChai)
global.sinon = sinon

process.env.ELASTIC_APM_ACTIVE = "false"
