import { Schema } from "mongoose";

import { mongoose } from "../";

export const echoSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  duration: Number,
  transcription: String,
  qotd: {
    type: Schema.Types.ObjectId,
    ref: "QOTD",
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
  archivedAt: Date,
  deletedAt: Date,
});

const Echo = mongoose.model("Echo", echoSchema);
export default Echo;
