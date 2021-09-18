// Modules requiring
const express = require("express");
const app = express();
const path = require("path");
const sharp = require('sharp');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const fs = require("fs");
const upload = require('express-fileupload');
const jwt = require("jsonwebtoken");
const router = require("./routers/router");
const hbs = require("hbs");
const cookieParser = require('cookie-parser');
require("dotenv").config();
const Blog = require('./models/blog');
const Gallery = require('./models/gallery');
const Video = require('./models/videos');
const auth_log = require('./middlewares/login-auth');

// constants variables

const port = process.env.PORT || 3000;

// Middleware setting
app.use(cookieParser());
app.use(upload())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(router);
app.use(express.static(path.join(__dirname, "../public")));
app.set("views", path.join(__dirname, "../templates/views"));
app.set("view engine", "hbs");
hbs.registerPartials(path.join(__dirname, "../templates/partials"));

// middleware function

const index_auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const verify = jwt.verify(token, process.env.SECRET_KEY);
    next();
  } catch (error) {
    const allBlog = await Blog.find();

    const news = allBlog.filter((val)=>{
      return val.category == 'News and Events';
    })
    const speech = allBlog.filter(val =>{
      return val.category == 'Speeches and Interviews'
    })
    const blog = allBlog.filter(val =>{
      return val.category == 'Development Work' 
    })
    blog.map((val, index) =>{
      val.sno = index + 1;
    })
    news.map((val, index) =>{
      val.sno = index + 1;
    })
    const firstBlog = blog[0];
    const otherBlog = blog.filter((val) =>{
      return val.title !== firstBlog.title;
    });

    console.log("Login first for go to admin panal");
    res.render("index",{
      firstBlog,
      blog,
      otherBlog,
      speech,
      news
    });
  }
};

// Get method

app.get("/admin",auth_log, async(req, res) => {
  const blog = await Blog.find();
  const gallery = await Gallery.find();
  const video = await Video.find(); 

  video.map(val =>{
    val.url = 'https://www.youtube.com/embed/'+val.link.split('=')[1];
  })

  res.render("admin",{
    blog,
    gallery,
    video
  });
});
app.get('/edit-blog/:editBlog',async(req,res)=>{
  try {
    const id = req.params.editBlog;
    const allblog = await Blog.find();
    const index = allblog.findIndex(val =>{
      return val._id == id;
    })
    const otherBlog = allblog.filter(val =>{
      return val._id != id;
    });
    let otherCategory_old = [];

    otherBlog.map(val =>{
      otherCategory_old.push(val.category);
    })

    let otherCategoryNew = [];
    otherCategory_old.map(val =>{
      if(otherCategoryNew.indexOf(val) === -1){
        otherCategoryNew.push(val)
      }
    })

    const blog = allblog[index];

    let otherCategory = otherCategoryNew.filter((val) =>{
      return val !== blog.category;
    })

    res.render('editBlogPost',{
      blog,
      otherCategory
    })
  } catch (error) {
    console.log(error)
  }
})
app.get('/blogs',async(req,res) =>{
  try {
    const dev_work = await Blog.find({category:'Development Work'}).sort({date:-1});
    const news_events = await Blog.find({category:'News and Events'}).sort({date:-1});
    const speeches_interviews = await Blog.find({category:'Speeches and Interviews'}).sort({date:-1});
    const social_activities = await Blog.find({category:'Social Activities'}).sort({date:-1});

    res.render('blogs',{
      blogCat:{
        dev_work,
        news_events,
        speeches_interviews,
        social_activities
      }
    });
  } catch (error) {
    console.log(error)
  }
})
app.get("/news", async(req, res) => {
  const news = await Blog.find({category:'News and Events'});
  news.map((val, index) =>{
    val.sno = index + 1;
  })
  console.log(news)
  res.render("news",{
    news
  });
});
app.get("/timeline", async(req, res) => {
  const blog = await Blog.find({category:'Speeches and Interviews'});
  res.render("timeline",{
    speech:blog
  });
});
app.get("/about", async(req, res) => {
  const blog = await Blog.find({category:'Development Work'});
  blog.map((val, index) =>{
    val.sno = index + 1;
  })
  const firstBlog = blog[0];
  const otherBlog = blog.filter((val) =>{
    return val.title !== firstBlog.title;
  });
  
  res.render("about",{
    firstBlog,
    blog,
    otherBlog,
  });
});
app.get("/",index_auth, async(req, res) => {
  const allBlog = await Blog.find();

  const news = allBlog.filter((val)=>{
    return val.category == 'News and Events';
  })
  const speech = allBlog.filter(val =>{
    return val.category == 'Speeches and Interviews'
  })
  const blog = allBlog.filter(val =>{
    return val.category == 'Development Work' 
  })
  blog.map((val, index) =>{
    val.sno = index + 1;
  })
  news.map((val, index) =>{
    val.sno = index + 1;
  })
  const firstBlog = blog[0];
  const otherBlog = blog.filter((val) =>{
    return val.title !== firstBlog.title;
  });
  res.render("indexLog",{
    firstBlog,
    blog,
    otherBlog,
    speech,
    news
  });
});
app.get("/speech", async(req, res) => {
  const speech = await Blog.find({category:'Speeches and Interviews'});
  const video = await Video.find(); 

  video.map(val =>{
    val.url = 'https://www.youtube.com/embed/'+val.link.split('=')[1];
  })

  res.render("speech",{
    speech,
    video
  });
});
app.get("/gallery", async(req, res) => {
  const gallery = await Gallery.find();

  console.log(gallery)
  res.render("gallery",{
    gallery
  });
});

