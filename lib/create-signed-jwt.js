const jwt = require('jsonwebtoken')

module.exports = ({ jwtHeader, jwtPayload, privatePEM }) =>
  jwt.sign(jwtPayload, privatePEM, { header: jwtHeader })
