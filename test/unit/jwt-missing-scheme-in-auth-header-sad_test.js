const test = require('tape')
const whitelistValidator = require('../../whitelist-validator')
const whitelist = require('../fixtures/whitelist-validator-tests/whitelist3.json')
const {
  token
} = require('../fixtures/whitelist-validator-tests/encoded-labs-tenant-token')
const hasKeys = require('../../lib/has-keys')
const { prop, path } = require('ramda')

const req = {
  params: {
    tenant: 'labs'
  },
  headers: {
    authorization: `${token}`
  },
  whitelist
}

const options = {
  req,
  apiErrorDocsURL: 'https://foo.api.com'
}

test(`jwt missing scheme 'Bearer' in auth header :(`, async t => {
  t.plan(4)

  whitelistValidator(options)
    .then(resultObj => {
      console.log({ resultObj })

      t.equals(prop('ok', resultObj), false)
      t.equals(hasKeys(resultObj, ['ok', 'err']), true)
      t.equals(path(['err', 'statusCode'], resultObj), 401)
      t.equals(path(['err', 'errorCode'], resultObj), 'missing-bearer-token')
    })
    .catch(err => {
      t.equals(err.message, 'failed test')
    })
})
