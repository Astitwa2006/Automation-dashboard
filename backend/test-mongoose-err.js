const mongoose = require('mongoose');

const err = new mongoose.Error.ValidationError(null);
console.log(err.statusCode);
