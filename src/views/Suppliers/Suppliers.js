import React, { Component } from 'react';
import { Badge, Card, CardBody, CardHeader, Col, Row, Table, Button, Modal, ModalBody, ModalFooter, ModalHeader,Input, InputGroup, InputGroupAddon, InputGroupText, Dropdown, DropdownItem,DropdownMenu, DropdownToggle  } from 'reactstrap';
import { RequestService } from '../../shared/services/request.service';
import * as _ from 'lodash';
import ReactTable from 'react-table';
import * as moment from 'moment';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@atlaskit/tooltip';
import { withAlert } from 'react-alert'
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
  this.state = props.supplier;
  console.log(this.state);
  this.state['anchorEl'] = null,
  this.state['edit'] = false,
  this.state['view_supplier'] = false;
  this.state['showAdd'] = false;
  this.state['showApprove'] = false;
  this.state['showView'] = false;
  this.state['user'] = JSON.parse(sessionStorage.getItem('user'));
  this.handleChange = this.handleChange.bind(this);
  this.onEditSupplier = this.onEditSupplier.bind(this);
  this.onViewSupplier = this.onViewSupplier.bind(this);
  this.onSaveEditSupplier = this.onSaveEditSupplier.bind(this);
  this.onApproveSupplier = this.onApproveSupplier.bind(this);
  this.getSupplier = props.getSupplier;
  this.permissions = JSON.parse(sessionStorage.getItem('permissions'));
  this.request = new RequestService();
}
componentDidMount(){
  // if (_.findIndex(this.permissions, {code: 'UM-MENU-ADD-ORDER'}) >= 0) {
  //   this.setState({showAdd: true});
  // }
  // if (_.findIndex(this.permissions, {code: 'UM-MENU-ORDER-APPROVE'}) >= 0 && this.props.supplier.status !=='APPROVED') {
  //   this.setState({showApprove: true});
  // }
  // if (_.findIndex(this.permissions, {code: 'UM-MENU-ORDER-VIEW'}) >= 0) {
  //   this.setState({showView: true});
  // }
}
onSaveEditSupplier() {
  this.request.postRequest('/supplier/edit', {supplier: this.state}, (res) => {
    if (res.code === '00') {
      this.onEditSupplier();
      this.getSupplier();
    }
  });
}

handleChange(e) {
  const { name, value } = e.target;
  this.setState({ [name]: value });
}
onEditSupplier() {
  this.handleClose();
  this.setState({
    edit: !this.state.edit,
  });
}
onViewSupplier() {
  this.handleClose();
  this.setState({
    view_supplier: !this.state.view_supplier,
  });
}

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };
  onApproveSupplier() {
    if (this.state.user.branchId !== null && this.state.user.branch !== null){
    this.state.branchId = this.state.user.branch.id;
    this.state.approvedId = this.state.user.id;
    this.state.approvedDate = new Date();
    this.state.status = 'APPROVED'


    this.request.postRequest('/supplier/edit', {supplier: this.state}, (res) => {
      if (res.code === '00') {
        this.onViewSupplier();
        this.props.alert.show('Order has been Successfully created', {
          type: 'success'
        })
      } else {
        this.props.alert.show('Order not created!', {
          type: 'error'
        })
      }
    });
  }
  }

  render() {
    const { anchorEl } = this.state;

    return (
      <div>
      <Modal style={{overflow: 'auto'}} isOpen={this.state.edit} toggle={this.onEditSupplier}
             className={'modal-lg '}>
        <ModalHeader toggle={this.onEditSupplier}>Edit Supplier Information</ModalHeader>
        <ModalBody>
          <SupplierDetails details={this.state} handleChange={this.handleChange} isEdit={true} isUpdate={true} />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.onSaveEditSupplier}>Save</Button>
          <Button color="secondary" onClick={this.onEditSupplier}>Cancel</Button>
        </ModalFooter>
      </Modal>
        <Modal style={{overflow: 'auto'}} isOpen={this.state.view_supplier} toggle={this.onViewSupplier}
                className={'modal-lg '}>
          <ModalHeader toggle={this.onViewSupplier}>Supplier</ModalHeader>
          <ModalBody>
          <SupplierDetails details={this.state} handleChange={this.handleChange} isEdit={false} isUpdate={false} />
          </ModalBody>
          <ModalFooter>
            
          <Button color="primary" hidden={!this.state.showApprove} onClick={this.onApproveSupplier}>Approve</Button>
            <Button color="secondary" onClick={this.onViewSupplier}>Cancel</Button>
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
        <MenuItem onClick={this.onEditSupplier}><i className="fa fa-edit">Edit Information</i></MenuItem>
        {/* <MenuItem onClick={this.onViewSupplier}><i className="fa fa-eye">Chnage Status</i></MenuItem> */}
          {/* <MenuItem hidden={!this.state.showAdd} onClick={this.onEditSupplier}><i className="fa fa-edit fa-2x"></i></MenuItem>
          <MenuItem hidden={!this.state.showView} onClick={this.onViewSupplier}><i className="fa fa-eye fa-2x "></i></MenuItem> */}
        </Menu>
      </div>
    );
  }
}

