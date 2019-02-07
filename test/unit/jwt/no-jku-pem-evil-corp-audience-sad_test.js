const test = require('tape')
const jwtValidator = require('../../../jwt-validator')
const mockCDSServicesRequestObject = require('../../fixtures/jwt/req-obj-generated-token-with-bad-audience')

const hasKeys = require('../../../lib/has-keys')

const { prop, path } = require('ramda')

const options = {
  req: mockCDSServicesRequestObject,
  apiErrorDocsURL: 'https://foo.api.com'
}

test(`jwt-validator: verify token using publicKeyPEM with bad EVIL CORP AUDIENCE :(`, async t => {
  t.plan(4)

  jwtValidator(options)
    .then(resultObj => {
      //console.log({ resultObj });

      t.equals(prop('ok', resultObj), false)
      t.equals(hasKeys(resultObj, ['ok', 'err']), true)
      t.equals(path(['err', 'statusCode'], resultObj), 401)
      t.equals(path(['err', 'errorCode'], resultObj), 'verify-jwt')
    })
    .catch(err => {
      t.equals(err.message, 'failed test')
    })
})
