const express = require('express');
const helpers = require('../helpers');
const Ajv = require("ajv");
const ajv = new Ajv();


module.exports = (db) => {

    const router = express.Router();

    router.use((req, res, next) => {
        if(
            req.method == "GET" ||
            (req.headers["content-type"] && req.headers["content-type"].startsWith("application/json"))
        )
            next();
        else
            res.status(415).json({status:"error", error:{message:"Unsupported Media Type"}});
    });

    router.use(express.json());





    //---------------- /TASKS (GET) ----------------\\

    router.get( '/tasks',
        helpers.query_validator_middleware(
            ajv.compile({
                type: "object",
                properties: {
                    status:         {type: "string", enum: ["in progress", "completed"]},
                    text:         {type: "string"},
                    page:           {type: "string", pattern: "^[0-9]+$"},
                    items_per_page: {type: "string", pattern: "^[1-9][0-9]*$"}
                },
                additionalProperties: true
            })
        ),
        async (req, res) => {
            //default values (hardcoded...)
            let limit = 10;
            let page = 0;

            if(req.query.items_per_page)
                limit = parseInt(req.query.items_per_page);

            if(req.query.page)
                page = parseInt(req.query.page);

            let query_conditions = [];
            let query_params = {};

            if(req.query.status) {
                query_conditions.push("status = $status");
                query_params.$status = req.query.status;
            }

            if(req.query.text) {
                query_conditions.push("text LIKE $search");
                query_params.$search = '%'+req.query.text+'%';
            }

            const result = await db.all(
                    'SELECT * FROM tasks ' +
                    (query_conditions.length ? 'WHERE '+query_conditions.join(' AND ') : '') +
                    ' LIMIT $limit OFFSET $offset',
                    {
                        $limit: limit,
                        $offset: limit * page,
                        ...query_params
                    }
                );

            const total = await db.get(
                    'SELECT COUNT(id) AS count FROM tasks ' +
                    (query_conditions.length ? 'WHERE '+query_conditions.join(' AND ') : ''),
                    query_params
                );

            res.json({
                status: "ok",
                data: result,
                meta: {
                    page: page,
                    items_per_page: limit,
                    total_items: total.count
                }
            });
        }
    );





    //---------------- /TASKS (POST) ----------------\\

    router.post('/tasks',
        helpers.body_validator_middleware(
            ajv.compile({
                type: "object",
                properties: {
                    text:   {type: "string"},
                    status: {type: "string", enum: ["in progress", "completed"]}
                },
                required: ["text", "status"],
                additionalProperties: false
            })
        ),
        async (req, res) => {
            const result = await db.run('INSERT INTO tasks(text, status) VALUES ($text, $status)', {
                    $text:   req.body.text,
                    $status: req.body.status
                });

            res
            .status(201)
            .location(req.baseUrl+"/posts/"+result.lastID)
            .json({
                status: "ok",
                data: {
                    task_id: result.lastID
                }
            });
        }
    );





    //---------------- /TASKS/:ID (GET) ----------------\\

    router.get('/tasks/:id',
        helpers.params_middleware({
            id: "integer"
        }),
        async (req, res) => {
            const result = await db.get('SELECT * FROM tasks WHERE id = $id', {
                    $id: req.params.id
                });

            if(result) {
                res.json({
                    status: "ok",
                    data: result
                });
            } else {
                res.status(404).json({status:"not_found"});
            }
        }
    );





    //---------------- /TASKS/:ID (PATCH) ----------------\\

    router.patch('/tasks/:id',
        helpers.params_middleware({
            id: "integer"
        }),
        helpers.body_validator_middleware(
            ajv.compile({
                type: "object",
                properties: {
                    id:         {type: "integer"},
                    text:       {type: "string"},
                    status:     {type: "string", enum: ["in progress", "completed"]},
                    created_at: {type: "string"},   //ignored
                    updated_at: {type: "string"}    //ignored
                },
                additionalProperties: false
            })
        ),
        async (req, res) => {

            if(req.body.id) {
                if(req.body.id != req.params.id) {
                    res.status(400).json({status:"error", error:{message:"Bad Request"}});
                    return;
                }
            } else {
                req.body.id = req.params.id;
            }

            let query_fields = [];
            let query_params = {
                $id: req.body.id
            };

            if(req.body.text) {
                query_fields.push('text = $text');
                query_params.$text = req.body.text;
            }

            if(req.body.status) {
                query_fields.push('status = $status');
                query_params.$status = req.body.status;
            }

            if(query_fields.length == 0) {
                res.json({
                    status: "ok"
                });
                return;
            }

            const result = await db.run('UPDATE tasks SET '+query_fields.join(', ')+' WHERE id = $id', query_params);

            if(result.changes > 0) {
                res.json({
                    status: "ok"
                });
            } else {
                res.status(404).json({status:"not_found"});
            }
            
        }
    );





    //---------------- /TASKS/:ID (DELETE) ----------------\\

    router.delete('/tasks/:id',
        helpers.params_middleware({
            id: "integer"
        }),
        async (req, res) => {
            const result = await db.run('DELETE FROM tasks WHERE id = $id', {
                    $id: req.params.id
                });

            if(result.changes > 0) {
                res.status(200).json({
                    status: "ok"
                });
            } else {
                res.status(404).json({status:"not_found"});
            }
            
        }
    );





    //---------------- UNSUPPORTED METHODS ----------------\\

    router.all( '/tasks',
        async (req, res) => {
            res.status(405).json({status:"error", error:{message:"Method Not Allowed"}});
        }
    );

    router.all( '/tasks/:id',
        async (req, res) => {
            res.status(405).json({status:"error", error:{message:"Method Not Allowed"}});
        }
    );

    return router;
};