function SupplierRow(props) {
  const supplier = props.supplier;

  const getBadge = (status) => {
    return status === 'ACTIVE' ? 'success' :
      status === 'INACTIVE' ? 'secondary' :
            'primary'
  }

  return (
    <tr key={supplier.id.toString()}>
        <th scope="row">{supplier.id}</th>
        <td>{supplier.name}</td>
        <td>{supplier.telephone}</td>
        <td>{supplier.address.streetAddress}</td>
        <td>{supplier.address.city}</td>
        <td>{supplier.address.province}</td>
        <td><Badge color={getBadge(supplier.status)}>{supplier.status}</Badge></td>
    </tr>
  )
}

class SupplierDetails extends Component {
  constructor(props) {
    super(props)
  
   this.state = props.details;
   this.state['dropdownOpen'] = false;
   this.state['isEdit'] = props.isEdit;
   this.state['isUpdate'] = props.isUpdate;
   this.state['statusList'] = [
     {value:'ACTIVE', label: 'ACTIVE'},{value: 'ONHOLD', label:'ONHOLD'}]
   this.handleChange = this.handleChange.bind(this);
   this.handleSelect = this.handleSelect.bind(this);
   this.parentHandleChange = props.handleChange;
    this.toggle = this.toggle.bind(this);
}

toggle() {
  this.setState(prevState => ({
    dropdownOpen: !prevState.dropdownOpen
  }));
}
handleSelect(e) {
  let event = {
    target: {
      name: 'status',
      value: e.value
    }
  };
  this.setState({['status']: e.value});
  this.parentHandleChange(event);
}
  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
    this.parentHandleChange(e);
  }
  render() {

    const defauleValue = {
      value: this.state.status,
      label: this.state.status
    }
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
            Telephone
          </InputGroupText>
        </InputGroupAddon>
        <Input type="text" name='telephone' value={this.state.name} onChange={this.handleChange} placeholder="Telephone" />
      </InputGroup>
      <InputGroup className="mb-3" hidden={!this.state.isUpdate}>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            Status
          </InputGroupText>
        </InputGroupAddon>
        <Select className='custom-select'
            isDisabled={!this.state.isEdit}
            name='status'
            closeMenuOnSelect={false}
            components={{ Inputs }}
            onChange={this.handleSelect}
            defaultValue={defauleValue}
            options={this.state.statusList}
          />
      </InputGroup>
    </CardBody>
  </Card>
  )
}
}

