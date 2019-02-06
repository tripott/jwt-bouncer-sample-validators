const test = require('tape')
const whitelistValidator = require('../../whitelist-validator')
const whitelist = require('../fixtures/whitelist-validator-tests/whitelist1.json')
const {
  token
} = require('../fixtures/whitelist-validator-tests/encoded-labs-tenant-token')
const hasKeys = require('../../lib/has-keys')
const { prop } = require('ramda')

const req = {
  params: {
    tenant: 'labs'
  },
  headers: {
    authorization: `Bearer ${token}`
  },
  whitelist
}

const options = {
  req,
  apiErrorDocsURL: 'https://foo.api.com'
}

test(`jwt should be on whitelist :)`, async t => {
  t.plan(2)

  whitelistValidator(options)
    .then(resultObj => {
      console.log({ resultObj })

      t.equals(prop('ok', resultObj), true)
      t.equals(
        hasKeys(resultObj, ['ok', 'whiteListItem', 'decodedToken', 'token']),
        true
      )
    })
    .catch(err => {
      t.equals(err.message, 'failed test')
    })
})
