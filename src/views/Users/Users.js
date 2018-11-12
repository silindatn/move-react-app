import React, { Component } from 'react';
import { Badge, Card,ButtonGroup, CardBody, CardHeader, Col, Row, Table, Button, Modal, ModalBody, ModalFooter, ModalHeader,Input, InputGroup, InputGroupAddon, InputGroupText, } from 'reactstrap';
import { RequestService } from '../../shared/services/request.service';
import WizardStep from 'react-wizard-step'
import * as _ from 'lodash';
// import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@atlaskit/tooltip';

import Select, { components } from 'react-select';


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
  this.state = props.user;
  this.state['anchorEl'] = null,
  this.state['edit'] = false,
  this.state['invoke_assign'] = false;
  this.state['type'] = props.user.branchId !== null ? 'Branch': props.user.supplierId !== null ? 'Supplier': 'Workshop';
  this.state['type_value'] = props.user.branchId !== null ? 'branchId': props.user.supplierId !== null ? 'supplierId': 'workshopId';
  this.state['branchList'] = [],
  this.state['supplierList'] = [],
  this.state['workshopList'] = [],
  this.handleChange = this.handleChange.bind(this);
  this.onEditUser = this.onEditUser.bind(this);
  this.onInvokeAssignRole = this.onInvokeAssignRole.bind(this);
  this.onSaveEditUser = this.onSaveEditUser.bind(this);
  this.onSaveInvokeAssignRole = this.onSaveInvokeAssignRole.bind(this);
  this.request = new RequestService();
}
onSaveEditUser() {
  this.request.postRequest('/user/updated_user', {update_user: this.state}, (res) => {
    if (res.code === '00') {
      this.onEditUser();
    }
  });
}
onSaveInvokeAssignRole() {
  this.request.postRequest('/user/updated_user_role', {update_user: this.state}, (res) => {
    if (res.code === '00') {
      this.onInvokeAssignRole();
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
onInvokeAssignRole() {
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
          <UserDetails details={this.state} handleChange={this.handleChange} />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.onSaveEditUser}>Save</Button>
          <Button color="secondary" onClick={this.onEditUser}>Cancel</Button>
        </ModalFooter>
      </Modal>
        <Modal style={{overflow: 'auto'}} isOpen={this.state.invoke_assign} toggle={this.onInvokeAssignRole}
                className={'modal-lg '}>
          <ModalHeader toggle={this.onInvokeAssignRole}>Invoke/ Assign Role</ModalHeader>
          <ModalBody>
            <AssignRole details={this.state} handleChange={this.handleChange} />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.onSaveInvokeAssignRole}>Save</Button>
            <Button color="secondary" onClick={this.onInvokeAssignRole}>Cancel</Button>
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
          <MenuItem onClick={this.onInvokeAssignRole}>Assign/Invoke Role</MenuItem>
        </Menu>
      </div>
    );
  }
}


