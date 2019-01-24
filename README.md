# jwt-bouncer-sample-validators

![npm version](https://img.shields.io/badge/npm-1.0.2-blue.svg) ![Licence MIT](https://img.shields.io/badge/licence-MIT-yellowgreen.svg) ![Open Issues](https://img.shields.io/github/issues-raw/tripott/jwt-bouncer-sample-validators.svg)

Pass a validator function to [`jwt-bouncer`](https://www.npmjs.com/package/jwt-bouncer) which will invoke the validator to check the jwt.

## Whitelist Validator

The Whitelist validator sample function takes an `options` object as its argument. The `options` object will contain a propery named `req` which represents the ExpressJS request object and a url to the error documentation. The validator determines if a JWT is present on the incoming request as an `Authorization` header containing a `Bearer` token. If so, it decodes and checks the JWT against a whitelist.

> This validator assumes that a whitelist array has already been retrieved by prior middleware and is available as a `whitelist` property on the request object.

If everything is ok, the validator returns an object containing these properties:

- `ok` - a value of `true` denotes success
- `whiteListItem` - the found item in the whitelist
- `token` - the decoded token

```js
{
  ok: true,
  whiteListItem: foundWhiteListItem,
  token: decoded
}
```

If the jwt did not pass whitelist validation then the object returned from the validator will look like:

```js
{
  ok: false, err;
}
```

## JWT Validator

JWT Validator function that takes an options object as its argument containing `req` and `apiErrorDocsURL` properties. The validator then:

- Retrieves a json web key (jwk) from a publicly available JSON Web Keyset resource served from an url endpoint.
- Converts the json web key to PEM format
  > Privacy-Enhanced Mail (PEM) is a de facto file format for storing and sending cryptographic keys, certificates, and other data, based on a set of 1993 IETF standards defining "privacy-enhanced mail."
- Verifies the JWT token and audience using against a publicly available JSON Web Keyset resource served from an url endpoint
