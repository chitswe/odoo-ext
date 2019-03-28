import { ApolloServer } from "apollo-server-express";
import schema from "./schema";
import resolver from "./resolver";

const server = new ApolloServer({
  typeDefs: schema,
  resolvers: resolver,
  context: async (options: any) => {
    return options.req.user;
  },
  introspection: true,
  playground: true,
  uploads: false
});

export default server;
