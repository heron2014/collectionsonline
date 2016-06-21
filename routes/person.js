const fs = require('fs');
const Boom = require('boom');
const exampleData = JSON.parse(fs.readFileSync('./src/data/person.json'));
const buildJSONResponse = require('../lib/jsonapi-response');

module.exports = ({ elastic }) => ({
  method: 'GET',
  path: '/person/{id}/{slug?}',
  handler: (request, reply) => reply(),
  config: {
    plugins: {
      'hapi-negotiator': {
        mediaTypes: {
          'text/html' (request, reply) {
            const data = {
              page: 'person',
              title: 'Charles Babbage'
            };

            reply.view('person', Object.assign(exampleData, data));
          },
          'application/vnd.api+json' (req, reply) {
            elastic.get({index: 'smg', type: 'agent', id: req.params.id}, (err, result) => {
              if (err) {
                return reply(err);
              }

              if (!result) {
                return reply(Boom.notFound('Document not found'));
              }

              reply(buildJSONResponse(result)).header('content-type', 'application/vnd.api+json');
            });
          }
        }
      }
    }
  }
});
