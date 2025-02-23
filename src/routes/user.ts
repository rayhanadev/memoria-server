import { put } from "@vercel/blob";
import { Elysia, t } from "elysia";
import { Groq } from "groq-sdk";

import { env } from "../env";
import User from "../lib/db/models/User";
import Echo from "../lib/db/models/Echo";

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

export default function router(app: Elysia) {
  return app
    .get("/list-echos", async (ctx) => {
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

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const echos = await Echo.find({
        owner: user._id,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }).sort({ createdAt: -1 });

      return {
        echos,
      };
    })
    .get("/summary", async (ctx) => {
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

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const echos = await Echo.find({
        owner: user._id,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }).sort({ createdAt: -1 });

      let corpus = "";

      for (const echo of echos) {
        corpus += `[${echo.createdAt.toUTCString()}]\n${echo.transcription}\n\n`;
      }

      const response = await groq.chat.completions.create({
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "system",
            content:
              "You are an AI model tasked with summarizing the user's day. You must only provide a summary of the user's day, and no additional commentary.",
          },
          {
            role: "user",
            content: `Given the following text, output JSON that contains two keys: "mood" describing the user's mood in one word, and "repeat" which is an item or event the user references the most this day.`,
          },
          {
            role: "system",
            content: "```json",
          },
        ],
        stop: ["```"],
        response_format: { type: "json_object" },
      });

      return {
        summary: response.choices[0].message.content,
      };
    });
}
