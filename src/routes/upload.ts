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
  return app.post(
    "/",
    async (ctx) => {
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

      const audioFile = ctx.body.audio;

      if (!audioFile || !(audioFile instanceof File)) {
        ctx.set.status = 400;
        return {
          error: "Bad Request",
        };
      }

      const audioBuffer = await audioFile.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: audioFile.type });

      const transcription = await groq.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-large-v3",
        response_format: "text",
      });

      const audioUrl = await put(
        `${user._id}/${new Date().toISOString()}`,
        audioBlob,
        { access: "public" },
      );

      const echo = new Echo({
        url: audioUrl.downloadUrl,
        owner: user._id,
        transcription,
      });

      await echo.save();

      return {
        echo,
      };
    },
    {
      body: t.Object({
        audio: t.File({ format: "audio/*" }),
      }),
    },
  );
}
