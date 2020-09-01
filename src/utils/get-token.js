import {auth} from "node-microservice"
import {path} from "ramda"
import jwt from "jwt-simple"

const {env} = process

const tokenNotInCache = (cacheKey, cache) => {
  return !path([cacheKey, "token"], cache)
}

const getTokenFromCache = (cacheKey, cache) => {
  return path([cacheKey, "token"], cache)
}

export const tokenGenerator = jwtConfig => {
  const tokenCache = {}
  const secondsBeforeExpiryToDecideToRefreshToken = parseInt(
    env.VI_JWT_SECS_BEFORE_EXPIRY_TO_DECIDE_TO_REFRESH_TOKEN || "300", // PR: Do we need the default value here?
    10
  )

  return (subject, plant, perms) => {
    const getTokenAndUpdateCache = () => {
      const token = auth.generateJwt(jwtConfig)(subject, plant, auth.plantPerms([plant]).concat(perms))
      tokenCache[cacheKey] = {
        token,
        expirationTime: jwt.decode(token, jwtConfig.secret).exp
      }
      return token
    }

    const cacheKey = `${subject}-${plant}-${perms}`

    if (tokenNotInCache(cacheKey, tokenCache)) {
      return getTokenAndUpdateCache()
    }

    const tokenCloseToExpiry =
      path([cacheKey, "expirationTime"], tokenCache) - Date.now() < secondsBeforeExpiryToDecideToRefreshToken

    if (tokenCloseToExpiry) {
      return getTokenAndUpdateCache()
    }

    return getTokenFromCache(cacheKey, tokenCache)
  }
}
