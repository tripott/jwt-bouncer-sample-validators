const uuid = require('uuid/v4')
const kid = uuid()

const jwtHeader = {
  alg: 'ES384',
  typ: 'JWT',
  kid
}

const jwtPayload = {
  iss: 'https://sandbox.cds-hooks.org',
  aud: 'http://localhost:9000/jwktest/cds-services',
  exp: Math.round(Date.now() / 1000 + 300),
  iat: Math.round(Date.now() / 1000),
  jti: uuid(),
  tenant: 'labs'
}

module.exports = { jwtHeader, jwtPayload }
