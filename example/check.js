const checkOptions = require('../index');

const PostgresConfigSchema = {
    host: [
        /^host|address|url$/, 
        process.env.PGHOST || 'localhost'
    ],
    user: [
        /^user$/, 
        process.env.PGUSER || 'postgres'
    ],
    port: [
        /^port$/, 
        process.env.PGPORT || '5432'
    ],
    password: [
        /^pass(word)?$/, 
        process.env.PGPASSWORD
    ],
    database: [
        /^((db|database)(name)?|name)$/, 
        process.env.PGDATABASE || 'postgres'
    ],
    idleTimeoutMillis: [/^((db|database)idletimeout(millis)?)$/, 1000],
    extensions: [/^extension(s)?$/, undefined, ['nonEmptyString', 'nonEmptyArray']],
    innerTest: {
        inner: 'inner'
    }
}

console.log(checkOptions({ extensions: [ 'test' ], innerTest: { inner: 1 },  innerTest2: { inner: 1 } }, PostgresConfigSchema));
console.log(checkOptions({ extensions: [ 'test' ], innerTest: { inner: 1 },  innerTest2: { inner: 1 } }, PostgresConfigSchema, true));