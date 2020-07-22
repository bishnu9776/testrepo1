export const getMockLog = () =>
  sinon.stub({
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {}
  })
