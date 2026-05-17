import app from "./app.js";
import config from "./config/index.js";
import { initDB } from "./db/index.js";

const port: number = config.port || 3000;

const main = () => {
    initDB();
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    })
}
main();