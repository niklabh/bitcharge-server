const mongoose = require('mongoose')

const Currency = require('./Currency')

const AddressSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, required: true },
  currency: { type: mongoose.Schema.Types.ObjectId, ref: 'Currency', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

AddressSchema.index({ user: 1, address: 1, currency: 1 }, { unique: true })

AddressSchema.methods.toAddressJSON = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const currency = await Currency.findById(this.currency)
      return {
        address: this.address,
        currency,
        isActive: this.isActive
      }
    } catch (e) {
      return reject(e)
    }
  })
}

module.exports = mongoose.model('Address', AddressSchema)
