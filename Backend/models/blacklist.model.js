const mongoose = require("mongoose");

const blackListSchema = new mongoose.Schema(
  {
    token: {
      type: String
    }
  },
  {
    versionKey: false,
  }
);

const BlackListModel = mongoose.model("blacklist", blackListSchema);

module.exports = {BlackListModel};
