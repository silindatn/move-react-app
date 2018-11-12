import React, { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Container } from 'reactstrap';

import {
  AppAside,
  AppBreadcrumb,
  AppFooter,
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppSidebarMinimizer,
  AppSidebarNav,
} from '@coreui/react';
// sidebar nav config
import navigation from '../../_nav';
// routes config
import routes from '../../routes';
import DefaultAside from './DefaultAside';
import DefaultFooter from './DefaultFooter';
import DefaultHeader from './DefaultHeader';

//authguard
import { SecureRoute } from 'react-route-guard';
import { UserRouteGuard } from './../../shared/guard/userRouteGuard';
import * as _ from 'lodash';

class DefaultLayout extends Component {
  state = {
    navigation: null,
    default: ''
  }
  componentWillMount(){
    const permissions = JSON.parse(sessionStorage.getItem('permissions'));
    let items = [];
    navigation.items.map((item) =>{
      const found = _.findIndex(permissions, {code: item.access});
      if (found >= 0) {
        items.push(item);
      }
    });
    if(items[0] && items[0].url !== undefined){
    this.setState({default: items[0].url});
    }
    this.setState({navigation: {items: items}});
  }
  componentDidCatch(error, info) {
    console.log(error)
    this.props.history.push('/login');
  }
  render() {
    return (
      <div className="app">
        <AppHeader fixed>
          <DefaultHeader {...this.props}/>
        </AppHeader>
        <div className="app-body">
          <AppSidebar fixed display="lg">
            <AppSidebarHeader />
            <AppSidebarForm />
            <AppSidebarNav navConfig={this.state.navigation} {...this.props} />
            <AppSidebarFooter />
            <AppSidebarMinimizer />
          </AppSidebar>
          <main className="main">
            <AppBreadcrumb appRoutes={routes}/>
            <Container fluid>
              <Switch>
                {routes.map((route, idx) => {
                    return route.component ? (<SecureRoute key={idx} path={route.path} exact={route.exact} name={route.name} routeGuard={new UserRouteGuard()} redirectToPathWhenFail='/login' render={props => (
                        <route.component {...props} />
                      )} />)
                      : (null);
                  },
                )}
                <Redirect from="/" to="/login" />
              </Switch>
            </Container>
          </main>
          <AppAside fixed hidden>
            <DefaultAside />
          </AppAside>
        </div>
        <AppFooter>
          <DefaultFooter />
        </AppFooter>
      </div>
    );
  }
}

export default DefaultLayout;
