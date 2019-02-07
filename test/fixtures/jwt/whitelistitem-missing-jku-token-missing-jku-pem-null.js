const params = { tenant: 'labs' }
// const params = { tenant: 'labs', id: 'view-medication-risk' }

const req = {
  params,
  whitelistValidatorResult: {
    ok: true,
    whiteListItem: {
      iss: 'https://sandbox.cds-hooks.org',
      tenant: '48163c5e-88b5-4cb3-92d3-23b800caa927',
      //jku: "https://sandbox.cds-hooks.org/.well-known/jwks.json",
      uriPathTenant: 'labs',
      enabled: true,
      jwkPublicKeyPEM: null
    },
    decodedToken: {
      header: {
        alg: 'ES256',
        typ: 'JWT',
        kid: 'd9cd3c4f-eb08-4304-b973-44f352fd2ca2'
        //,
        //jku: 'https://sandbox.cds-hooks.org/.well-known/jwks.json'
      },
      payload: {
        iss: 'https://sandbox.cds-hooks.org',
        sub: '48163c5e-88b5-4cb3-92d3-23b800caa927',
        aud: 'http://localhost:9000/labs/cds-services/view-medication-risk',
        exp: 1549553283,
        iat: 1549552983,
        jti: 'b59df628-9dc1-41e7-a301-8a891fd03fbd'
      },
      signature:
        'aGYlR3FDh6Y08LLDcXej7dkMJi7SdJmTNFmpWMn4opY1AA54d0es1lgAe5jpeQeD9Vls71j9wixgU89QLkaumw'
    },
    token:
      'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImQ5Y2QzYzRmLWViMDgtNDMwNC1iOTczLTQ0ZjM1MmZkMmNhMiIsImprdSI6Imh0dHBzOi8vc2FuZGJveC5jZHMtaG9va3Mub3JnLy53ZWxsLWtub3duL2p3a3MuanNvbiJ9.eyJpc3MiOiJodHRwczovL3NhbmRib3guY2RzLWhvb2tzLm9yZyIsInN1YiI6IjQ4MTYzYzVlLTg4YjUtNGNiMy05MmQzLTIzYjgwMGNhYTkyNyIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6OTAwMC9sYWJzL2Nkcy1zZXJ2aWNlcy92aWV3LW1lZGljYXRpb24tcmlzayIsImV4cCI6MTU0OTU1MzI4MywiaWF0IjoxNTQ5NTUyOTgzLCJqdGkiOiJiNTlkZjYyOC05ZGMxLTQxZTctYTMwMS04YTg5MWZkMDNmYmQifQ.aGYlR3FDh6Y08LLDcXej7dkMJi7SdJmTNFmpWMn4opY1AA54d0es1lgAe5jpeQeD9Vls71j9wixgU89QLkaumw'
  }
}

module.exports = req
