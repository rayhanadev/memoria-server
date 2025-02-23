import { Schema } from "mongoose";

import { mongoose } from "../";

export const userSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    auth0Id: {
      type: String,
      required: true,
    },
    picture: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: Date,
  },
  {
    virtuals: {
      full_name: {
        get() {
          return `${this.firstName} ${this.lastName}`;
        },
      },
    },
  },
);

const User = mongoose.model("User", userSchema);
export default User;
