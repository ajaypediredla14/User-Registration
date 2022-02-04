const { sign, verify } = require("jsonwebtoken");

const accessTokenSecret = '6ba13bbd76bb589e93708203ff3f8674bf0ba184acafda7d49b7a53fabd2c4b6e3f0e8e2d68813b839e91c71f9ee6cfa7d27dd3393dc1fce4a54a44d7ffbe09a';
const refreshTokenSecret = 's71fea1f98d1839177469eff41a070472581540e7fcccebb1d2b24eb457fd6f0380a73979b83ff16f8fc7768564049d0dc279dc39ff98e346e12001aa16bf64f3';


const createTokens = (user) => {
  const accessToken = sign(
    { email: user.email, id: user.id },
    accessTokenSecret
  );

  return accessToken;
};

const validateToken = (req, res, next) => {
  const accessToken = req.cookies["access-token"];

  if (!accessToken)
    return res.status(400).json({ error: "User not Authenticated!" });

  try {
    const validToken = verify(accessToken, accessTokenSecret);
    if (validToken) {
      req.authenticated = true;
      return next();
    }
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

module.exports = { createTokens, validateToken };