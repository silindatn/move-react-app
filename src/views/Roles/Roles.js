import React, { Component } from 'react';
import { Badge, Card, CardBody, CardHeader, Col, Row, Table, Button, Modal, ModalBody, ModalFooter, ModalHeader,Input, InputGroup, InputGroupAddon, InputGroupText, } from 'reactstrap';
import { RequestService } from '../../shared/services/request.service';
import Tooltip from '@atlaskit/tooltip';

import Select, { components } from 'react-select';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';


let vm = null;
const Inputs = (props) => {
  if (props.isHidden) {
    return <components.Input {...props}/>;
  }
  return (
    <div style={{ border: `1px dotted black` }}>
      <Tooltip content={'Custom Input'}>
        <components.Input {...props}/>
      </Tooltip>
    </div>
  );
};

class SimpleMenu extends Component {
  constructor(props) {
    super(props)
  this.state = props.role;
  this.state['anchorEl'] = null,
  this.state['edit'] = false,
  this.state['invoke_assign'] = false;
  this.state['permissionList'] = [],
  this.handleChange = this.handleChange.bind(this);
  this.onEditUser = this.onEditUser.bind(this);
  this.onInvokeAssignPermission = this.onInvokeAssignPermission.bind(this);
  this.onSaveEditUser = this.onSaveEditUser.bind(this);
  this.onSaveInvokeAssignPermission = this.onSaveInvokeAssignPermission.bind(this);
  this.request = new RequestService();
}
onSaveEditUser() {
  this.request.postRequest('/role/edit', {role: this.state}, (res) => {
    if (res.code === '00') {
      this.onEditUser();
    }
  });
}
onSaveInvokeAssignPermission() {
  this.request.postRequest('/role/updated_role_permission', {role: this.state}, (res) => {
    if (res.code === '00') {
      this.onInvokeAssignPermission();
    }
  });
}

handleChange(e) {
  const { name, value } = e.target;
  this.setState({ [name]: value });
}
onEditUser() {
  this.handleClose();
  this.setState({
    edit: !this.state.edit,
  });
}
onInvokeAssignPermission() {
  this.handleClose();
  this.setState({
    invoke_assign: !this.state.invoke_assign,
  });
}

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { anchorEl } = this.state;

    return (
      <div>
      <Modal style={{overflow: 'auto'}} isOpen={this.state.edit} toggle={this.onEditUser}
             className={'modal-lg '}>
        <ModalHeader toggle={this.onEditUser}>Edit User Information</ModalHeader>
        <ModalBody>
          <RoleDetails details={this.state} handleChange={this.handleChange} />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.onSaveEditUser}>Save</Button>
          <Button color="secondary" onClick={this.onEditUser}>Cancel</Button>
        </ModalFooter>
      </Modal>
        <Modal style={{overflow: 'auto'}} isOpen={this.state.invoke_assign} toggle={this.onInvokeAssignPermission}
                className={'modal-lg '}>
          <ModalHeader toggle={this.onInvokeAssignPermission}>Invoke/ Assign Permission</ModalHeader>
          <ModalBody>
            <AssignPermission details={this.state} handleChange={this.handleChange} />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.onSaveInvokeAssignPermission}>Save</Button>
            <Button color="secondary" onClick={this.onInvokeAssignPermission}>Cancel</Button>
          </ModalFooter>
        </Modal>
        <Button
          aria-owns={anchorEl ? 'simple-menu' : null}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          Manage
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.onEditUser}>Edit Information</MenuItem>
          <MenuItem onClick={this.onInvokeAssignPermission}>Assign/Invoke Permission</MenuItem>
        </Menu>
      </div>
    );
  }
}

function RoleRow(props) {
  const role = props.role;

  const getBadge = (status) => {
    return status === 'ACTIVE' ? 'success' :
      status === 'INACTIVE' ? 'secondary' :
            'primary'
  }

  return (
    <tr key={role.id.toString()}>
        <th scope="row">{role.id}</th>
        <td>{role.name}</td>
        <td>{role.description}</td>
        <td>
          <SimpleMenu role={role}/>
        </td>
        {/* <td><Badge color={getBadge(role.status)}>{role.status}</Badge></td> */}
    </tr>
  )
}
class AssignPermission extends Component {
  constructor(props) {
    super(props)
  
   this.state = props.details;
   this.state['permissionList'] = [];
   this.handleChange = this.handleChange.bind(this);
   this.handleSelect = this.handleSelect.bind(this);
   this.parentHandleChange = props.handleChange;
   this.request = new RequestService();
  }
  componentWillMount() {
    this.getPermissions();
  }
  getPermissions() {
    this.request.postRequest('/permission/list_all', {query: this.query}, (res) => {
      if (res.code === '00') {
        this.setState({permissionList: res.data});
      }
    });
  }
  handleSelect(e) {
    const event = {
      target: {
        name: 'permissions',
        value: e
      }
    };
    this.setState({ permissions: e });
    this.parentHandleChange(event);
  }
  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
    this.parentHandleChange(e);
  }
  render() {
    let { permissions, permissionList } = this.state;
  
    permissions = permissions.map(function(item) {
      item['value'] = item.id;
      item['label'] = item.code;
      return  item
    });
    var options = permissionList.map(function(item) {
      item['value'] = item.id;
      item['label'] = item.code;
      return  item
      });
  
    return (
      <div style={{minHeight: 200}}>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            Permissions
          </InputGroupText>
        </InputGroupAddon> 
        <Select  className='custom-select'
            name='permissions'
            closeMenuOnSelect={false}
            components={{ Inputs }}
            onChange={this.handleSelect}
            defaultValue={permissions}
            isMulti
            options={options}
          />
      </InputGroup>
      </div>
    )
  }
}

