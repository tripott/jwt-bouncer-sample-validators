//require("dotenv").config();

require('./unit/jwt-in-whitelist-happy_test')
require('./unit/jwt-not-in-whitelist-happy_test')
require('./unit/jwt-disabled-in-whitelist-happy_test')
require('./unit/jwt-missing-scheme-in-auth-header-sad_test')
require('./unit/jwt-missing-token-in-auth-header-sad_test')
require('./unit/jwt-missing-whitelist-sad_test')
