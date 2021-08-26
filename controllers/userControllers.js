const User = require('../models/user');
const passport = require('passport');

module.exports.register = async (req, res, next) => {
  console.log("Reached register controller");
  try {
    const { email, username, password, role } = req.body;
    const user = new User({ email, username, role });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
      if (err) return next(err);
      res.send({
        message: 'Registration successful',
        id: registeredUser._id,
        username: registeredUser.username,
        role: registeredUser.role
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.login = async (req, res, next) => {
  console.log("Reached login controller");
  try {
    passport.authenticate('local', (err, user, info) => {
      if (err) throw err;
      if (!user) {
        res.status(401).send("No user found");
      } else {
        req.login(user, (err) => {
          res.send({
            message: "Login Successful",
            id: user._id,
            username: user.username,
            role: user.role
          });
        });
      }
    })(req, res, next);
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.logout = (req, res) => {
  console.log("Reached logout controller");
  try {
    req.logout();
    res.send('Logout successful');
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};