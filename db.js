import pg from 'pg'

const Pool = pg.Pool;
export const db = new Pool({
    user: "postgres",
    password: "root",
    host: "localhost",
    port: 5432,
    database: "node_postgres"
})