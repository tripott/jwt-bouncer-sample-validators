const test = require('tape')
const jwtValidator = require('../../../jwt-validator')
const mockCDSServicesRequestObject = require('../../fixtures/jwt/simple-req-obj-cds-services')

const hasKeys = require('../../../lib/has-keys')
const { prop } = require('ramda')

const options = {
  req: mockCDSServicesRequestObject,
  apiErrorDocsURL: 'https://foo.api.com'
}

test(`jwt-validator: labs tenant, call jku to get public keys :)`, async t => {
  t.plan(2)

  jwtValidator(options)
    .then(resultObj => {
      //console.log({ resultObj });

      t.equals(prop('ok', resultObj), true)
      t.equals(hasKeys(resultObj, ['ok']), true)
    })
    .catch(err => {
      t.equals(err.message, 'failed test')
    })
})
