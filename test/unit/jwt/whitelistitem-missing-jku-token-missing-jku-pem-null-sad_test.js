const test = require('tape')
const jwtValidator = require('../../../jwt-validator')
const mockNullPublicKeyRequestObject = require('../../fixtures/jwt/whitelistitem-missing-jku-token-missing-jku-pem-null')
const hasKeys = require('../../../lib/has-keys')
const { prop, path } = require('ramda')

const options = {
  req: mockNullPublicKeyRequestObject,
  apiErrorDocsURL: 'https://foo.api.com'
}

test(`jwt-validator: missing whitelistitem jku, missing token jku, null whitelistitem jwkPublicKeyPEM :(`, async t => {
  t.plan(4)

  jwtValidator(options)
    .then(resultObj => {
      t.equals(prop('ok', resultObj), false)
      t.equals(hasKeys(resultObj, ['ok', 'err']), true)
      t.equals(path(['err', 'statusCode'], resultObj), 401)
      t.equals(path(['err', 'errorCode'], resultObj), 'missing-jku-or-jwk-pem')
    })
    .catch(err => {
      t.equals(err.message, 'failed test')
    })
})
