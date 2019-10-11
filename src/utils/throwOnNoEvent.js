import {timer, throwError} from "rxjs"
import {switchMap, map} from "rxjs/operators"

export function throwOnNoEvent(timeout) {
  return stream =>
    stream.pipe(
      switchMap(() =>
        stream.pipe(
          timer(timeout),
          map(() => throwError(new Error(`No event received for ${timeout} milliseconds.`)))
        )
      )
    )
}
