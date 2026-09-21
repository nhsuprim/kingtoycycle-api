// import app from "./app";
// import { env } from "./app/config/env";
// import { connectDatabase, disconnectDatabase } from "./app/config/db";

// async function bootstrap() {
//     try {
//         await connectDatabase();

//         const server = app.listen(env.port, () => {
//             // eslint-disable-next-line no-console
//             console.log(
//                 `🚀 Server running on http://localhost:${env.port} [${env.nodeEnv}]`,
//             );
//         });

//         const shutdown = async (signal: string) => {
//             // eslint-disable-next-line no-console
//             console.log(`\n${signal} received. Shutting down gracefully...`);
//             server.close(async () => {
//                 await disconnectDatabase();
//                 process.exit(0);
//             });
//         };

//         process.on("SIGINT", () => shutdown("SIGINT"));
//         process.on("SIGTERM", () => shutdown("SIGTERM"));
//     } catch (err) {
//         // eslint-disable-next-line no-console
//         console.error("❌ Failed to start server:", err);
//         process.exit(1);
//     }
// }

// bootstrap();
import app from "./app";

const port = 5000;

async function main() {
    const server = app.listen(port, () => {
        console.log("App is running at", port);
    });
}

main();