class RoleDetails extends Component {
  constructor(props) {
    super(props)
  
   this.state = props.details;
   this.handleChange = this.handleChange.bind(this);
   this.handleSelect = this.handleSelect.bind(this);
   this.parentHandleChange = props.handleChange;
   this.request = new RequestService();
  }
  componentWillMount() {
    this.getPermissions();
  }
  getPermissions() {
    this.request.postRequest('/permission/list_all', {query: this.query}, (res) => {
      if (res.code === '00') {
        this.setState({permissionList: res.data});
      }
    });
  }
  handleSelect(e) {
    const event = {
      target: {
        name: 'permissions',
        value: e
      }
    };
    this.setState({ permissions: e });
    this.parentHandleChange(event);
  }
  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
    this.parentHandleChange(e);
  }
  render() {
    const { permissionList } =this.state;

    var options = permissionList.map(function(item) {
      item['value'] = item.id;
      item['label'] = item.code;
      return  item
      });
  return (
    <Card className="p-4">
    <CardBody>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            Name
          </InputGroupText>
        </InputGroupAddon>
        <Input type="text" name='name' value={this.state.name} onChange={this.handleChange} placeholder="Name" />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            Description
          </InputGroupText>
        </InputGroupAddon>
        <Input type="text" name='description' value={this.state.description} onChange={this.handleChange} placeholder="Description" />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            Permissions
          </InputGroupText>
        </InputGroupAddon> 
        <Select  className='custom-select'
            name='permissions'
            closeMenuOnSelect={false}
            components={{ Inputs }}
            onChange={this.handleSelect}
            isMulti
            options={options}
          />
      </InputGroup>
    </CardBody>
  </Card>
  )
}
}

class Roles extends Component {
  constructor(props) {
    super(props)
    this.state = {
      large: false,
      name: '',
    description:  '',
    permissions:[],
    permissionList: [],
      roleList: []
    };
    vm = this;
    this.onSaveRole = this.onSaveRole.bind(this);
    this.onAddRole = this.onAddRole.bind(this);
    this.request = new RequestService();
    this.query = {};
  }

  componentWillMount() {
    this.getRoles();
  }
  onAddRole() {
    this.setState({
      large: !this.state.large,
    });
  }
  handleChange(e) {
    const { name, value } = e.target;
    vm.setState({ [name]: value });
  }
  onSaveRole() {
    this.request.postRequest('/role/create', {role: this.state}, (res) => {
      if (res.code === '00') {
        this.onAddRole();
        this.getRoles();
      }
    });
  }
  getRoles() {
    this.request.postRequest('/role/list_all', {query: this.query}, (res) => {
      if (res.code === '00') {
        this.setState({roleList: res.data});
      }
    });
  }

  render() {

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i> Roles
              </CardHeader>
              <CardBody>
                <Button color="primary" onClick={this.onAddRole} className="px-4">Add Role</Button>
               <p></p>
                <Modal style={{overflow: 'auto'}} isOpen={this.state.large} toggle={this.onAddRole}
                       className={'modal-lg '}>
                  <ModalHeader toggle={this.onAddRole}>Add Role</ModalHeader>
                  <ModalBody>
                    <RoleDetails details={this.state} handleChange={this.handleChange} />
                  </ModalBody>
                  <ModalFooter>
                    <Button color="secondary" onClick={this.onSaveRole}>Save</Button>
                    <Button color="secondary" onClick={this.onAddRole}>Cancel</Button>
                  </ModalFooter>
                </Modal>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Name</th>
                      <th scope="col">Description</th>
                      {/* <th scope="col">Status</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.roleList.map((role, index) =>
                      <RoleRow key={index} role={role}/>
                    )}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Roles;