//post method

app.post('/write-blog',async(req,res)=>{
  try {
    const obj = {
      title:req.body.title,
      desc:req.body.desc,
      category:req.body.category,
      content:req.body.content,
    }
    const photo = req.files.file;
    const randomName = crypto.randomBytes(16).toString('hex');
    const photoName = randomName + path.extname(photo.name);

    obj.photo = photoName;
    photo.mv(path.join(__dirname, "../public/img/")+photoName,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("File Uploaded");
        sharp(path.join(__dirname, "../public/img/")+photoName)
        .resize(400)
        .toFile(path.join(__dirname, "../public/upload/")+photoName, (err, info) => {
          if(err){
            console.log(err)
          }else{
            console.log("photo resized successdfully");
            // deleting old photo
            fs.unlinkSync(path.join(__dirname, "../public/img/")+photoName)
          }
        })
      }
    })

    const blog = new Blog(obj);

    const result = await blog.save();
    console.log(result)
    res.redirect("/admin");
  } catch (error) {
    console.log(error)
  }
});
app.post('/edit-blog/:blog',async(req,res) =>{
  try {
    const id = req.params.blog;
    
    const blog = await Blog.findOne({_id:id});
    const photo = blog.photo;
    blog.title = req.body.title;
    blog.desc = req.body.desc;
    blog.category = req.body.category;
    blog.content = req.body.content;

    if(req.files){

      let file = req.files.file;
      console.log(req.files.file)

      let ext = path.extname(req.files.file.name);
      // let oldPath = path.join(__dirname, `../public/upload/${id}.jpg`);

      console.log(path.join(__dirname, '../public/img/')+id+ext)
      file.mv(path.join(__dirname, '../public/img/')+id+ext,function(err){
        if(err){
          console.log(err)
        }else{
          sharp(path.join(__dirname, '../public/img/')+id+ext)
          .resize(400)
          .toFile(path.join(__dirname, '../public/upload/')+id+ext, (err, info) => { 
            if(err){
              console.log(err)
            }else{
              console.log("File uploaded with sharped");
              fs.unlinkSync(path.join(__dirname, '../public/img/')+id+ext)
              fs.unlinkSync(path.join(__dirname, "../public/upload/"+photo))

              //updating the blog with database

              blog.photo = id+ext;
              async function update(){
                await blog.save();
                res.redirect('/admin')
              }
              upload()
            }
          });
        }
      })
    }else{
      await blog.save();
      res.redirect('/admin')
      console.log(blog)
    }

  } catch (error) {
    console.log(error)
  }
})
app.get('/blogs/:blog',async(req,res) =>{
  try {
    const param = req.params.blog;
    const result = await Blog.findOne({_id:param});
    console.log(result)
    res.render('blog_page',{
      blog:result
    });
  } catch (error) {
    console.log(error)
  }
})
app.post("/blogs/:blog",async(req,res) =>{
  try {
    const id = req.params.blog;
    const blog = await Blog.findOne({_id:id});

    blog.comment.push(req.body);
    await blog.save();
    console.log(blog);

    res.redirect(`/blogs/${id}`);
  } catch (error) {
    console.log(error)
  }
});
app.post('/delete-blog',async(req,res)=>{
  try {
    let id = req.body.del;
  
    const result = await Blog.deleteMany({_id:id});
  
    console.log(result)
  
    res.send('Blog deleted')
  } catch (error) {
    console.log(error)
  }
});
app.post('/post_gallery',async(req,res) =>{
  try {
    const file = req.files.gallery;
    const fileName = crypto.randomBytes(16).toString('hex') + path.extname(file.name);
    const gallery = new Gallery({
      src:fileName,
      category:req.body.category
    });
    file.mv(path.join(__dirname, '../public/upload/')+fileName, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Gallery uploaded")
      }
    })
    const result = await gallery.save();
    console.log(result)
    res.redirect('/admin')
    
  } catch (error) {
    console.log(error)
  }
})
app.post('/delete-comment', async(req,res)=>{
  try {
    let id = req.body.del;
    const blog = await Blog.findOne({'comment._id':id});

    const comment = blog.comment.filter( val =>{
      return val._id.toString() !== id;
    });

    blog.comment = comment;
    await blog.save();
    res.redirect('/admin');
    // console.log(id)
  } catch (error) {
    console.log(error)
  }
})
app.post('/delete_gallery/:gallery', async(req,res)=>{
  try {
    const id = req.params.gallery;
    const gallery = await Gallery.findByIdAndDelete({_id:id});
    fs.unlink(path.join(__dirname, "../public/upload/")+gallery.src,()=>{
      console.log('Deleted gallery')
    });

    res.redirect('/admin')

  } catch (error) {
    console.log(error)
  }
})
app.post('/video_upload',async(req,res)=>{
  try {
    const obj = {
      link:req.body.link,
    }

    const file = req.files.thumnail;
    const ext = path.extname(file.name);
    const filename = crypto.randomBytes(16).toString('hex') + ext;

    file.mv(path.join(__dirname, '../public/img/')+filename, function(err){
      if(err){
        console.log(err);
      }else{
        sharp(path.join(__dirname, '../public/img/')+filename)
        .resize(500)
        .toFile(path.join(__dirname, '../public/upload/')+filename, (err, info) => {
          if(err){
            console.log(err)
          }else{
            fs.unlink(path.join(__dirname, '../public/img/')+filename, ()=>{
              console.log("FIle saved with formatting")
            })
          }
        });
      }
    })
    obj.thumnail = filename;
    const result = new Video(obj)
    const video = await result.save();

    console.log(video);

    res.redirect('/admin');
  } catch (error) {
    console.log(error)
  }
})
app.post('/delete-video/:video',async(req,res)=>{
  try {
    const id = req.params.video;
    const video = await Video.findByIdAndDelete({_id:id});
    const thumnail = video.thumnail;

    fs.unlink(path.join(__dirname, "../public/upload/")+thumnail,(err)=>{
      if(err){
        console.log(err)
      }else{
        console.log('the video is deleted with Video thumnail in dir')
      }
    })
    console.log(video);
    res.redirect('/admin')
  } catch (error) {
    console.log(error)
  }
})
app.post('/contact', (req,res)=>{
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'adnanshanto1@gmail.com',
        pass: '01991393572'
      }
    });

    const content = `<h1 style='text-align:center;font-weight:bold; color:tomato;text-transform:capitalize'>Message from ${req.body.name}</h1>
                     <h4 style='text-align:center'><i>${req.body.email}</i></h4>
                     <p style='text-align:center;background:#ddd;padding:15px'>${req.body.message}</p>`;
    
    const mailOptions = {
      from: 'adnanshanto1@gmail.com',
      to: 'ashik@a2zcreatives.com',
      subject: 'Message from your website',
      html:content
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    console.log(req.body)

    res.redirect('/contact');
})

// Listening server at port
app.listen(port, () => {
  console.log("connection with server port", port);
});
