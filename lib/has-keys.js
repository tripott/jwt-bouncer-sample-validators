const { all, equals, map, has, __, compose } = require('ramda')

module.exports = (body, names) =>
  compose(
    all(equals(true)),
    map(has(__, body))
  )(names)
