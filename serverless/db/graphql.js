import { graphql } from 'graphql';
import Schema from './schema';

export default (event, cb) => {
  const { query, variables } = event.body;
  graphql(Schema, query, null, {}, variables)
  .then(res => cb(null, res))
  .catch(cb);
};
/*
graphql(
  schema: GraphQLSchema,
  requestString: string,
  rootValue?: ?any,
  contextValue?: ?any,
  variableValues?: ?{[key: string]: any},
  operationName?: ?string
): Promise<GraphQLResult>
*/