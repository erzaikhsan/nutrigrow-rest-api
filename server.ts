import { createApp } from "./src/app.js";

const app = createApp();

app.listen(Number(process.env.PORT ?? 3000));

export default app;
