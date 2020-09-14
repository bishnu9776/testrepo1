export const getTokenStub = () => (subject, tenant, perms) => `${subject}-${tenant}-${perms.join(",")}`
