import { put } from "@vercel/blob";
import { Elysia, t } from "elysia";

import User from "../lib/db/models/User";
import Echo from "../lib/db/models/Echo";

export default function router(app: Elysia) {
  return app.get("/list-echos", async (ctx) => {
    if (!ctx.headers.authorization) {
      ctx.set.status = 401;
      return {
        error: "Unauthorized",
      };
    }

    const bearer = ctx.headers.authorization.split(" ")[1];

    const user = await User.findOne({
      auth0Id: bearer,
    });

    if (!user) {
      ctx.set.status = 401;
      return {
        error: "Unauthorized",
      };
    }

    const echos = await Echo.find({
      owner: user._id,
    }).sort({ createdAt: -1 });

    return {
      echos,
    };
  });
}
