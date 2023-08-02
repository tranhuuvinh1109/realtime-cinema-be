import express from 'express';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import bodyParser from 'body-parser';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import mongoose from 'mongoose';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

import { resolvers } from './resolvers/index.js';
import { typeDefs } from './schema/index.js';


const app = express();
const httpServer = http.createServer(app);

// Connect to DB
const MONGOOSE_URI = 'mongodb+srv://tranhuuvinh1109:vinh1109@cluster0.fg9i8xq.mongodb.net/grapql'
const PORT = process.env.PORT || 4000;

const schema = makeExecutableSchema({ typeDefs, resolvers });

// Creating the WebSocket server
const wsServer = new WebSocketServer({
	server: httpServer,
	path: '/graphql',
});

const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
	// typeDefs,
	// resolvers,
	schema,
	plugins: [
		ApolloServerPluginDrainHttpServer({ httpServer }), // Proper shutdown for the WebSocket server.
		{
			async serverWillStart () {
				return {
					async drainServer () {
						await serverCleanup.dispose();
					},
				};
			},
		},
	],
});

await server.start();


app.use('/graphql', cors(), bodyParser.json(), expressMiddleware(server));

mongoose.set('strictQuery', false);
mongoose
	.connect(MONGOOSE_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(async () => {
		console.log('Connected to DB');
		await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
		console.log('🚀 Server ready at http://localhost:4000/graphql');
	});
