const mongoose = require('../db/db');

const gallerySchema = new mongoose.Schema({
    src:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true,
        lowercase:true
    }
});

const Gallery = new mongoose.model('Gallery', gallerySchema);

module.exports = Gallery;