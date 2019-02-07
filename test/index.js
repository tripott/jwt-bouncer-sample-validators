require('dotenv').config()

// Whitelist validator tests
require('./unit/whitelist/jwt-in-whitelist-happy_test')
require('./unit/whitelist/jwt-not-in-whitelist-happy_test')
require('./unit/whitelist/jwt-disabled-in-whitelist-happy_test')
require('./unit/whitelist/jwt-missing-scheme-in-auth-header-sad_test')
require('./unit/whitelist/jwt-missing-token-in-auth-header-sad_test')
require('./unit/whitelist/jwt-missing-whitelist-sad_test')

// jwt validator tests
require('./unit/jwt/happy_test')
require('./unit/jwt/whitelistitem-null-jku-token-null-jku-pem-null-sad_test')
