export const errorFormatter = (error = {}) => {
  const message = error.message ? error.message.toString() : ""
  const stack = error.stack ? error.stack.toString() : ""
  return {message, stack}
}
