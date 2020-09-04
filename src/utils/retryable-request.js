import {omit} from "ramda"

import {errorFormatter} from "./error-formatter"

const defaultLogger = {
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {}
}

const logRequestConfig = requestConfig => omit(["headers"], requestConfig)

const sleep = delay => new Promise(resolve => setTimeout(resolve, delay))

const makeRequestAfterDelay = async (makeRequest, requestConfig, delay, log) => {
  await sleep(delay)
  try {
    return await makeRequest(requestConfig)
  } catch (error) {
    log.info(
      {error: errorFormatter(error), ctx: {requestConfig: JSON.stringify(logRequestConfig(requestConfig))}},
      "Failed to make api request"
    )
    throw error
  }
}

const defaultIsRetryable = error => {
  // This supports Axios error response as of now
  if (error && error.response && error.response.status) {
    return error.response.status >= 500 && error.response.status < 600 // is5xx error
  }
  return false
}

const shouldRetryOnError = ({error, retryConfig, retryCount, log, requestConfig}) => {
  const {maxRetries = Number.POSITIVE_INFINITY, isRetryable = defaultIsRetryable, retryLogThreshold = 5} = retryConfig
  const shouldRetry = isRetryable(error) && retryCount <= maxRetries
  if (shouldRetry) {
    const isRetrying = retryCount > 0
    const shouldLogRetry = isRetrying && retryCount % retryLogThreshold === 0
    if (shouldLogRetry) {
      // log only on retry and not the first request
      log.info(
        {ctx: {requestConfig: JSON.stringify(logRequestConfig(requestConfig))}},
        `Retrying request. Retry Count: ${retryCount}`
      )
    }
    return true
  }
  if (retryCount > maxRetries) {
    log.error(
      {ctx: {requestConfig: JSON.stringify(logRequestConfig(requestConfig))}},
      `Retry capped out. Retry count: ${maxRetries}`
    )
  }
  return false
}

const getExponentialRetryDelay = (retryCount, retryDelay) => {
  return 2 ** retryCount * retryDelay
}

const getDelay = ({retryCount, retryConfig}) => {
  const {exponentialRetry = false, retryDelay = 1000} = retryConfig

  if (retryCount === 0) {
    return 0
  }

  let delay = retryDelay

  if (exponentialRetry) {
    delay = getExponentialRetryDelay(retryCount, retryDelay)
  }
  return delay
}

const makeRetryableRequest = async ({makeRequest, requestConfig, retryConfig, retryCount, log}) => {
  const delay = getDelay({retryCount, retryConfig})
  try {
    return await makeRequestAfterDelay(makeRequest, requestConfig, delay, log)
  } catch (error) {
    const shouldRetry = shouldRetryOnError({error, retryConfig, retryCount: retryCount + 1, log, requestConfig})
    if (shouldRetry) {
      return makeRetryableRequest({makeRequest, requestConfig, retryConfig, retryCount: retryCount + 1, log})
    } else {
      throw error
    }
  }
}

const defaultRetryConfig = {
  maxRetries: 0,
  isRetryable: defaultIsRetryable,
  exponentialRetry: false,
  retryDelay: 1000
}

export const retryableRequest = async ({
  requestConfig,
  makeRequest,
  retryConfig = defaultRetryConfig,
  log = defaultLogger
}) => {
  try {
    const response = await makeRetryableRequest({requestConfig, retryConfig, retryCount: 0, log, makeRequest})
    return {ok: true, response}
  } catch (error) {
    return {ok: false, error}
  }
}
