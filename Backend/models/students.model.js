const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default:
        "https://cdn3.iconfinder.com/data/icons/web-design-and-development-2-6/512/87-1024.png",
    },
    role: {
      type: String,
      default: "user",
    },
    subscriptions: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
    subscribers: {
      type: [mongoose.Schema.Types.ObjectId],
      subscribedAt: Date.now,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      default: "",
    },
  },
  {
    versionKey: false,
  }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = { UserModel };
