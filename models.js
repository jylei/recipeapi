const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');
const validator = require('validator');
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: 'Please supply an username'
  },
  password: {
    type: String,
    required: true
  },
  recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }]
});

userSchema.statics.hashPassword = function (password) {
  return bcrypt
    .hash(password, 10)
    .then(hash => hash);
}
userSchema.methods.validatePassword = function (password) {
  return bcrypt
    .compareSync(password, this.password)
}

userSchema.methods.apiRepr = function () {
  return {
    id: this._id,
    username: this.username,
    password: this.password
  }
}
userSchema.plugin(mongodbErrorHandler);
const User = mongoose.model('User', userSchema);

//add steps to recipeschema, imgurl
//upload img with an id
//takes name of img and send img data back to client,
const recipeSchema = mongoose.Schema({
  username: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dishName: {type: String, required: true},
  calories: {type:Number},
  ingredients: {type: Array, required: true},
  steps: {type: Array},
  image: {type: String}
});

recipeSchema.methods.homePageRes = function () {
  //caps first letter of every word
  var dish = this.dishName.toLowerCase().replace(/(^| )(\w)/g, s => s.toUpperCase());
  return {
    id: this._id,
    dishName: dish,
    ingredients: this.ingredients
  }
}

recipeSchema.methods.apiResponse = function () {
  var dish = this.dishName.toLowerCase().replace(/(^| )(\w)/g, s => s.toUpperCase());
  return {
    id: this._id,
    username: this.username,
    dishName: dish,
    ingredients: this.ingredients,
    calories: this.calories,
    steps: this.steps,
    image: this.image
  }
}

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = { Recipe, User };