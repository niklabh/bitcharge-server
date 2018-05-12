const mongoose = require('mongoose')

const CurrencySchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  symbol: { type: String, required: true, unique: true },
  icon: { type: String, required: true }
}, { timestamps: true })

CurrencySchema.methods.toCurrencyJSON = function () {
  return {
    name: this.name,
    symbol: this.symbol,
    icon: this.icon
  }
}

module.exports = mongoose.model('Currency', CurrencySchema)
