import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { makeExecutableSchema } from "graphql-tools";
import schema from "./schema";
import resolver from "./resolver";
import { SchemaLink } from "apollo-link-schema";

const createApolloClient = (context: any) => {
  const client = new ApolloClient({
    ssrMode: true,
    link: new SchemaLink({
      context,
      schema: makeExecutableSchema({
        typeDefs: schema,
        resolvers: resolver
      })
    }),
    cache: new InMemoryCache()
  });
  return client;
};

export default createApolloClient;
