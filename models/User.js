const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const _ = require('lodash')

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true, unique: true },
  email: { type: String, required: true, index: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: String,
  intro: String,
  avatar: String
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

UserSchema.methods.generateJWT = function () {
  return jwt.sign(
    { id: this._id, username: this.username },
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
