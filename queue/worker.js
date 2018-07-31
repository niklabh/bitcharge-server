const Agenda = require('agenda')
require('dotenv').config()

const jobs = require('./jobs')

const isProduction = process.env.NODE_ENV === 'production'
const mongoURI = isProduction ? process.env.PROD_DB : process.env.LOCAL_DB

const connectionOpts = {
  db: {
    address: mongoURI,
    collection: 'Jobs'
  }
}

const agenda = new Agenda(connectionOpts)

jobs.forEach((job) => {
  job(agenda)
})

if (jobs.length) {
  agenda.start()
}

module.exports = agenda
