
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId = decoded.id || decoded._id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid token payload"
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked"
      });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();

  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Invalid or expired token"
      });
    }

    console.error("Auth middleware error:", error);

    return res.status(500).json({
      message: "Server error during authentication"
    });
  }
};

module.exports = authMiddleware;