function UserRow(props) {
  const user = props.user;

  const getBadge = (status) => {
    return status === 'ACTIVE' ? 'success' :
      status === 'INACTIVE' ? 'secondary' :
          status === 'BLOCKED' ? 'danger' :
            'primary'
  }

  return (
    <tr key={user.id}>
        <th scope="row">{user.id}</th>
        <td>{user.firstName}</td>
        <td>{user.lastName}</td>
        <td>{user.msisdn}</td>
        <td>{user.email}</td>
        <td>{user.branch !== null ? user.branch.name : null}</td>
        <td>{user.supplier !== null ? user.supplier.name : null}</td>
        <td>{user.workshop !== null ? user.workshop.name: null}</td>
        <td><Badge color={getBadge(user.status)}>{user.status}</Badge></td>
        <td>
          <SimpleMenu user={user}/>
        </td>
    </tr>
  )
}
class UserDetails extends Component {
  constructor(props) {
    super(props)
  
   this.state = props.details;
   this.handleChange = this.handleChange.bind(this);
   this.parentHandleChange = props.handleChange;
  }
  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
    this.parentHandleChange(e);
  }
  render() {
  return (
    <div>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
             Cell Number
          </InputGroupText>
        </InputGroupAddon>
        <Input type="text" name='msisdn' value={this.state.msisdn} onChange={this.handleChange} placeholder="Cell Number" />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
             First Name
          </InputGroupText>
        </InputGroupAddon>
        <Input type="text" name='firstName' value={this.state.firstName} onChange={this.handleChange} placeholder="First Name" />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
             Last Name
          </InputGroupText>
        </InputGroupAddon>
        <Input type="text" name='lastName' value={this.state.lastName} onChange={this.handleChange} placeholder="Last Name" />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
             E-mail
          </InputGroupText>
        </InputGroupAddon>
        <Input type="text" name='email' value={this.state.email} onChange={this.handleChange} placeholder="E-mail" />
      </InputGroup>
    </div>
  )
}
}
class AssignRole extends Component {
  constructor(props) {
    super(props)
  
   this.state = props.details;
   this.state['roleList'] = [];
   this.handleChange = this.handleChange.bind(this);
   this.handleSelect = this.handleSelect.bind(this);
   this.parentHandleChange = props.handleChange;
   this.request = new RequestService();
  }
  componentWillMount() {
    this.getRoles();
  }
  getRoles() {
    this.request.postRequest('/role/list_all', {query: this.query}, (res) => {
      if (res.code === '00') {
        this.setState({roleList: res.data});
      }
    });
  }
  handleSelect(e) {
    const event = {
      target: {
        name: 'roles',
        value: e
      }
    };
    this.setState({ roles: e });
    this.parentHandleChange(event);
  }
  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
    this.parentHandleChange(e);
  }
  render() {
    let { roles, roleList } = this.state;
  
    roles = roles.map(function(item) {
      item['value'] = item.id;
      item['label'] = item.name;
      return  item
    });
    var options = roleList.map(function(item) {
      item['value'] = item.id;
      item['label'] = item.name;
      return  item
      });
  
    return (
      <div>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
          Roles
          </InputGroupText>
        </InputGroupAddon> 
        <Select  className='custom-select'
            name='roles'
            closeMenuOnSelect={false}
            components={{ Inputs }}
            onChange={this.handleSelect}
            defaultValue={roles}
            isMulti
            options={options}
          />
      </InputGroup>
      </div>
    )
  }
}
class AssignBranch extends Component{  
  constructor(props) {
  super(props)

 this.state = props.details;
 this.handleSelect = this.handleSelect.bind(this);
 this.handleType = this.handleType.bind(this);
 this.handleChange = this.handleChange.bind(this);
 this.parentHandleChange = props.handleChange;
 this.request = new RequestService();
}
componentWillMount() {
  this.getBranches();
  this.getWorkShops();
  this.getSuppliers();
}
getWorkShops() {
  this.request.postRequest('/workshop/list_all', {query: this.query}, (res) => {
    if (res.code === '00') {
      var options = res.data.map(function(item) {
        item['value'] = item.id;
        item['label'] = item.name;
        return item;
        })
      this.setState({workshopList: options});
    }
  });
}
getSuppliers() {
  this.request.postRequest('/supplier/list_all', {query: this.query}, (res) => {
    if (res.code === '00') {
      var options = res.data.map(function(item) {
        item['value'] = item.id;
        item['label'] = item.name;
        return item;
        })
      this.setState({supplierList: options});
    }
  });
}
getBranches() {
  this.request.postRequest('/branch/list_all', {query: this.query}, (res) => {
    if (res.code === '00') {
      var options = res.data.map(function(item) {
        item['value'] = item.id;
        item['label'] = item.name;
        return item;
        })
      this.setState({branchList: options});
    }
  });
}
handleSelect(e) {
  let event = {
    target: {
      name: this.state.type_value,
      value: e
    }
  };
  this.setState({[this.state.type_value]: e});
  this.parentHandleChange(event);
}
handleType(e) {
  const data = { 
    branch: {type: 'Branch', type_value: 'branch'},
    supplier: {type: 'Supplier', type_value: 'supplier'},
    workshop: {type: 'Workshop', type_value: 'workshop'}
  }
  const { name } = e.target;
  this.setState(data[name]);
  vm.setState(data[name]);
}
handleChange(e) {
  const { name, value } = e.target;
  this.setState({ [name]: value });
  this.parentHandleChange(e);
}
render() {
  const { branchList, supplierList, workshopList } = this.state;
  let defaultValue =this.state[this.state.type_value];
  var options = this.state.type_value === 'supplier' ? supplierList: this.state.type_value === 'workshop' ? workshopList: branchList

  return (
    <div>
      <ButtonGroup>
        <Button name='branch' onClick={this.handleType}>Branch</Button>
        <Button name='supplier' onClick={this.handleType}>Supplier</Button>
        <Button name='workshop' onClick={this.handleType}>Workshop</Button>
      </ButtonGroup>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            {this.state.type}
          </InputGroupText>
        </InputGroupAddon> 
        {this.state.type_value === 'supplier'? <Select className='custom-select'
            name='supplier'
            closeMenuOnSelect={false}
            components={{ Inputs }}
            onChange={this.handleSelect}
            defaultValue={defaultValue}
            options={options}
          />: this.state.type_value === 'workshop'?<Select className='custom-select'
          name='workshop'
          closeMenuOnSelect={false}
          components={{ Inputs }}
          onChange={this.handleSelect}
          defaultValue={defaultValue}
          options={options}
        /> :<Select className='custom-select'
        name='branch'
        closeMenuOnSelect={false}
        components={{ Inputs }}
        onChange={this.handleSelect}
        defaultValue={defaultValue}
        options={options}
      />}
      </InputGroup>
      </div>
  )
}
}

