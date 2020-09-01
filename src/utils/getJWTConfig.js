const {env} = process
export const getJwtConfig = () => ({
  issuer: env.VI_JWT_ISS,
  audience: env.VI_JWT_AUD,
  lifetimeSecs: parseInt(env.VI_JWT_LIFETIME_SECS, 10),
  secret: env.VI_JWT_SECRET,
  algorithm: env.VI_JWT_ALGORITHM
})
