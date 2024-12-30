const User = require('../models/User')
const passport = require('../models/passport');
const jwt = require('jsonwebtoken');



const JWT_SECRET = 'your_jwt_secret';


const index = async (req,res) => {
    const users = await User.find();
    return res.json(users);
}

const getbyId = async (req,res) =>{
    const users = await User.findById(req.params.id);
    return res.json(users);
}

const update = async (req,res) => {
    const users = await User.findByIdAndUpdate(req.params.id,{
        "name":req.body.name,
        "email":req.body.email,
        "age":req.body.age
      });
    return res.json(users);
}

const destroy = async (req,res) => {
    await User.findByIdAndDelete(req.params.id);
  return res.json({
    "message":"deleted successfully"
  });
}

const store = async (req,res) => {
    try{
        const NewUser = new User({
          name: req.body.name,
          email: req.body.email,
          age: parseInt(req.body.age),
          password: req.body.password,
        });
    
        const savedUser = await NewUser.save();
        res.json({
          message: ' User Saved Successfully',
          user: savedUser
        });
        
      }
      catch(err){
        res.status(500).json({
          message: 'Error saving User',
          error: err
        })
    }
}

const login = (req,res,next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message || 'Authentication failed' });
    }

    // User authenticated successfully, now create JWT
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    // Respond with the token
    return res.status(200).json({
      message: 'Login successful',
      token: token,
    });
  })(req, res, next);
}
const tokenBlacklist = new Set();
const logout = (req, res, next) => {
  // Extract token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(400).json({ message: 'Token is required for logout' });
  }

  // Add the token to the blacklist
  tokenBlacklist.add(token);

  return res.status(200).json({ message: 'Logout successful' });
};

// Middleware to check if a token is blacklisted
const isTokenBlacklisted = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Token has been invalidated. Please log in again.' });
  }
  next();
};




module.exports = {
  index,
  getbyId,
  update,
  destroy,
  store,
  login,
  logout,
  isTokenBlacklisted
};