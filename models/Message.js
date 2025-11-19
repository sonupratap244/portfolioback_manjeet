import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  meetingDate: { type: String },
  meetingTime: { type: String },
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;
