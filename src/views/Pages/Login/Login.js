import React, { Component } from 'react';
import { Button, Card, CardBody, CardGroup, Col, Container, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import { RequestService } from '../../../shared/services/request.service';
import { withAlert } from 'react-alert'
import * as _ from 'lodash';
import navigation from '../../../_nav';

class Login extends Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this);
    this.onLogin = this.onLogin.bind(this)
    this.request = new RequestService();
    this.state = {
      username: '',
      password: '',
      submitted: false
  }
  }
  componentWillMount() {
    this.getToken();
  }
  onLogin() {
    this.request.postRequest('/service', this.state, (res) => {
      if (res.code === '00') {
        this.props.alert.show('User has Successfully logged in', {
          type: 'success'
        })
        sessionStorage.setItem('user',JSON.stringify(res.data.user));
        sessionStorage.setItem('permissions', JSON.stringify(res.data.permissions));
        sessionStorage.setItem('isLoggedIn', 'true');
        for(var i=0; i < res.data.permissions.length; i++) {
          const found = _.findIndex(navigation.items, {access: res.data.permissions[i].code});
          if (found >= 0){
            this.props.history.push(navigation.items[found].url);
            // i = res.data.permissions.length;
            return true;
          }
        }
      } else {
        this.props.alert.show('Login fails, Contact system admin or retry', {
          type: 'error'
        })
      }
    });
  }
  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }
  getToken(){
    this.request.postRequest('/createSession', {channel: 'PORTAL', application: 'MOVE-PORTAL'},
  (response) => {
    console.log(response);
    if (response.code === '00') {
      sessionStorage.setItem('token', response.token);
    }
  })

  }
  render() {

    const { username, password, submitted } = this.state;

    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="8">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <h1>Login</h1>
                    <p className="text-muted">Sign In to your account</p>
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-user"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" name='username' value={username} onChange={this.handleChange} placeholder="Username" />
                    </InputGroup>
                    <InputGroup className="mb-4">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-lock"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="password" value={password} name='password' onChange={this.handleChange} placeholder="Password" />
                    </InputGroup>
                    <Row>
                      <Col xs="6">
                        <Button color="primary" onClick={this.onLogin} className="px-4">Login</Button>
                      </Col>
                      <Col xs="6" className="text-right">
                        {/* <Button color="link" className="px-0">Forgot password?</Button> */}
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
                {/* <Card className="text-white bg-primary py-5 d-md-down-none" style={{ width: 44 + '%' }}>
                  <CardBody className="text-center">
                    <div>
                      <h2>Sign up</h2>
                      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.</p>
                      <Button color="primary" className="mt-3" active>Register Now!</Button>
                    </div>
                  </CardBody>
                </Card> */}
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default withAlert(Login);
