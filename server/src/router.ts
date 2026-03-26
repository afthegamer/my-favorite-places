import { Router } from "express";
import usersRouter from "./controllers/Users";
import addressesRouter from "./controllers/Addresses";

const apiRouter = Router();

apiRouter.get("/health", (_, res) => {
  res.send("ok");
});

apiRouter.use("/users", usersRouter);
apiRouter.use("/addresses", addressesRouter);

export default apiRouter;
