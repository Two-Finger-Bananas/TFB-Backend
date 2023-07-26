const pg = require("pg")

const client = new pg.Client("postgres://bananalytics_user:swhKNEzRKlOc6yKBSuZtIcWjeWhhz0LZ@dpg-cj005318g3n4aimurmn0-a/bananalytics")

module.exports = client