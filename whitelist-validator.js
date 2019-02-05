require("isomorphic-fetch");
const HTTPError = require("node-http-error");
const jwt = require("jsonwebtoken");
const { prop, pathOr, trim, not, isEmpty, find } = require("ramda");

module.exports = async options => {
  const { req, apiErrorDocsURL } = options;
  const uriPathTenant = trim(pathOr("", ["params", "tenant"], req));
  const authorizationHeader = pathOr("", ["headers", "authorization"], req);
  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer") {
    const err = new HTTPError(
      401,
      `Unauthorized. Authorization header must include a Bearer token.`,
      {
        name: `Missing Bearer Token`,
        errorCode: `missing-bearer-token`,
        errorReference: `${apiErrorDocsURL}/missing-bearer-token`
      }
    );

    return { ok: false, err };
  }

  if (not(prop("whitelist", req))) {
    const err = new HTTPError(
      500,
      `Unable to validate jwt due to missing whitelist.`,
      {
        name: `Missing Whitelist`,
        errorCode: `missing-whitelist`,
        errorReference: `${apiErrorDocsURL}/missing-whitelist`
      }
    );

    return { ok: false, err };
  }

  const decoded = jwt.decode(token, { complete: true });
  const iss = pathOr("", ["payload", "iss"], decoded);

  const tenant = pathOr(
    pathOr("", ["payload", "sub"], decoded),
    ["payload", "tenant"],
    decoded
  );

  // We require a tenant value for billing CDS Hook services.
  // The `tenant` property is optional on the JWT. However, we require a tenant value for billing.
  // If the `tenant` property exists on JWT, the use it first when validating CDS Hook client against whitelist.
  // If whitelist entry cannot be found using the JWT `tenant` property,
  //  then attempt to use the tenant value provided in the HTTP URL path parameter that is
  //  provided in the request to the CDS Hook Service proxy.

  const { whitelist } = req;

  const hasTenant = listItem =>
    listItem.iss === iss &&
    listItem.tenant === tenant &&
    listItem.uriPathTenant === uriPathTenant &&
    listItem.enabled === true;

  const hasURIPathTenant = listItem =>
    listItem.iss === iss &&
    listItem.uriPathTenant === uriPathTenant &&
    listItem.enabled === true;

  const foundWhiteListItem = isEmpty(tenant)
    ? find(hasURIPathTenant, whitelist)
    : find(hasTenant, whitelist);

  if (not(foundWhiteListItem)) {
    const err = new HTTPError(
      401,
      `Unauthorized. We were unable to verify a valid tenant and EHR.`,
      {
        name: `Not Found on Whitelist`,
        errorCode: `not-found-on-whitelist`,
        errorReference: `${apiErrorDocsURL}/not-found-on-whitelist`
      }
    );

    return { ok: false, err };
  }

  return {
    ok: true,
    whiteListItem: foundWhiteListItem,
    decodedToken: decoded,
    token
  };
};
