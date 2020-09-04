export function errorFormatter(error) {
  return {
    message: error && error.message ? error.message : JSON.stringify(error),
    stack: error && error.stack ? error.stack : undefined
  }
}
