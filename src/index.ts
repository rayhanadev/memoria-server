import Elysia from "elysia";

import upload from "./routes/upload";
import user from "./routes/user";

const app = new Elysia();

app.group("/upload", upload);
app.group("/user", user);

app.get("/", (ctx) => {
  return {
    message: "Hello, World!",
  };
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
