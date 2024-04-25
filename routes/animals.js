/** @type{import('fastify').FastifyPluginAsync<>} */
import createError from '@fastify/error';
import { config } from 'dotenv';
export default async function animals(app, options) {

    const animals = app.mongo.db.collection('animals');

    app.get('/animals', 
        {
            config: {
                logMe: true,
                requireAuthentication: true
            }
        }, 
        async (request, reply) => {
        return await animals.find().toArray();
    });

    app.post('/animals', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    species: { type: 'integer' },
                    age: { type: 'integer' }
                },
                required: ['name', 'species', 'age']
            }
        },config:{
            requireAuthentication: true
        }
    }, async (request, reply) => {
        let animal = request.body;

        let result = await animals.insertOne(animal);

        return reply.code(201).send();
    });


    app.get('/animals/:id', async (request, reply) => {
        let id = request.params.id;
        let animal = await animals.findOne({_id: new app.mongo.ObjectId(id)});
        return animal;
    });
    
    app.delete('/animals/:id',{
        config:{
            requireAuthentication: true
        }
        }, async (request, reply) => {
        let id = request.params.id;
        await animals.deleteOne({_id: new app.mongo.ObjectId(id)});
        return reply.code(204).send();
    });

    app.put('/animals/:id', {
        config:{
            requireAuthentication: true
        }
    }, async (request,reply) => {
        let id = request.params.id;
        let animal = request.body;

        await animals.updateOne({_id: new app.mongo.ObjectId(id)}, {
            $set:{
                name:animal.name,
                qtd: animal.qtd,
                category: animal.category
            }
        });

        return reply.code(204).send();
    });
}