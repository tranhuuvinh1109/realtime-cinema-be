import { GraphQLScalarType } from 'graphql';
import { AuthorModel, MovieModel, NotificationModel } from '../models/index.js';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

export const resolvers = {
	Date: new GraphQLScalarType({
		name: 'Date',
		parseValue (value) {
			return new Date(value);
		},
		serialize (value) {
			return value.toISOString();
		},
	}),
	Query: {
		movies: async (parent, args) => {
			const movies = await MovieModel.find().sort({
				updatedAt: 'desc',
			});
			console.log({ movies });
			return movies;
		},
		movie: async (parent, args) => {
			const movieId = args.movieId;
			console.log({ movieId });
			const foundMovie = await MovieModel.findById(movieId);
			return foundMovie;
		},
		author: async (parent, args) => {
			const authorId = args.authorId;
			console.log('query author', { authorId })
			const foundAuthor = await AuthorModel.findById(authorId);
			return foundAuthor
		}
	},
	Movie: {
		author: async (parent, args) => {
			console.log('author', { parent })
			const authorId = parent.authorId;
			const author = await AuthorModel.findById(authorId);
			return author;
		},
	},
	Mutation: {
		addAuthor: async (parent, args) => {
			console.log('add- auth=>>', { args })
			const newAuthor = new AuthorModel(args);
			console.log('new author --->>', { newAuthor })
			await newAuthor.save();
			return newAuthor
		},
		addMovie: async (parent, args) => {
			console.log('addmovie=>>', { args })
			const newMovie = new MovieModel(args);
			console.log({ newMovie })
			pubsub.publish('MOVIE_CREATED', {
				movieCreated: {
					message: 'A new Movie created',
				},
			});
			await newMovie.save();
			return newMovie;
		},
		pushNotification: async (parent, args) => {
			const newNotification = new NotificationModel(args);

			pubsub.publish('PUSH_NOTIFICATION', {
				notification: {
					message: args.content,
				},
			});

			await newNotification.save();
			return { message: 'SUCCESS' }
		}
	},
	Subscription: {
		movieCreated: {
			subscribe: () => pubsub.asyncIterator(['MOVIE_CREATED']),
		},
		notification: {
			subscribe: () => pubsub.asyncIterator(['PUSH_NOTIFICATION'])
		}
	},
};
