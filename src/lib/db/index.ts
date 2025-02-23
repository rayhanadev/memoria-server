import mongoose from "mongoose";

import { env } from "../../env";

await mongoose.connect(env.MONGODB_URI);

export { mongoose };
