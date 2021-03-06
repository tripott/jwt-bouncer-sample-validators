const uuid = require('uuid/v4')
const kid = uuid()

const jwtHeader = {
  alg: 'ES384',
  typ: 'JWT',
  kid
}

const jwtPayload = {
  iss: 'https://sandbox.cds-hooks.org',
  aud: 'https://trhc-test.apigee.net/medwise/cds-services',
  exp: Math.round(Date.now() / 1000 + 300),
  iat: Math.round(Date.now() / 1000),
  jti: uuid(),
  tenant: 'jwktest'
}

module.exports = { jwtHeader, jwtPayload }
