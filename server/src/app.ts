import express from "express";
import apiRouter from "./router";

const app = express();

app.use(express.json());

app.use("/api", apiRouter);

app.use((_, res) => {
  res.status(404).send();
});

export default app;
