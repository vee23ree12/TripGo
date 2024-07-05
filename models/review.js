const mongoose = require('mongoose');
const Schema = mongoose.Schema; //or const {schema} = mongoose;

const reviewSchema = new Schema({
    comment: String,
    Rating: {
        type: Number,
        min: 1,
        max: 5,   
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

module.exports = mongoose.model("review", reviewSchema);