class Users extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userList: [],
      branchList: [],
      roleList: [],
      large: false,
      msisdn: '',
      username: '',
      firstName: '',
      lastName: '',
      channel: '',
      branch: null,
      supplier:null,
      workshop: null,
      branchId: null,
      email: '',
      supplierId: null,
      workshopId: null, 
      roles:[]
    };
    this.state['type'] = 'Branch';
    this.state['type_value'] = 'branch';
    this.state['branchList'] = [],
    this.state['supplierList'] = [],
    this.state['workshopList'] = [],

    vm = this;
    
    this.onAddUser = this.onAddUser.bind(this);
    this.onSaveUser = this.onSaveUser.bind(this);
    this.request = new RequestService();
    this.query = {};
  }

  componentWillMount() {
    this.getUsers();
  }
  onSaveUser() {
    if(this.state.type_value === 'supplier'){
      this.state.supplierId = this.state.supplier.id;
    } else if (this.state.type_value === 'workshop') {
      this.state.workshopId = this.state.workshop.id;
    } else {
      this.state.branchId = this.state.branch.id;
    }
    this.state.username = this.state.email;
    this.request.postRequest('/user/create', {userAdd: this.state}, (res) => {
      if (res.code === '00') {
        this.onAddUser();
        this.getUsers();
      }
    });
  }
  handleChange(e) {
    const { name, value } = e.target;
    vm.setState({ [name]: value });
  }
  getUsers() {
    this.request.postRequest('/user/list_all', {query: this.query}, (res) => {
      if (res.code === '00') {
        this.setState({userList: res.data});
      }
    });
  }
  onAddUser() {
    this.setState({
      large: !this.state.large,
    });
  }

  render() {

    const { userList } = this.state;

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i> Users
              </CardHeader>
              <CardBody>
                <Button color="primary" onClick={this.onAddUser} className="px-4">Add User</Button>
               <p></p>
                <Modal style={{overflow: 'auto'}} isOpen={this.state.large} toggle={this.onAddUser}
                       className={'modal-lg '}>
                  <ModalHeader toggle={this.onAddUser}>Add User</ModalHeader>
                  <ModalBody>
                    <UserDetails details={this.state} handleChange={this.handleChange} />
                    <AssignRole details={this.state} handleChange={this.handleChange} />
                    <AssignBranch details={this.state} handleChange={this.handleChange} />
                  </ModalBody>
                  <ModalFooter>
                    <Button color="secondary" onClick={this.onSaveUser}>Save</Button>
                    <Button color="secondary" onClick={this.onAddUser}>Cancel</Button>
                  </ModalFooter>
                </Modal>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">First Name</th>
                      <th scope="col">Last NAme</th>
                      <th scope="col">Cell Number</th>
                      <th scope="col">E-mail</th>
                      <th scope="col">Branch</th>
                      <th scope="col">Supplier</th>
                      <th scope="col">Workshop</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map((user, index) =>
                      <UserRow key={index} user={user}/>
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

export default Users;
