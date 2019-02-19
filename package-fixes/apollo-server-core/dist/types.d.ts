import { GraphQLSchema, DocumentNode } from 'graphql';
import { SchemaDirectiveVisitor, IResolvers, IMocks } from 'graphql-tools';
import { ConnectionContext } from 'subscriptions-transport-ws';
import * as WebSocket from 'ws';
import { GraphQLExtension } from 'graphql-extensions';
export { GraphQLExtension } from 'graphql-extensions';
import { EngineReportingOptions } from 'apollo-engine-reporting';
import { PlaygroundConfig } from './playground';
export { PlaygroundConfig, PlaygroundRenderPageOptions } from './playground';
import { GraphQLServerOptions as GraphQLOptions, PersistedQueryOptions } from './graphqlOptions';
import { CacheControlExtensionOptions } from 'apollo-cache-control';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { GraphQLSchemaModule } from '@apollographql/apollo-tools';
export { GraphQLSchemaModule };
export { KeyValueCache } from 'apollo-server-caching';
export declare type Context<T = any> = T;
export declare type ContextFunction<T = any> = (context: Context<T>) => Promise<Context<T>>;
export declare type PluginDefinition = ApolloServerPlugin | (() => ApolloServerPlugin);
export interface SubscriptionServerOptions {
    path: string;
    keepAlive?: number;
    onConnect?: (connectionParams: Object, websocket: WebSocket, context: ConnectionContext) => any;
    onDisconnect?: (websocket: WebSocket, context: ConnectionContext) => any;
}
export interface Config extends Pick<GraphQLOptions<Context<any>>, 'formatError' | 'debug' | 'rootValue' | 'validationRules' | 'formatResponse' | 'fieldResolver' | 'tracing' | 'dataSources' | 'cache'> {
    modules?: GraphQLSchemaModule[];
    typeDefs?: DocumentNode | Array<DocumentNode>;
    resolvers?: IResolvers;
    schema?: GraphQLSchema;
    schemaDirectives?: Record<string, typeof SchemaDirectiveVisitor>;
    context?: Context<any> | ContextFunction<any>;
    introspection?: boolean;
    mocks?: boolean | IMocks;
    mockEntireSchema?: boolean;
    engine?: boolean | EngineReportingOptions<Context<any>>;
    extensions?: Array<() => GraphQLExtension>;
    cacheControl?: CacheControlExtensionOptions | boolean;
    plugins?: PluginDefinition[];
    persistedQueries?: PersistedQueryOptions | false;
    subscriptions?: Partial<SubscriptionServerOptions> | string | false;
    uploads?: boolean | FileUploadOptions;
    playground?: PlaygroundConfig;
}
export interface FileUploadOptions {
    maxFieldSize?: number;
    maxFileSize?: number;
    maxFiles?: number;
}
//# sourceMappingURL=types.d.ts.map