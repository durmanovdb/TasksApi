const express = require('express');
const tasks_routes = require('./tasks/routes');
const database = require('./database');

const port = process.env.PORT || 80;

(async () => {
    const db = await database.init();

    const app = express();

    app.use("/api/v1", tasks_routes(db));

    app.use((err, req, res, next) => {
        console.error(err);
        res.status(500).json({status:"error", error:{message:"Internal Server Error"}});
    })

    app.use((req, res, next) => {
        res.status(404).json({status:"error", error:{message:"Not Found"}});
    });

    let server = app.listen(port, (err) => {
        if(err) {
            console.error(err);

            db.close()
            .catch(console.error)
            .finally(() => {
                process.exit(1);
            })
        }
    });
    
    console.log("App listening on port", port);

    function exitHandler() {
        //console.log("exitHandler");
        Promise.all([
                db.close(),
                new Promise((resolve, reject) => {
                    server.close((err) => err ? reject(err) : resolve());
                })
            ])
        .catch((err) => {
            console.error(err);
            process.exit(1);
        })
        .then(() => {
            process.exit(0);
        });
    }

    process.on('SIGINT', exitHandler);
    process.on('SIGTERM', exitHandler);
})();

