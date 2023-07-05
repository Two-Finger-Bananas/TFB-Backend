const client = require('./index')

const { buildDatabase } = require('./seedData')

buildDatabase().catch(console.error).finally(() => client.end()) 