const Schema = require('mongoose').Schema;

const ObjectId = Schema.Types.ObjectId;
const transactionSchema = new Schema({
  error: {
    hard: {
      type: Boolean,
      default: false,
    },
    soft: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: '',
    },
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  user: { type: ObjectId, ref: 'User' },
  products: [{
    id: { type: ObjectId, ref: 'Product' },
    qty: { type: Number, required: true },
  }],
  sagawa: { type: ObjectId, ref: 'Sagawa' },
  marketHero: { type: ObjectId, ref: 'MarketHero' },
  invoiceEmail: { type: ObjectId, ref: 'Email' },
  taxes: {
    city: { type: Number, required: true },
    state: { type: Number, required: true },
    total: { type: String, required: true },
  },
  total: {
    subtotal: { type: String, required: true },
    tax: { type: Number, required: true },
    discount: {
      qty: { type: Boolean, default: false },
      qtyAmount: { type: String, default: '' },
      register: { type: Boolean, default: false },
      registerAmount: { type: String, default: '' },
    },
    grandTotal: { type: String, required: true },
  },
  square: {
    locationId: { type: String, default: '' },
    transactionId: { type: String, default: '' },
    billingAddres: {
      billingCountry: { type: String, required: true },
      billingPrefecture: { type: String, required: true },
      billingCity: { type: String, required: true },
    },
    cardInfo: {
      last4: { type: String },
      expiration: { type: String, required: true },
      cardNonce: { type: String, default: '' },
      nameOnCard: { type: String, required: true },
    },
    charge: {
      amount: { type: Number, required: true },
      currency: { type: String },
    },
  },
});
export default transactionSchema;
