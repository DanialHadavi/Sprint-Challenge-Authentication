const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require("./auth-model");
const { validateUser } = require("./auth-helpers.js");

router.post("/register", (req, res) => {
  let user = req.body;
  const validateResult = validateUser(user);

  if (validateResult.isSuccessful === true) {
    const hash = bcrypt.hashSync(user.password, 10);
    user.password = hash;

    Users.add(user)
      .then((saved) => {
        res.status(201).json(saved);
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  } else {
    res.status(400).json({
      message: "Invalid information, see errors for details",
      errors: validateResult.errors,
    });
  }
});

router.post("/login", (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then((user) => {
      if (user && bcrypt.compareSync(password, user.password)) {
        // 2: make a token
        console.log(user);
        const token = getJwtToken(user);

        // 3: send the token
        res.status(200).json({
          message: `Welcome ${user.username}! here's your token...`,
          token,
        });
      } else {
        res.status(401).json({ message: "Invalid Credentials" });
      }
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});
function getJwtToken(user) {
  const payload = user;

  const secret = process.env.JWT_SECRET || "super secure secret";

  const options = {
    expiresIn: "1d",
  };

  return jwt.sign(payload, secret, options);
}

module.exports = router;
