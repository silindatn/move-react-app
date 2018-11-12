import React, { Component } from 'react';
import { Badge, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem, NavLink } from 'reactstrap';
import PropTypes from 'prop-types';

import { AppAsideToggler, AppHeaderDropdown, AppNavbarBrand, AppSidebarToggler } from '@coreui/react';
import logo from '../../assets/img/brand/move-vector.svg'
import sygnet from '../../assets/img/brand/image2vector.svg'

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};
let vm = null;

class DefaultHeader extends Component {
  constructor(props) {
    super(props)
    this.user = null;
    this.state = { error: null, errorInfo: null };
    vm = this;
  }
  componentDidCatch(error, info) {
    this.props.history.push('/login');
  }
  componentWillMount(){
    this.user = JSON.parse(sessionStorage.getItem('user'));
    if (this.user === null) {
      this.user = {
        "fullName": null,
            "id": null,
            "msisdn": null,
            "username": null,
            "firstName": null,
            "lastName": null,
            "status": null,
            "email": null,
            "branchId": null,
            "languageId": null,
      }
    }
  }
    componentDidMount(){
  }

  onLogout() {
    sessionStorage.clear();
    vm.props.history.push('/login');
  }
  render() {

    // eslint-disable-next-line
    const { children, ...attributes } = this.props;

    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        <AppNavbarBrand
          full={{ src: logo, width:200, height: 50, alt: 'Move Logo' }}
          minimized={{ src: sygnet, width: 30, height: 30, alt: 'Move Logo' }}
        />
        <AppSidebarToggler className="d-md-down-none" display="lg" />

        {/* <Nav className="d-md-down-none" navbar>
          <NavItem className="px-3">
            <NavLink href="#">Settings</NavLink>
          </NavItem>
        </Nav> */}
        <Nav className="ml-auto" navbar>
          {/* <NavItem className="d-md-down-none">
            <NavLink href="#"><i className="icon-bell"></i><Badge pill color="danger">5</Badge></NavLink>
          </NavItem>
          <NavItem className="d-md-down-none">
            <NavLink href="#"><i className="icon-list"></i></NavLink>
          </NavItem>
          <NavItem className="d-md-down-none">
            <NavLink href="#"><i className="icon-location-pin"></i></NavLink>
          </NavItem> */}
          <AppHeaderDropdown direction="down">
            <DropdownToggle nav>
              <h6>{this.user.fullName} <img src={'assets/img/avatars/download.png'} style={{width: 30,height: 30}} className="img-avatar" alt="User" /></h6>
            </DropdownToggle>
            <DropdownMenu right style={{ right: 'auto' }}>
              {/* <DropdownItem header tag="div" className="text-center"><strong>Account</strong></DropdownItem> */}
              {/* <DropdownItem><i className="fa fa-bell-o"></i> Updates<Badge color="info">42</Badge></DropdownItem> */}
              {/* <DropdownItem><i className="fa fa-envelope-o"></i> Messages<Badge color="success">42</Badge></DropdownItem> */}
              {/* <DropdownItem><i className="fa fa-tasks"></i> Tasks<Badge color="danger">42</Badge></DropdownItem> */}
              {/* <DropdownItem><i className="fa fa-comments"></i> Comments<Badge color="warning">42</Badge></DropdownItem> */}
              {/* <DropdownItem header tag="div" className="text-center"><strong>Settings</strong></DropdownItem> */}
              <DropdownItem><i className="fa fa-user"></i> Profile</DropdownItem>
              {/* <DropdownItem><i className="fa fa-wrench"></i> Settings</DropdownItem> */}
              {/* <DropdownItem><i className="fa fa-usd"></i> Payments<Badge color="secondary">42</Badge></DropdownItem> */}
              {/* <DropdownItem><i className="fa fa-file"></i> Projects<Badge color="primary">42</Badge></DropdownItem> */}
              <DropdownItem divider />
              {/* <DropdownItem><i className="fa fa-shield"></i> Lock Account</DropdownItem> */}
              <DropdownItem onClick={this.onLogout}><i className="icon-logout icons"></i> Logout</DropdownItem>
            </DropdownMenu>
          </AppHeaderDropdown>
        </Nav>
        {/* <AppAsideToggler className="d-md-down-none" /> */}
        {/*<AppAsideToggler className="d-lg-none" mobile />*/}
      </React.Fragment>
    );
  }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
