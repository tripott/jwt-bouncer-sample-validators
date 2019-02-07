const jwt = require('jsonwebtoken')

const createSignedJWT = require('../../../lib/create-signed-jwt')
const {
  jwtHeader,
  jwtPayload
} = require('./jwt-es384-jwktest-jwt-header-payload-bad-aud')
const { privatePEM } = require('./pems')

const token = createSignedJWT({ jwtHeader, jwtPayload, privatePEM })

const decodedToken = jwt.decode(token, { complete: true })

const whiteListItem = {
  iss: 'https://sandbox.cds-hooks.org',
  tenant: 'jwktest',
  jku: null,
  uriPathTenant: 'jwktest',
  enabled: true,
  jwkPublicKeyPEM:
    '-----BEGIN PUBLIC KEY-----\nMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEpMG9Efah0bo91AI4TxQ3BTfQyFLuK5bU\nUj1QhEyBoohllYystK9Lylfw+Emcpoop+v65Oq4Q4bgD6CjeZkkSOAnZe6EFAW0H\nLoGAeTQmzWnzi905dZrt9l882XdQwlzU\n-----END PUBLIC KEY-----\n'
}

const params = { tenant: 'jwktest' }
// const params = { tenant: 'labs', id: 'view-medication-risk' }

const req = {
  params,
  whitelistValidatorResult: {
    ok: true,
    whiteListItem,
    decodedToken,
    token
  }
}

module.exports = req