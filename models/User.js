const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const randomstring = require('randomstring')
const _ = require('lodash')

const errorTypes = require('../config/constants').errorTypes

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true, unique: true },
  email: { type: String, required: true, index: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: String,
  intro: String,
  avatar: String,
  active: { type: Boolean, default: false },
  admin: { type: Boolean, default: false },
  recoveryCode: String,
  confirmationCode: String
}, { timestamps: true })

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }
  const SALT_FACTOR = 5
  try {
    const salt = await bcrypt.genSalt(SALT_FACTOR)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (e) {
    next(e)
  }
})

UserSchema.methods.verifyPassword = function (password) {
  return new Promise(async (resolve, reject) => {
    try {
      const isValid = await bcrypt.compare(password, this.password)
      return resolve(isValid)
    } catch (e) {
      return reject(e)
    }
  })
}

UserSchema.methods.generateRecoveryCode = function (length = 6) {
  const code = randomstring.generate({
    length,
    charset: 'numeric'
  })

  return code
}

UserSchema.methods.saveRecoveryCode = function (recoveryCode) {
  this.recoveryCode = recoveryCode

  return this.save()
}

UserSchema.methods.generateConfirmationCode = function (length = 12) {
  return randomstring.generate({
    length
  })
}

UserSchema.methods.saveConfirmationCode = function (confirmationObj) {
  this.confirmationCode = confirmationObj

  return this.save()
}

UserSchema.methods.confirmEmail = function (code) {
  console.log(code)
  if (code === this.confirmationCode) {
    this.active = true
    this.confirmationCode = null
    return this.save()
  } else {
    console.log('Invalid code')
    const error = new Error('Invalid confirmation code')
    error.type = errorTypes.CONFIRM_EMAIL_CODE_INVALID

    throw error
  }
}

UserSchema.methods.updatePassword = function (code, password) {
  if (code === this.recoveryCode) {
    this.password = password
    this.recoveryCode = null
    return this.save()
  } else {
    console.log('Invalid code')
    const error = new Error('Invalid recovery code')
    error.type = errorTypes.FORGOT_PASSWORD_CODE_INVALID

    throw error
  }
}

UserSchema.methods.generateJWT = function () {
  return jwt.sign(
    { id: this._id, username: this.username, active: this.active, admin: this.admin },
    process.env.JWT_SECRET,
    {expiresIn: '2 days'}
  )
}

UserSchema.methods.toAuthJSON = function () {
  const profile = {
    id: this._id,
    token: this.generateJWT(),
    username: this.username,
    email: this.email,
    name: this.name,
    intro: this.intro,
    active: this.active,
    avatar: this.avatar,
    created_at: this.createdAt,
    updated_at: this.updatedAt
  }
  return _.omitBy(profile, _.isNil)
}

UserSchema.methods.toProfileJSON = function () {
  const profile = {
    id: this._id,
    username: this.username,
    name: this.name,
    intro: this.intro,
    avatar: this.avatar
  }
  return _.omitBy(profile, _.isNil)
}

module.exports = mongoose.model('User', UserSchema)
