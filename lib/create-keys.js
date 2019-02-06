const { merge, omit, compose } = require('ramda')
const uuid = require('uuid/v4')
const jwk = require('jwk-lite')

module.exports = async () => {
  /*
    generate ES256 Key Pair A key pair contains a private and public key.
    Using the ECDSA algorithm the jwk.generateKey function generates the keys and returns them via a promise
  */
  const keys = await jwk.generateKey('ES384')
  const kid = uuid()

  // helper functions
  /*
    JWT Libraries (https://jwt.io/#libraries-io) provide sign and
    verify functionality using JsonWebKeys (JWK)
    In order for the JsonWebKeys (JWK) documents to be usuable by the JWT Libraries,
    convert the returned js object by appending the kid, alg, and use nodes for each key.
  */

  function convert(k) {
    const core = { kid, alg: 'ES384', use: 'sig' }
    const unneededKeys = ['ext', 'key_ops']
    return compose(
      merge(core),
      omit(unneededKeys)
    )(k)
  }

  /*
    create json jwk docs
    In order to use these keys, we need to export them to a js object and
    modify the shape of the object to include some meta data to describe the keys.
  */
  const privateJwk = convert(await jwk.exportKey(keys.privateKey))
  const publicJwk = convert(await jwk.exportKey(keys.publicKey))

  return { publicJwk, privateJwk }
}
