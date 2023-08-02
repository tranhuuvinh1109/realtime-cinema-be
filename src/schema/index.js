export const typeDefs = `#graphql
  scalar Date

  type Movie {
    id: String!,
    name: String,
    createdAt: String,
    author: Author
  }

  type Author {
		id: String!,
    name: String!
  }

  type Query {
    movies: [Movie],
    movie(movieId: String!): Movie,
		author(authorId: String!): Author
  }

  type Mutation {
		addAuthor(name: String!): Author,
    addMovie(name: String!, authorId: String!): Movie,
    pushNotification(content: String): Message
  }

  type Message {
    message: String
  }

  type Subscription {
    movieCreated: Message
    notification: Message
  }
`;
