const express = require("express");
const { UserModel } = require("../models/students.model");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const randomstring = require("randomstring");
const { BlackListModel } = require("../models/blacklist.model");
const path = require("path");
const app = express();
app.use(express.static(path.join(__dirname, "public")));
const studentRouter = express.Router();

// for send mail
const sendVerificationMail = async (username, email, userId) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "jackayron5@gmail.com",
        pass: "unpptovcdhpfkzdv",
      },
    });

    const mailOptions = {
      from: "jackayron5@gmail.com",
      to: email,
      subject: "For verification mail",
      html: `<p>Hi ${username}, please click here to <a href="http://localhost:8080/user/verify?id=${userId}">verify</a> your mail</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const sendResetPassword = async (username, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "jackayron5@gmail.com",
        pass: "unpptovcdhpfkzdv",
      },
    });

    const mailOptions = {
      from: "jackayron5@gmail.com",
      to: email,
      subject: "For reset password",
      html: `<p>Hi ${username}, please click here to <a href="http://localhost:8080/user/reset-password?token=${token}">reset </a> your password</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

studentRouter.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExist = await UserModel.findOne({ email });

    if (userExist) {
      return res.status(401).send({ msg: "User Already Registered" });
    }

    const hash = await bcrypt.hash(password, 8);

    const newUser = new UserModel({ username, email, password: hash });

    const userData = await newUser.save();
    if (userData) {
      sendVerificationMail(username, email, userData._id);
      res.status(200).json({ msg: "Registration successful", userData });
    } else {
      res.status(401).json({ msg: "Registration failed" });
    }
  } catch (error) {
    res.status(400).json({ msg: "Something went wrong" });
  }
});

// Handle GET request to "/verify"
studentRouter.get("/verify", async (req, res) => {
  try {
    const userId = req.query.id;

    const user = await UserModel.updateOne(
      { _id: userId },
      { $set: { isVerified: true } }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    res.sendFile(path.join(__dirname, "../public/pages/verify.html"));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// To send verification link again

studentRouter.post("/sendlink", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (user) {
      if (user.isVerified) {
        return res
          .status(201)
          .send({ msg: "You are already verified. Please try to login." });
      } else {
        sendVerificationMail(user.username, user.email, user._id);
        return res
          .status(200)
          .send({ msg: "Verification mail sent to your email." });
      }
    } else {
      return res.status(400).send({ msg: "Email not found." });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ msg: "Internal server error." });
  }
});


studentRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const isUserPresent = await UserModel.findOne({ email });
    if (!isUserPresent) {
      return res.status(401).send("user not found");
    }
    const isPass = await bcrypt.compare(password, isUserPresent.password);
    if (!isPass) {
      return res.status(401).send({ msg: "invalid credential" });
    }
    const token = await jwt.sign(
      {
        userId: isUserPresent._id,
      },
      process.env.SECRET,
      { expiresIn: "1hr" }
    );
    res.send({
      msg: "login success",
      token,
      userId: isUserPresent._id,
      username: isUserPresent.username,
      userId: isUserPresent._id,
      isVerified: isUserPresent.isVerified,
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

const updatePassword = async (password) => {
  try {
    const hasPass = await bcrypt.hash(password, 8);
    return hasPass;
  } catch (error) {
    throw new Error("Failed to hash password");
  }
};

studentRouter.get("/reset-password", async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await UserModel.findOne({ token: token });
    if (tokenData) {
      res.cookie("userId", tokenData._id.toString(), { maxAge: 1000 * 60 });
      res.sendFile(path.join(__dirname, "../public/pages/resetpassword.html"));
    } else {
      res.status(201).send({ success: true, msg: "This link expired" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
});

studentRouter.post("/change-password", async (req, res) => {
  try {
      const userId = req.cookies.userId;
      if (!userId) {
        return res
          .status(201)
          .send({ success: true, msg: "User ID not found" });
      }
    const userToken = await UserModel.findById(userId);
    // console.log(userToken);
    if (userToken) {
      const password = req.body.password;
      const newPassword = await updatePassword(password);
      await UserModel.findByIdAndUpdate(
        { _id: userId },
        { $set: { password: newPassword, token: "" } },
        { new: true }
      );
      res
        .status(200)
        .send({ success: true, msg: "Password changed successfully" });
    } else {
      res.status(201).send({ success: true, msg: "This link expired" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
});

studentRouter.post("/forget-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email: email });
if(!user.isVerified){
  return res.status(301).send({msg:"please verify your mail"})
}

    if (user.isVerified) {
      const randomString = randomstring.generate();
      await UserModel.updateOne(
        { email: email },
        { $set: { token: randomString } }
      );
      sendResetPassword(user.username, email, randomString);
      res.status(200).send({
        success: true,
        msg: "Reset password email is sent to your email",
      });
    } else {
      res.status(201).send({ success: true, msg: "This email doesn't exist" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
});

studentRouter.get("/logout", async (req, res) => {
  try {
    const token = req.headers?.authorization;
    if (!token) return res.status(403);
    let blackListedToken = new BlackListModel({ token });
    await blackListedToken.save();
    res.send({ msg: "logout succesfull" });
  } catch (error) {
    res.send(error.message);
  }
});

module.exports = { studentRouter };
