const mongoose = require("mongoose");

mongoose
  .connect(
    `mongodb+srv://ashik:${process.env.PASS}@cluster0.zkj5b.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology:true
    }
  )
  .then(() => console.log("successfully connected with database"))
  .catch((err) => console.log(err));

module.exports = mongoose;
