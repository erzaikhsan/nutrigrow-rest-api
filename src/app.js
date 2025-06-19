const { port } = require("./config");
const logger = require("./utils/logger");
const app = require("./server");

function startServer() {
  return app.listen(port, async () => {
    try {
      logger.info(`Server is listening on port ${port}`);
    } catch (err) {
      logger.error(`Cannot start server, error: ${err.message}`);
      process.exit(1);
    }
  });
}

startServer();
