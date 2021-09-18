const mongoose = require('../db/db');

const videoSchema = new mongoose.Schema({
    thumnail:{
        type:String,
        required:true
    },
    link:{
        type:String,
        required:true
    }
});

const Video = new mongoose.model('Video', videoSchema);

module.exports = Video;