import {asyncScheduler, of} from "rxjs"
import {delay, delayWhen, retryWhen, tap} from "rxjs/operators"
import R from "ramda"
import {errorFormatter} from "./errorFormatter"

export const retryWithExponentialBackoff = ({
  retryDelayInit,
  retryDelayFactor,
  retryDelayCap,
  retryIf = R.T,
  maxRetryAttempts = Number.POSITIVE_INFINITY,
  log,
  scheduler: Scheduler = asyncScheduler
}) => observable => {
  let currentDelay = retryDelayInit / retryDelayFactor
  let retryAttempts = 0
  return observable.pipe(
    tap(() => {
      currentDelay = retryDelayInit / retryDelayFactor
      retryAttempts = 0
    }),
    retryWhen(errors =>
      errors.pipe(
        tap(e => {
          retryAttempts += 1
          if (!retryIf(e) || retryAttempts === maxRetryAttempts) {
            throw e
          }
        }),
        tap(e => {
          currentDelay = Math.min(currentDelay * retryDelayFactor, retryDelayCap)
          log.info(
            {error: errorFormatter(e)},
            `Retrying at attempt ${retryAttempts}, after ${currentDelay / 1000} seconds for error: ${e.message}`
          )
        }),
        delayWhen(e => of(e).pipe(delay(currentDelay, Scheduler)))
      )
    )
  )
}
