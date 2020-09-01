import jwt from "jwt-simple"
import {auth} from "node-microservice"
import {omit} from "ramda"
import {tokenGenerator} from "../src/utils/get-token"

const cfg = {
  issuer: "i-example.com",
  audience: "a-example.com",
  lifetimeSecs: 3600,
  secret: "secret",
  algorithm: "HS256"
}
const subject = "sub"
const plant = "plant"
const perms = ["foo:bar", "foo:baz"]

const payload = {
  iss: cfg.issuer,
  aud: [cfg.audience],
  sub: subject,
  tnt: plant,
  prm: perms
}

describe("Get token", () => {
  describe("Return new token", () => {
    it("if no token", () => {
      const getToken = tokenGenerator(cfg)
      const result = jwt.decode(getToken(subject, plant, perms), cfg.secret)
      return expect(omit(["exp"], result)).to.deep.eql({...payload, prm: auth.plantPerms(plant).concat(perms)})
    })

    it("gets new token if cache has expired", () => {
      const clock = sinon.useFakeTimers()
      const getToken = tokenGenerator({...cfg, lifetimeSecs: 1})
      const firstToken = jwt.decode(getToken(subject, plant, perms), cfg.secret)
      clock.tick(5000)
      const secondToken = jwt.decode(getToken(subject, plant, perms), cfg.secret)
      expect(firstToken.exp).to.not.eql(secondToken.exp)
      expect(omit(["exp"], firstToken)).to.deep.eql(omit(["exp"], secondToken))
      clock.restore()
    })

    it("gets new token for a new subject/plant/perms combination", () => {
      const getToken = tokenGenerator({...cfg, lifetimeSecs: 1000000})
      const token = jwt.decode(getToken(subject, plant, perms), cfg.secret)
      const tokenWithNewSubject = jwt.decode(getToken("new-subject", plant, perms), cfg.secret)
      const tokenWithNewPlant = jwt.decode(getToken(subject, "new-plant", perms), cfg.secret)
      const tokenWithNewPerms = jwt.decode(getToken(subject, plant, ["newperm:baz"]), cfg.secret)

      expect(omit(["exp", "sub"], token)).to.deep.eql(omit(["exp", "sub"], tokenWithNewSubject))
      expect(token.sub).to.not.eql(tokenWithNewSubject.sub)

      expect(omit(["exp", "tnt", "prm"], token)).to.deep.eql(omit(["exp", "tnt", "prm"], tokenWithNewPlant))
      expect(token.tnt).to.not.eql(tokenWithNewPlant.tnt)
      expect(token.prm).to.not.eql(tokenWithNewPlant.prm)

      expect(omit(["exp", "prm"], token)).to.deep.eql(omit(["exp", "prm"], tokenWithNewPerms))
      expect(token.prm).to.not.eql(tokenWithNewPerms.prm)
    })
  })

  describe("Return cached token", () => {
    it("if cache hasn't expired for given subject-plant-perms", () => {
      const getToken = tokenGenerator(cfg)
      const token1 = jwt.decode(getToken(subject, plant, perms), cfg.secret)
      const token2 = jwt.decode(getToken(subject, plant, perms), cfg.secret)
      expect(token1).to.deep.eql(token2)
    })
  })
})
