require("isomorphic-fetch");
const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");
const { prop, find, propEq, pathOr, trim, isNil } = require("ramda");
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

  // The CDS Client (EHR Vendor) MAY make its JWK Set available via a URL identified by the jku header field,
  //   as defined by rfc7515 4.1.2.
  // JKU may not exist on incoming JWT from the client and can be conveyed out of band.
  // We need the ability to obtain JKU from whitelist if not present on JWT.
  // Previous whitelist middleware (whitelist-validator.js) should put the
  //   whitelistValidatorResult prop on request so we can obtain the jku.
  //  Use req.whitelistValidatorResult.whiteListItem.jku from the whitelist if
  //   JKU does not exist on incoming JWT header
  //  The required kid value from the JWT header allows a CDS Service to identify the
  //  correct JWK in the JWK Set that can be used to verify the signature.
  // At run time, we will take the `kid` value from the  the JWT header and use it
  //  verify the signature of the jwt.

  const jku = pathOr(
    pathOr(null, ["whitelistValidatorResult", "whiteListItem", "jku"], req),
    ["header", "jku"],
    token
  );

  // if (isEmpty(jku)) {
  //   const err = new HTTPError(
  //     401,
  //     `Unauthorized. Could not locate jku in jwt header or whitelist.`,
  //     {
  //       name: `Missing jku`,
  //       errorCode: `missing-jku`,
  //       errorReference: `${apiErrorDocsURL}/missing-jku`
  //     }
  //   );
  //
  //   return { ok: false, err };
  // }
  let pem = null;

  if (jku) {
    pem = await fetch(jku)
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
  } else {
    // If the CDS Client (EHR Vendor) omits the jku header field in the incoming JWT,
    //  the CDS Client MUST make its public key, expressed as a JSON Web Key (JWK) in a JWK Set,
    //  as defined by rfc7517.

    // If the jku header field is ommitted, the CDS Client and CDS Service
    //  SHALL communicate the JWK Set out-of-band.
    // For example, an EHR vendor may not make its JWK Set available via a URL identified by the jku header field
    //  instead they will communicate the JWK to the CDS Service provider out-of-band.
    //  We (CDS Service provider) will store a single key from the EHR vendor JWK Set as a
    //   string in PEM format within the `jwkPublicKeyPEM` property on the whitelist.
    // This public key will be communicated us out of band by the EHR Vendor, if necessary.

    // Use jwkPublicKeyPEM prop value if jku value isnt in the header or within the whitelist

    pem = pathOr(
      null,
      ["whitelistValidatorResult", "whiteListItem", "jwkPublicKeyPEM"],
      req
    );

    if (isNil(pem)) {
      const err = new HTTPError(
        401,
        `The CDS Client MUST make its public key, expressed as a JSON Web Key (JWK), available by one of the two methods:  1) via a URL identified by the jku or 2) out of band.  See error documentation within the developer portal for details.`,
        {
          name: `Missing JKU or jwk public key PEM`,
          errorCode: `missing-jwu-or-jwk-pem`,
          errorReference: `${apiErrorDocsURL}/missing-jwu-or-jwk-pem`
        }
      );

      return { ok: false, err };
    }
  }

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

  //return { ok: true };
};
