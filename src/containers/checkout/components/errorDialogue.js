import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import { withHandlers } from 'recompose';

function NetworkStatus({ routerPush, errors, renderHelper }) {
  return (
    <div>
      <div className="checkout__error-dialogue">
        <p>
          <FontAwesome className="error-icon" name="times-circle" />
          <span className="error-title">ERROR: </span>
          There was an error placing your order: Credit card information was invalid.
        </p>
      </div>
      <div className="checkout__loading-icon">
        <FontAwesome className="spinner-icon" name="spinner" spin />
        <p>One moment please</p>
        <p>while we process your order...</p>
      </div>
      <div className="checkout__back-home-btn ">
        <button
          className="sweep-right"
          data-slug="/"
          onClick={routerPush}
        >
          Back To Homepage
        </button>
      </div>
    </div>
  );
}
const { shape, string, bool, func } = PropTypes;
NetworkStatus.propTypes = {
  errors: shape({
    hard: bool,
    soft: bool,
    messages: string,
  }).isRequired,
  loading: bool,
  renderHelper: func.isRequired,
};
NetworkStatus.defaultProps = {
  loading: false,
};

const NetworkStatusWithHandlers = () => withHandlers({
  renderHelper: ({ errors, loading }) => {
    const { hard, soft, message } = errors;
    const showError = !!hard || !!soft || !!message.length;

    const hardError = (
      <p>
        <FontAwesome className="error-icon" name="times-circle" />
        <span className="error-title">ERROR: </span>
        {message}
      </p>
    );

    const softError = (
      <p>
        <FontAwesome className="caution-icon" name="exclamation-triangle" />
        <span className="alert-title">Caution: </span>
        {message}
      </p>
    );

    const loadingMsg = (
      <div className="checkout__loading-icon">
        <FontAwesome className="spinner-icon" name="spinner" spin />
        <p>One moment please</p>
        <p>while we process your order...</p>
      </div>
    );

    const success = (
      <div className="checkout__successful-purchase">
        <FontAwesome name="check-circle" />
        <p>{'You\'ve'} successfully submitted your order!</p>
      </div>
    );

    if (showError && hard) return hardError;
    if (showError && soft) return softError;
    if (!showError && loading) return loadingMsg;
    if (!showError && success) return loadingMsg;
    return '';
  },
})(NetworkStatus);

export default NetworkStatusWithHandlers;
