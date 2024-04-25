/** @type{import('fastify').FastifyPluginAsync<>} */

import animals from './animals.js';

export default async function categories(app, options) {

    const categories = app.mongo.db.collection('categories');
    const animals = app.mongo.db.collection('animals');

    app.get('/categories', 
        {   
            //para exigir autenticação
            config: {
                logMe: true,
                requireAuthentication: true
            }
        }, 
        async (request, reply) => {
            request.log.info(categories);
        return await categories.find().toArray();
    });

    app.post('/categories', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    img_url: {type: 'string'}
                },
                required: ['name', 'img_url']
            }
        },config:{
            requireAuthentication: true,
            checkAdmin: true
        }
    }, async (request, reply) => {
        let category = request.body;
        let result = await categories.insertOne(category);
        request.log.info(`Including category ${category.name}.`);
        return reply.code(201).send();
    });

    app.get('/categories/:id/animals', async (request, reply) => {
        let id = request.params.id;
        let category = await categories.findOne({_id: new app.mongo.ObjectId(id)});
        let categoryName = category.name;
        let animalsCategory = await animals.find({category: categoryName}).toArray();
        return animalsCategory; 
    });

    app.get('/categories/:id', async (request, reply) => {
        let id = request.params.id;
        let category = await categories.findOne({_id: new app.mongo.ObjectId(id)});
        return category;
    });

    app.delete('/categories/:id',{
        config:{
            requireAuthentication: true
        }}, async (request, reply) => {
        let id = request.params.id;
        await categories.deleteOne({_id: new app.mongo.ObjectId(id)});
        return reply.code(204).send();
    });
    

    app.put('/categories/:id', {
        config:{
            requireAuthentication: true
        }
    }, async (request,reply) => {
        let id = request.params.id;
        let category = request.body;

        await categories.updateOne({_id: new app.mongo.ObjectId(id)}, {
            $set:{
                name:category.name,
                img_url:category.img_url
            }
        });

        return reply.code(204).send();
    });

};
