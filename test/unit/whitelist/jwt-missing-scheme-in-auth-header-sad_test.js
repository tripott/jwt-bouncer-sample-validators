const test = require('tape')
const whitelistValidator = require('../../../whitelist-validator')
const whitelist = require('../../fixtures/whitelist/whitelist3.json')
const { token } = require('../../fixtures/whitelist/encoded-labs-tenant-token')
const hasKeys = require('../../../lib/has-keys')
const { prop, path } = require('ramda')

const req = {
  headers: {
    authorization: `${token}`
  },
  whitelist
}

const options = {
  req,
  apiErrorDocsURL: 'https://foo.api.com'
}

test(`whitelist-validator: jwt missing scheme 'Bearer' in auth header :(`, async t => {
  t.plan(4)

  whitelistValidator(options)
    .then(resultObj => {
      t.equals(prop('ok', resultObj), false)
      t.equals(hasKeys(resultObj, ['ok', 'err']), true)
      t.equals(path(['err', 'statusCode'], resultObj), 401)
      t.equals(path(['err', 'errorCode'], resultObj), 'missing-bearer-token')
    })
    .catch(err => {
      t.equals(err.message, 'failed test')
    })
})
