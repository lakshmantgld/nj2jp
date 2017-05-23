/* eslint-disable no-lone-blocks, import/first*/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { graphql, compose } from 'react-apollo';
import _ from 'lodash';
import orderActions from '../../../../../redux/orders/';
import FindProductById from '../graphql/queries';
import { AddToMemberCart, UpdateToMemberCart } from '../graphql/mutations';

import {
  MainTitle,
  BreadCrumb,
  ActionBtns,
  SuccessModal,
  BulkSaleModal,
  RegisterModal,
  ProductDisplay,
} from './imports';

const {
  func,
  number,
  bool,
  string,
  shape,
  arrayOf,
  any,
} = PropTypes;

class SingleProduct extends Component {
  static propTypes = {
    push: func.isRequired,
    userId: string,
    taxRate: number.isRequired,
    productId: string.isRequired,
    loggedIn: bool.isRequired,
    addToGuestCart: func.isRequired,
    addToMemberCart: func.isRequired,
    updateToGuestCart: func.isRequired,
    updateToMemberCart: func.isRequired,
    cart: arrayOf(
      shape({
        id: string,
        qty: number,
        sku: string,
        title: string,
        price: string,
        flavor: string,
        strength: number,
        mainTitle: string,
        sizes: arrayOf(string),
        nicotine_strengths: arrayOf(string),
        routeTag: string,
        vendor: string,
        blurb: string,
        images: arrayOf(
          shape({
            purpose: string,
            url: string,
          }),
        ),
        quantities: shape({
          available: string,
          in_cart: string,
        }),
      }),
    ),
    data: shape({
      FindProductById: shape({
        _id: string,
        product: shape({
          qty: number,
          price: string,
          title: string,
          routeTag: string,
          strength: number,
          mainTitle: string,
          nicotine_strengths: arrayOf(string),
          images: arrayOf(shape({
            purpose: string,
            url: string,
          })),
          quantities: shape({
            available: number,
            in_cart: number,
          }),
        }),
      }),
    }).isRequired,
  }
  static defaultProps = {
    userId: '',
    cart: null,
  }
  constructor(props) {
    super(props);
    this.state = {
      qty: 0,
      error: false,
      product: null,
      errorMsg: '',
      showBulkModal: false,
      chosenStrength: 0,
      showSuccessModal: false,
      showRegisterModal: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps, this.props)) {
      const { loggedIn } = nextProps;
      this.setState(() => ({ loggedIn }));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!_.isEqual(nextState, this.state) || !_.isEqual(nextProps, this.props)) return true;
    return false;
  }

  modalHandler = (e) => {
    let parentEl = e.target.dataset.parent;
    let tagEl = e.target.dataset.tag;
    if (!parentEl) {
      parentEl = e.target.parentNode.dataset.parent;
    }
    if (!tagEl) {
      tagEl = e.target.parentNode.dataset.tag;
    }

    switch (parentEl) {
      case 'success': {
        switch (tagEl) {
          case 'view-cart':
            this.toggleModalAndGo('showSuccessModal', '/cart'); break;
          case 'view-checkout':
            this.toggleModalAndGo('showSuccessModal', '/express_checkout'); break;
          default: this.toggleModal('showSuccessModal');
        }
      } break;
      case 'promotion-bulk': {
        switch (tagEl) {
          case 'view-juices':
            this.toggleModalAndGo('showBulkModal', '/juices'); break;
          default: this.toggleModal('showBulkModal');
        }
      } break;
      case 'promotion-register': {
        switch (tagEl) {
          case 'view-signup':
            this.toggleModalAndGo('showRegisterModal', '/login'); break;
          default: this.toggleModal('showRegisterModal');
        }
      } break;
      default: this.toggleModal();
    }
  }

  toggleModalAndGo = (modal, location) => {
    this.setState(prevState => ({
      [modal]: !prevState[modal],
    }), () => this.props.push(location));
  }

  toggleModal = (modal) => {
    this.setState(prevState => ({ [modal]: !prevState[modal] }));
  }

  qtyHandler = (e) => {
    let buttonEl = e.target.dataset.tag;
    if (!buttonEl) {
      buttonEl = e.target.parentNode.dataset.tag;
    }

    if (buttonEl === 'qty-plus') {
      if (this.state.qty <= 3) {
        this.setState(prevState => ({
          ...prevState,
          error: false,
          errorMsg: '',
          qty: (prevState.qty += 1),
        }));
      } else {
        this.setState(prevState => ({
          ...prevState,
          error: true,
          errorMsg: 'Too much',
        }));
      }
    } else if (buttonEl === 'qty-minus') {
      const { qty } = this.state;
      if (qty >= 1 && qty <= 4) {
        this.setState(prevState => ({
          ...prevState,
          error: false,
          errorMsg: '',
          qty: (prevState.qty -= 1),
        }));
      } else {
        this.setState(prevState => ({
          ...prevState,
          error: true,
          errorMsg: 'Not enough',
        }));
      }
    }
  }

  composeGlobalCartInfo = () => {
    const { loggedIn, cart } = this.props;
    const prevCartIds = [];
    let cartCustomerType = '';
    const globalQty = Object.keys(cart)
    .map((key) => {
      if (!cart[key].length) return ([{ qty: 0 }]);
      if (loggedIn && (key === 'member')) {
        cartCustomerType = 'member';
        return cart.member;
      }
      cartCustomerType = 'guest';
      return cart.guest;
    })
    .map(array =>
      array.reduce(a => ({ qty: a.qty, id: a.id })))
    .map(({ qty, id }) => {
      prevCartIds.push(id);
      return qty;
    })
    .reduce((a, b) => a + b);
    return ({
      prevCartIds,
      cartCustomerType,
      globalQty,
    });
  }

  addToCartHandler = () => {
    // console.log('%cthis.props.cart', 'background:cyan;', this.props.cart);

    // 1. If the total items in the cart (redux store) are >= 4, then throw error.
    // 2. If the total items in the cart are <4 than, verify the additional qty, will not exceed 4.  If so, throw an error.
    // 3.  If the items to be added + the total <= 4, then reduce like items, and dispatch.

    // if (this.props.cart.length) {
    //   console.info('Condition passed.')
    //   console.log('background:green;', this.props.cart.reduce((a, b) => a.qty + b.qty), 0);
    // }

    if (this.state.qty === 0) {
      this.setState(() => ({
        error: true,
        errorMsg: 'You must choose a quantity of at least 1.',
      }));
    } else if (!this.state.chosenStrength) {
      this.setState(() => ({
        error: true,
        errorMsg: 'No strength',
      }));
    } else {
      const {
        prevCartIds,
        cartCustomerType,
        globalQty,
      } = this.composeGlobalCartInfo();
      console.log('%cglobalQty', 'background:red;', globalQty);
      const {
        qty,
        chosenStrength: strength,
      } = this.state;
      const requestQty = qty;
      const totalRequestQty = requestQty + globalQty;
      const deltaQty = (totalRequestQty > 4) && (totalRequestQty - 4);
      if (globalQty === 4) {
        this.setState({
          error: true,
          errorMsg: 'You already have the maximum number of items in your cart.' });
      } else if (deltaQty > 0) {
        this.setState(() => ({
          error: true,
          errorMsg: `You have too many items in your cart.  Please remove ${deltaQty} items from your cart to add the requsted number of items.`,
        }));
      } else if (!deltaQty) {
        const { productId, cart } = this.props;
        const updatedCartProducts = prevCartIds
        .filter(id => id === productId)
        .map((id) => {
          let newProductObj;
          cart[cartCustomerType]
          .forEach((productObj) => {
            if (productObj.id === id) {
              productObj.qty += requestQty;
              newProductObj = Object.assign({}, productObj);
            }
          });
          return newProductObj;
        });
        if (cartCustomerType === 'member') {
          if (updatedCartProducts.length) {
            this.setState(() => ({
              error: false,
              errorMsg: '',
            }), () => {
              this.props.updateToMemberCart({
                qty,
                strength,
                userId: this.props.userId,
                id: this.props.productId,
                ...updatedCartProducts,
              });
            });
          } else {
            this.setState(() => ({
              error: false,
              errorMsg: '',
            }), () => {
              this.props.addToMemberCart({
                qty,
                strength,
                userId: this.props.userId,
                id: this.props.productId,
                ...this.props.data.FindProductById.product,
              });
            });
          }
        } else {
          if (updatedCartProducts.length) {
            this.setState(() => ({
              error: false,
              errorMsg: '',
            }), () => {
              this.props.updateToGuestCart({ ...updatedCartProducts });
            });
          }
          this.setState(() => ({
            error: false,
            errorMsg: '',
          }), () => {
            this.props.addToGuestCart({
              qty,
              strength,
              id: this.props.productId,
              ...this.props.data.FindProductById.product,
            });
          });
        }
      }
    }
  }

  nicotineHandler = (e) => {
    let nicEl = e.target.dataset.tag;
    if (!nicEl) {
      nicEl = e.target.parentNode.dataset.tag;
    }
    return this.setState(() => ({
      error: false,
      errorMsg: '',
      chosenStrength: Number(nicEl),
    }));
  }

  render() {
    const {
      qty,
      error,
      errorMsg,
      // product,
      showBulkModal,
      chosenStrength,
      showSuccessModal,
      showRegisterModal,
    } = this.state;

    const {
      data,
      taxRate,
      loggedIn,
    } = this.props;

    // if (this.state.errorQty) new Error(this.state.errorQty);

    return (
      <div className="juice-page__main">
        <BreadCrumb
          paths={['Home']}
          classes={['home']}
          destination={['']}
          lastCrumb="Juice Page"
        />
        {
          data.FindProductById ?
            <MainTitle
              vendor={data.FindProductById.product.vendor}
              mainTitle={data.FindProductById.product.mainTitle}
            /> : ''
        }
        {
          data.loading ? <h1>Loading ...</h1> :
          <ProductDisplay
            qty={qty}
            error={error}
            errorMsg={errorMsg}
            loggedIn={loggedIn}
            productObj={data.FindProductById ? data.FindProductById.product : null}
            qtyHandler={this.qtyHandler}
            chosenStrength={chosenStrength}
            modalHandler={this.modalHandler}
            nicotineHandler={this.nicotineHandler}
            addToCartHandler={this.addToCartHandler}
          />
        }
        <ActionBtns />

        <SuccessModal
          qty={qty}
          productTitle={data.FindProductById ? data.FindProductById.product.title : ''}
          showModal={showSuccessModal}
          modalHandler={this.modalHandler}
        />

        <BulkSaleModal
          taxRate={taxRate}
          showModal={showBulkModal}
          modalHandler={this.modalHandler}
        />

        <RegisterModal
          taxRate={taxRate}
          loggedIn={loggedIn}
          showModal={showRegisterModal}
          modalHandler={this.modalHandler}
        />
      </div>
    );
  }
}
const mapStateToProps = ({ orders, auth, routing, user: profile }) => ({
  cart: orders.cart,
  userId: profile ? profile.id : '',
  loggedIn: auth.loggedIn || false,
  taxRate: orders.taxRate.totalRate,
  productId: routing.locationBeforeTransitions.query.id,
});
const mapDispatchToProps = dispatch => ({
  push: location => dispatch(push(location)),

  addToGuestCart: productObj =>
  dispatch(orderActions.addToGuestCart(productObj)),

  updateToGuestCart: updatedCartProducts =>
  dispatch(orderActions.updateToGuestCart(updatedCartProducts)),

  // addToMemberCart: productObj => // convert to GraphQL mutation
  // dispatch(orderActions.addToMemberCart(productObj)),

  // updateToMemberCart: updatedCartProducts =>  // convert to GraphQL mutation
  // dispatch(orderActions.updateToMemberCart(updatedCartProducts)),
});
const SingleProductWithState = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SingleProduct);

const SingleProductWithStateAndData = compose(
  graphql(FindProductById, {
    options: ({ location }) => ({
      variables: {
        id: location.query.id,
      },
    }),
  }),
  graphql(AddToMemberCart, { name: 'addToMemberCart' }),
  graphql(UpdateToMemberCart, { name: 'updateToMemberCart' }),
)(SingleProductWithState);
export default SingleProductWithStateAndData;
