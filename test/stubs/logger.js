export const getMockLog = () =>
  sinon.stub({
    trace: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {}
  })
