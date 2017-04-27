import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import NavbarOptions from './navbar_web_options/navbarOptions';
import NavbarUserActions from './navbar_web_userActions/navbarUserActions';
import NavbarCart from './navbar_web_cart/navbarCart';
import localeActions from '../../../../redux/locale';
import NavbarOptionsLanguage from './navbar_web_options/navbar_web_options_language/navbarOptions_language';

class NavbarUpper extends Component {
  static propTypes = {
    activeLanguage: PropTypes.string.isRequired,
    saveLanguage: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);

    this.state = {
      activeLanguage: props.activeLanguage,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.setState({ activeLanguage: nextProps.activeLanguage });
    }
  }

  onLanguageChange = (language) => {
    this.props.saveLanguage(language);
    this.setState({ activeLanguage: language });
  }

  render() {
    return (
      <div className="navbar-actionSection-upper">
        <NavbarOptions>
          <NavbarOptionsLanguage
            onLanguageChange={this.onLanguageChange}
            activeLanguage={this.props.activeLanguage}
          />
        </NavbarOptions>
        <NavbarUserActions />
        <NavbarCart />
      </div>
    );
  }
}

export default connect(
({ locale }) => ({
  activeLanguage: locale.activeLanguage,
}),
dispatch => ({
  saveLanguage: language => dispatch(localeActions.setLanguage(language)),
}),
)(NavbarUpper);
/* Nested Component Map:
  1. NavbarOptions = func
  2. NavbarUserActions == func
  3. NavbarCart = func
*/
