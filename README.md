# jwt-bouncer-sample-validators

![npm version](https://img.shields.io/badge/npm-1.4.4-blue.svg) ![Licence MIT](https://img.shields.io/badge/licence-MIT-yellowgreen.svg) ![Open Issues](https://img.shields.io/github/issues-raw/tripott/jwt-bouncer-sample-validators.svg)

Pass a validator function to [`jwt-bouncer`](https://www.npmjs.com/package/jwt-bouncer) which will invoke the validator to check the jwt.

## Whitelist Validator

The Whitelist validator sample function takes an `options` object as its argument. The `options` object will contain a property named `req` which represents the ExpressJS request object and a url to the error documentation. The validator determines if a JWT is present on the incoming request as an `Authorization` header containing a `Bearer` token. If so, it decodes and checks the JWT against a whitelist.

> This validator assumes that a whitelist array has already been retrieved by prior middleware and is available as a `whitelist` property on the request object.

If everything is ok, the validator returns an object containing these properties:

- `ok` - a value of `true` denotes success
- `whiteListItem` - the found item in the whitelist
- `decodedToken` - the decoded token
- `token` - the token (not decoded)

```js
{
  ok: true,
  whiteListItem: foundWhiteListItem,
  decodedToken: decoded,
  token
}
```

If the jwt did not pass whitelist validation then the object returned from the validator will look like:

```js
{
  ok: false, err;
}
```

## JWT Validator

The jwt validator sample function takes an `options` object as its argument. The `options` object will contain a property named `req` which represents the ExpressJS request object and a url to the error documentation.

The CDS Client (EHR Vendor) MAY make its JWK (JSON Web Key/Public Key) set available via a URL identified by the `jku` header field, as defined by rfc7515 4.1.2. If the `jku` (JSON Web Key URL) property does not exist on incoming JWT header from the client then attempt to obtain `jku` property from whitelist.

If the `jku` _DOES_ exists then we fetch the JWK Set using the `jku` url. The required `kid` value from the JWT header allows a CDS Service to identify the correct JWK in the JWK Set.

If a `jku` _DOES NOT_ exist, the CDS Client MUST communicate the JWK to the CDS Service provider (that's us) out-of-band. In this case, we should have already communicated with the EHR vendor and stored a single key from the EHR vendor as a string in PEM format using the `jwkPublicKeyPEM` property on the whitelist item.

Either way, once we have a JWK, we make sure its in PEM format and attempt to verify the jwt.

## Validator Error Handling

If there's a problem, return an error to the `jwt-bouncer` and let the bouncer call the error handling middleware. If this occurs, the client receives the appropriate HTTP error message. Otherwise, the `jwt-bouncer` calls the next function and the next middleware in line continues to processes the request.
