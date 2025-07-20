const sqlite3 = require("sqlite3").verbose();
const sqlite = require("sqlite");
const fs = require("fs");

const DB_SCHEMA_PATH = process.env.DB_SCHEMA_PATH || "db/schema.sql";
const DB_FILE_PATH = "db/" + (process.env.DB_FILE_NAME || "tasks.db");


async function init() {
	let is_new_db = false;

	if(!fs.existsSync(DB_FILE_PATH)) {
		is_new_db = true;
	}


	let db = await sqlite.open({
    	filename: DB_FILE_PATH,
    	driver: sqlite3.Database
    });

	if(is_new_db) {
		try {
			const schemaSql = fs.readFileSync(DB_SCHEMA_PATH, {encoding: 'utf8', flag: 'r'});
			await db.run(schemaSql);
		}
		catch(err) {
			await db.close();

			try {
				fs.unlinkSync(DB_FILE_PATH);
			}
			catch(err) {
				console.error(err);
			}

			throw err;
		}
	}

	return db;
}

module.exports = {
	init
};