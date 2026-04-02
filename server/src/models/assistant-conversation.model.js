const mongoose = require("mongoose");

const assistantMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [4000, "Assistant message cannot exceed 4000 characters."],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
    versionKey: false,
  }
);

const assistantConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    messages: {
      type: [assistantMessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const AssistantConversation = mongoose.model(
  "AssistantConversation",
  assistantConversationSchema
);

module.exports = AssistantConversation;
