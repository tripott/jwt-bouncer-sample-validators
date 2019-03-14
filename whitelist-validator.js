const HTTPError = require('node-http-error')
const jwt = require('jsonwebtoken')
const { prop, pathOr, not, isEmpty, find, isNil } = require('ramda')

module.exports = async options => {
  const { req, apiErrorDocsURL } = options
  const authorizationHeader = pathOr('', ['headers', 'authorization'], req)
  const [scheme, token] = authorizationHeader.split(' ')

  if (scheme !== 'Bearer' || (isEmpty(token) || isNil(token))) {
    const err = new HTTPError(
      401,
      `Unauthorized. Authorization header must include a Bearer token.`,
      {
        name: `Missing Bearer Token`,
        errorCode: `missing-bearer-token`,
        errorReference: `${apiErrorDocsURL}/missing-bearer-token`
      }
    )

    return { ok: false, err }
  }

  if (not(prop('whitelist', req))) {
    const err = new HTTPError(
      500,
      `Unable to validate jwt due to missing whitelist.`,
      {
        name: `Missing Whitelist`,
        errorCode: `missing-whitelist`,
        errorReference: `${apiErrorDocsURL}/missing-whitelist`
      }
    )

    return { ok: false, err }
  }

  const decoded = jwt.decode(token, { complete: true })
  const iss = pathOr('', ['payload', 'iss'], decoded)

  const tenant = pathOr(
    pathOr('', ['payload', 'sub'], decoded),
    ['payload', 'tenant'],
    decoded
  )

  // The `tenant` or `sub` property is optional on the JWT.
  // If the tenant exists, then
  //  use it first when validating CDS Hook client against whitelist.
  // Otherwise, we assume the iss is unique.
  // If iss is not unique then the EHR must provide a `tenant` value in the JWT

  const { whitelist } = req
  // if (process.env.NODE_ENV === "test") {
  //   console.log({ whitelist, tenant, token, decoded });
  // }
  const byIssAndTenant = listItem =>
    listItem.iss === iss &&
    listItem.tenant === tenant &&
    listItem.enabled === true

  const byIss = listItem => listItem.iss === iss && listItem.enabled === true

  const foundWhiteListItem = isEmpty(tenant)
    ? find(byIss, whitelist)
    : find(byIssAndTenant, whitelist)

  if (not(foundWhiteListItem)) {
    const err = new HTTPError(
      401,
      `Unauthorized. We were unable to verify a valid iss or tenant.  If tenant value not provided in JWT, then iss value must be unique in whitelist.`,
      {
        name: `Not Found on Whitelist`,
        errorCode: `not-found-on-whitelist`,
        errorReference: `${apiErrorDocsURL}/not-found-on-whitelist`
      }
    )

    return { ok: false, err }
  }

  return {
    ok: true,
    whiteListItem: foundWhiteListItem,
    decodedToken: decoded,
    token
  }
}
