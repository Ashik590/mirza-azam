const mongoose = require('../db/db');

const blogSchema = new mongoose.Schema({
    title:{
        type:String,
    },
    desc:{
        type:String,
    },
    content:{
        type:String,
    },
    category:{
        type:String,
    },
    photo:{
        type:String,
        default:'about.jpg'
    },
    date:{
        type:Date,
        default:Date.now
    },
    comment:[
        {
            name:{
                type:String
            },
            email:{
                type:String
            },
            message:{
                type:String,
            },
            date:{
                type:Date,
                default:Date.now
            }
        }
    ]
})

const Blog = new mongoose.model('Blog', blogSchema);

module.exports = Blog;