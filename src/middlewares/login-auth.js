const jwt = require("jsonwebtoken");

const auth_log = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const verify = jwt.verify(token, process.env.SECRET_KEY);

    next();
  } catch (error) {
    console.log("Login first for go to admin panal");
    res.render("index");
  }
};

module.exports = auth_log;
