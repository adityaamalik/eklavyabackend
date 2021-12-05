const expressJwt = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  // const api = process.env.API_URL;
  return expressJwt({
    secret,
    algorithms: ["HS256"],
    // isRevoked: isRevoked
  }).unless({
    path: [
      `/mentee/login`,
      `/mentee/register`,
      `/`,
      `/mentor/login`,
      `/mentor/register`,
      `/mentor/category`,
    ],
  });
}

async function isRevoked(req, payload, done) {
  if (!payload.isAdmin) {
    done(null, true);
  }

  done();
}

module.exports = authJwt;
