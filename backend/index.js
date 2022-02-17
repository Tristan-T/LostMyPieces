//Loading config file
const fs = require('fs');
let config;
try {
  config = JSON.parse(fs.readFileSync('../config.json'));
} catch (err) {
  console.log(err);
}

// Importing and instantiating Fastify
const app = require('fastify')({logger: true})

/********************************************
              Connecting to neo4j
*********************************************/
//TODO : Utiliser un fichier de config
const neo4j = require('neo4j-driver')
const driver = neo4j.driver(config.database.uri, neo4j.auth.basic(config.database.user, config.database.password))
// TODO : Session n'est pas thread safe
// TODO : Pool session
const session = driver.session()

app.decorateRequest('neoSession', null)

app.addHook('preHandler', async (req, reply) => {
  console.log("Pre-handler");
  req.neoSession = session;
})

const routes = require('./routes.js')
routes.forEach((route, index) => {
    console.log(route);
    app.route(route)
})

app.listen(3000, '::', (err, address) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
    app.log.info(`Server listening on ${address}`)
})
