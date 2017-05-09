import Promise from 'bluebird';
import {
  GraphQLInt as IntType,
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import ProductTypes from './types/productTypes';
import UserTypes from './types/userTypes';
import ProductModel from '../mongo/product';
import UserModel from '../mongo/user';

const query = new ObjectType({
  name: 'RootQueryType',
  description: 'The primary query object type.',
  fields: {
    popularProducts: {
      type: ProductTypes.rootType,
      args: {
        qty: {
          type: IntType,
          description: 'The quantity of popular products to return.',
        },
      },
      resolve: (_, args) => {
        console.log('2) popularProducts');
        Promise.fromCallback(cb => ProductModel.getPopularProducts(args, cb));
      },
    },
  },
});

const mutation = new ObjectType({
  name: 'RootMutationType',
  fields: {
    createUser: {
      type: UserTypes.rootType,
      description: 'Create new user.',
      args: UserTypes.mutation.createUser.args,
      resolve: (_, args) => Promise.fromCallback(cb => UserModel.createUser(args, cb)),
    },
  },
});

export default new Schema({
  query,
  mutation,
});