import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
const PORT = Number(process.env.PORT) || 5000;
const start = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });
};
start().catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map