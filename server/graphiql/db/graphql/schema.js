import {
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql';
import ProductTypes from './types/productTypes';
import UserTypes from './types/userTypes';

const query = new GraphQLObjectType({
  name: 'RootQueryType',
  description: 'The primary query object.',
  fields: () => ({
    FindProductById: ProductTypes.queries.FindProductById,
    PopularProducts: ProductTypes.queries.PopularProducts,
  }),
});

const mutation = new GraphQLObjectType({
  name: 'RootMutationType',
  description: 'The primary mutation object.',
  fields: () => ({
    LoginOrCreateUser: UserTypes.mutations.LoginOrCreateUser,
    AddToMemberCart: UserTypes.mutations.AddToMemberCart,
    UpdateToMemberCart: UserTypes.mutations.UpdateToMemberCart,
    CreateProduct: ProductTypes.mutations.CreateProduct,
    FindProductAndUpdate: ProductTypes.mutations.FindProductAndUpdate,
    FindProductByIdAndDelete: ProductTypes.mutations.FindProductByIdAndDelete,
  }),
});

export default new GraphQLSchema({
  query,
  mutation,
});
