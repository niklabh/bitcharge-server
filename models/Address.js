const mongoose = require('mongoose')

const AddressSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, required: true },
  currency: { type: mongoose.Schema.Types.ObjectId, ref: 'Currency', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

AddressSchema.index({ user: 1, address: 1, currency: 1 }, { unique: true })

AddressSchema.methods.toAddressJSON = function (currency) {
  return {
    address: this.address,
    currency,
    isActive: this.isActive
  }
}

module.exports = mongoose.model('Address', AddressSchema)
