require("isomorphic-fetch");
const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");
const { prop, find, propEq, pathOr, trim, isEmpty } = require("ramda");
const HTTPError = require("node-http-error");

const getCDSHookAudienceURL = env => {
  return env === "dev"
    ? process.env.CDS_HOOK_JWT_AUDIENCE_URL_DEV
    : env === "test"
    ? process.env.CDS_HOOK_JWT_AUDIENCE_URL_TEST
    : env === "prod"
    ? process.env.CDS_HOOK_JWT_AUDIENCE_URL_PROD
    : process.env.CDS_HOOK_JWT_AUDIENCE_URL_DEV;
};

module.exports = async options => {
  if (process.env.NODE_ENV === "test") {
    console.log("JWT-VALIDATOR");
  }
  const { req, apiErrorDocsURL } = options;

  const jwtAudienceURL = getCDSHookAudienceURL(req.header("Apigee-Env"));
  const uriPathTenant = trim(pathOr("", ["params", "tenant"], req));
  const cdsServiceID = pathOr("view-medication-risk", ["params", "id"], req);
  const audience = [
    `${jwtAudienceURL}/${uriPathTenant}/cds-services`,
    `${jwtAudienceURL}/${uriPathTenant}/cds-services/${cdsServiceID}`
  ];

  const token = pathOr("", ["whitelistValidatorResult", "token"], req);

  // JKU may not exist on incoming JWT from the client and can be conveyed out of band.
  // We need the ability to obtain JKU from whitelist if not present on JWT.
  // Previous whitelist middleware puts whitelistValidatorResult prop on request so we can obtain the jku.
  //  Use req.whitelistValidatorResult.whiteListItem.jku from the whitelist if JKU does not exist on incoming JWT header
  const jku = pathOr(
    pathOr(null, ["whitelistValidatorResult", "whiteListItem", "jku"], req),
    ["header", "jku"],
    token
  );

  if (isEmpty(jku)) {
    const err = new HTTPError(
      401,
      `Unauthorized. Could not locate jku in jwt header or whitelist.`,
      {
        name: `Missing jku`,
        errorCode: `missing-jku`,
        errorReference: `${apiErrorDocsURL}/missing-jku`
      }
    );

    return { ok: false, err };
  }

  const pem = await fetch(jku)
    .then(res => res.json())
    .then(prop("keys"))
    .then(find(propEq("kid", token.header.kid)))
    .then(jwkToPem)
    .catch(convertErr => {
      const err = new HTTPError(
        401,
        `Problem converting the JWK (json web key) to a PEM format.  Error Message: ${
          convertErr.message
        }`,
        {
          name: `Converting JWK to PEM Format`,
          errorCode: `converting-jwk-to-pem-format`,
          errorReference: `${apiErrorDocsURL}/converting-jwk-to-pem`
        }
      );

      return { ok: false, err };
    });

  // during integration testing jwt verification will always fail.
  if (process.env.NODE_ENV === "test") {
    console.log("Test Mode --> Skipping jwt verify");
    return { ok: true };
  } else {
    jwt.verify(
      token,
      pem,
      {
        algorithms: [token.header.alg],
        audience
      },
      (jwtVerifyErr, token) => {
        if (jwtVerifyErr) {
          const err = new HTTPError(
            401,
            `Unauthorized.  Could not verify JWT.  Ensure the expiration and audience within the JWT are valid. Error Message: ${
              jwtVerifyErr.message
            }`,
            {
              name: `Verify JWT`,
              errorCode: `verify-jwt`,
              errorReference: `${apiErrorDocsURL}/verify-jwt`
            }
          );

          return { ok: false, err };
        }

        return { ok: true };
      }
    );
  }

  return { ok: true };
};
