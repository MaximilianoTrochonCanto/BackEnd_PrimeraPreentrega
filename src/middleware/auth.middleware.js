// middleware/auth.middleware.js
import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];  // Extract token from header

    // Verify the token
    jwt.verify(token, 'your_jwt_secret', (err, user) => {  // Ensure the same secret key
      if (err) {
        return res.status(403).json({ message: "Token is not valid" });
      }

      req.user = user;  // Assign the authenticated user to req.user
      next();
    });
  } else {
    return res.status(401).json({ message: "User not authenticated" });
  }
};

export const adminOnly = (req, res, next) => {
  console.log({ message: "User entering", user: req.user });
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access forbidden: Admins only" });
  }
  next();
};

export const userOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "user") {
    return res.status(403).json({ message: "Access forbidden: Users only" });
  }
  next();
};