class Suppliers extends Component {
  constructor(props) {
    super(props)
    this.state = {
      large: false,
      showAdd: false,
      name: '',
      telephone: '',
      Address: {
        streetAddress: '',
        city: '',
        province: '',
        postalCode: ''
      },
    channel: 'portal',
	  permissions:[],
      supplierList: [],
      showView: false,
    };
    vm =this;
    this.permissions = JSON.parse(sessionStorage.getItem('permissions'));
    this.onAddSupplier = this.onAddSupplier.bind(this);
    this.request = new RequestService();
    this.query = {};
  }

  componentWillMount() {
    this.getSupplier();
  }
  componentDidMount(){
    if (_.findIndex(this.permissions, {code: 'UM-MENU-ADD-SUPPLIER'}) >= 0) {
      this.setState({showAdd: true});
    }
    if (_.findIndex(this.permissions, {code: 'UM-MENU-SUPPLIER-VIEW'}) >= 0) {
      this.setState({showView: true});
    }
  }
  onAddSupplier() {
    this.setState({
      large: !this.state.large,
    });
  }
  handleChange(e) {
    const { name, value } = e.target;
    vm.setState({ [name]: value });
  }
  getBadge = (status) => {
    return status === 'ACTIVE' ? 'success' :
      status === 'INACTIVE' ? 'secondary' :
            'primary'
  }
  getSupplier() {
    vm.request.postRequest('/supplier/list_all', {query: vm.query}, (res) => {
      if (res.code === '00') {
        vm.setState({supplierList: res.data});
      }
    });
  }


  render() {

    const columns =[{
      Header: 'Kerridge AP',
      accessor: 'id' // String-based value accessors!
    }, {
      Header: 'Name',
      accessor: 'name'
    }, {
      Header: 'Telephone',
      accessor: 'telephone'
    }, {
      id: 'street', // Required because our accessor is not a string
      Header: 'Street',
      accessor: supplier => supplier.address.streetAddress // Custom value accessors!
    }, {
      id: 'city', // Required because our accessor is not a string
      Header: 'City',
      accessor: supplier => supplier.address.city // Custom value accessors!
    },{
      id: 'province', // Required because our accessor is not a string
      Header: 'Province',
      accessor: supplier => supplier.address.province // Custom value accessors!
    }, 
    {
      Header: 'Status',
      accessor: 'status',
      filterable: false,
      Cell: supplier =><Badge color={this.getBadge(supplier.value)}>{supplier.value}</Badge>
    }, 
    {
      Header: 'View',
      show: this.state.showView,
      accessor: 'supplier',
      filterable: false,
      Cell: props =><SimpleMenu supplier={props.original} getSupplier={this.getSupplier}/>,
    }
  ]
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i> Suppliers
              </CardHeader>
              <CardBody>
                <Button color="primary" hidden={!this.state.showAdd} onClick={this.onAddSupplier} className="px-4">Add Supplier</Button>
               <p></p>
                <Modal style={{overflow: 'auto'}} isOpen={this.state.large} toggle={this.onAddSupplier}
                       className={'modal-lg '}>
                  <ModalHeader toggle={this.onAddSupplier}>Add Supplier</ModalHeader>
                  <ModalBody>
                    <SupplierDetails  details={this.state} handleChange={this.handleChange} />
                  </ModalBody>
                  <ModalFooter>
                    <Button color="secondary" onClick={this.onAddSupplier}>Cancel</Button>
                  </ModalFooter>
                </Modal>
                <ReactTable
                  data={this.state.supplierList}
                  columns={columns}
                  defaultPageSize ={5}
                  style={{color: 'white'}}
                  // SubComponent={row => {
                  //   return (
                  //     <SimpleMenu supplier={row}/>
                  //   );
                  // }}
                  className="-striped -highlight"
                  filterable
                />
                {/* <Table responsive hover>
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Name</th>
                      <th scope="col">Telephone</th>
                      <th scope="col">Street</th>
                      <th scope="col">City</th>
                      <th scope="col">Province</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.supplierList.map((supplier, index) =>
                      <SupplierRow key={index} supplier={supplier}/>
                    )}
                  </tbody>
                </Table> */}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default withAlert(Suppliers);
