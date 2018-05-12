const mongoose = require('mongoose')

const CurrencySchema = mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  icon: { type: String, require: true }
}, { timestamps: true })

CurrencySchema.methods.toCurrencyJSON = function () {
  return {
    name: this.name,
    symbol: this.symbol,
    icon: this.icon
  }
}

module.exports = mongoose.model('Currency', CurrencySchema)
