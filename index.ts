import "dotenv/config";
import app from "./src/app";

const PORT = Number(process.env.PORT) || 8000;

async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`server is listening on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
