const test = require('tape')
const jwtValidator = require('../../../jwt-validator')
const mockBadKidInToken = require('../../fixtures/jwt/converting-jwk-to-pem-format-bad-kid')
const hasKeys = require('../../../lib/has-keys')
const { prop, path } = require('ramda')

const options = {
  req: mockBadKidInToken,
  apiErrorDocsURL: 'https://foo.api.com'
}

test(`jwt-validator: bad kid shouldnt convert jku public key to pem :(`, async t => {
  t.plan(4)

  jwtValidator(options)
    .then(resultObj => {
      t.equals(prop('ok', resultObj), false)
      t.equals(hasKeys(resultObj, ['ok', 'err']), true)
      t.equals(path(['err', 'statusCode'], resultObj), 401)
      t.equals(
        path(['err', 'errorCode'], resultObj),
        'converting-jwk-to-pem-format'
      )
    })
    .catch(err => {
      t.equals(err.message, 'failed test')
    })
})
