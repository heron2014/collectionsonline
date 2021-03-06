const fs = require('fs');
const exampleData = JSON.parse(fs.readFileSync('./src/data/archivedoc.json'));

module.exports = () => ({
  method: 'GET',
  path: '/archivedoc/{id?}',
  handler: (request, reply) => reply(),
  config: {
    plugins: {
      'hapi-negotiator': {
        mediaTypes: {
          'text/html' (request, reply) {
            const data = {
              page: 'archivedoc',
              title: 'End view of inking printing paper and stereotyping apparatus. Tracing of BAB A/172'
            };

            reply.view('archivedoc', Object.assign(exampleData, data));
          },
          'application/vnd.api+json' (req, reply) {
            reply('"{"response": "JSONAPI"}"').header('content-type', 'application/vnd.api+json');
          }
        }
      }
    }
  }
});
