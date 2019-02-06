const fs = require('fs-extra')

fs.remove('./dist')
  .then(() => fs.copy('./index.js', './dist/index.js'))
  .then(() => fs.copy('./jwt-validator.js', './dist/jwt-validator.js'))
  .then(() =>
    fs.copy('./whitelist-validator.js', './dist/whitelist-validator.js')
  )
  .then(result => console.log('Build process completed SUCCESSFULLY!'))
  .catch(err => {
    console.log('Build process FAILED!')
    console.error(err)
  })
