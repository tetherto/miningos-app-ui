/* eslint-disable lodash/prefer-lodash-method */
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const exampleFilePath = path.join(__dirname, './.sentryclirc.example')
const configFileName = path.basename(exampleFilePath).replace('.example', '')
const configFilePath = path.join(__dirname, '../', configFileName)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function askAuthToken() {
  return new Promise((resolve) => {
    rl.question('Please enter your auth-token: ', (authToken) => {
      resolve(authToken)
    })
  })
}

async function createConfigFile() {
  try {
    const exampleConfig = fs.readFileSync(exampleFilePath, 'utf8')
    const authToken = await askAuthToken()
    const newConfig = exampleConfig.replace('<AUTH_TOKEN_PLACEHOLDER>', authToken)

    fs.writeFileSync(configFilePath, newConfig, 'utf8')
    console.log(`Config file created: ${configFilePath}`)
  } catch (error) {
    console.error('Error creating config file:', error)
  } finally {
    rl.close()
  }
}

createConfigFile()
