import React, { Component } from 'react';
import { Badge, Card, CardBody, CardHeader, Col, Row, Table, Button, Modal, ModalBody, ModalFooter, ModalHeader,Input, InputGroup, InputGroupAddon, InputGroupText, Dropdown, DropdownItem,DropdownMenu, DropdownToggle} from 'reactstrap';
import { RequestService } from '../../shared/services/request.service';
import WizardStep from 'react-wizard-step'
import * as fs from 'fs';
import ReactTable from 'react-table';
import * as _ from 'lodash';
import * as moment from 'moment';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@atlaskit/tooltip';
import FileBase64 from 'react-file-base64';
import CurrencyFormat from 'react-currency-format';

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
  this.state = props.order;
  console.log(this.state);
  this.state['anchorEl'] = null,
  this.state['edit'] = false,
  this.state['view_order'] = false;
  this.state['showAdd'] = false;
  this.state['showApprove'] = false;
  this.state['showView'] = false;
  this.state['user'] = JSON.parse(sessionStorage.getItem('user'));
  this.handleChange = this.handleChange.bind(this);
  this.onEditOrder = this.onEditOrder.bind(this);
  this.onViewOrder = this.onViewOrder.bind(this);
  this.onSaveEditOrder = this.onSaveEditOrder.bind(this);
  this.onApproveOrder = this.onApproveOrder.bind(this);
  this.permissions = JSON.parse(sessionStorage.getItem('permissions'));
  this.request = new RequestService();
}
componentDidMount(){
  if (_.findIndex(this.permissions, {code: 'UM-MENU-ADD-ORDER'}) >= 0) {
    this.setState({showAdd: true});
  }
  if (_.findIndex(this.permissions, {code: 'UM-MENU-ORDER-APPROVE'}) >= 0 && this.props.order.status !=='APPROVED') {
    this.setState({showApprove: true});
  }
  if (_.findIndex(this.permissions, {code: 'UM-MENU-ORDER-VIEW'}) >= 0) {
    this.setState({showView: true});
  }
}
onSaveEditOrder() {
  this.request.postRequest('/order/edit', {order: this.state}, (res) => {
    if (res.code === '00') {
      this.onEditOrder();
    }
  });
}

handleChange(e) {
  const { name, value } = e.target;
  this.setState({ [name]: value });
}
onEditOrder() {
  this.handleClose();
  this.setState({
    edit: !this.state.edit,
  });
}
onViewOrder() {
  this.handleClose();
  this.setState({
    view_order: !this.state.view_order,
  });
}

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };
  onApproveOrder() {
    if (this.state.user.branchId !== null && this.state.user.branch !== null){
    this.state.branchId = this.state.user.branch.id;
    this.state.approvedId = this.state.user.id;
    this.state.approvedDate = new Date();
    this.state.status = 'APPROVED'


    this.request.postRequest('/order/edit', {order: this.state}, (res) => {
      if (res.code === '00') {
        this.onViewOrder();
      }
    });
  }
  }

  render() {
    const { anchorEl } = this.state;

    return (
      <div>
      <Modal style={{overflow: 'auto'}} isOpen={this.state.edit} toggle={this.onEditOrder}
             className={'modal-lg '}>
        <ModalHeader toggle={this.onEditOrder}>Edit Order Information</ModalHeader>
        <ModalBody>
          <OrderDetails details={this.state} handleChange={this.handleChange} isEdit={true} />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.onSaveEditOrder}>Save</Button>
          <Button color="secondary" onClick={this.onEditOrder}>Cancel</Button>
        </ModalFooter>
      </Modal>
        <Modal style={{overflow: 'auto'}} isOpen={this.state.view_order} toggle={this.onViewOrder}
                className={'modal-lg '}>
          <ModalHeader toggle={this.onViewOrder}>Order</ModalHeader>
          <ModalBody>
          <OrderDetails details={this.state} handleChange={this.handleChange} isEdit={false} />
          </ModalBody>
          <ModalFooter>
            
          <Button color="primary" hidden={!this.state.showApprove} onClick={this.onApproveOrder}>Approve</Button>
            <Button color="secondary" onClick={this.onViewOrder}>Cancel</Button>
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
          <MenuItem hidden={!this.state.showAdd} onClick={this.onEditOrder}><i className="fa fa-edit fa-2x"></i></MenuItem>
          <MenuItem hidden={!this.state.showView} onClick={this.onViewOrder}><i className="fa fa-eye fa-2x "></i></MenuItem>
        </Menu>
      </div>
    );
  }
}

function OrderRow(props) {
  const order = props.order;
  let showView = props.showView;
  const getBadge = (status) => {
    return status === 'APPROVED' ? 'success' :
      status === 'PENDING' ? 'warning' :
          status === 'REJECTED' ? 'danger' :
            'primary'
  }

  return (
    <tr key={order.id}>
        <th scope="row">{order.order_no}</th>
        <td>{order.quoteNumber}</td>
        <td>{order.quoteValue}</td>
        <td>{order.supplier.name}</td>
        <td>{order.requested.fullName}</td>
        <td>{moment(order.createdAt).format('YYYY-MM-DD HH:mm:ss')}</td>
        <td>{order.approved !== null?order.approved.fullName : null}</td>
        <td>{order.approved !== null? moment(order.approvedDate).format('YYYY-MM-DD HH:mm:ss') : null}</td>
        <td><Badge color={getBadge(order.status)}>{order.status}</Badge></td>
        <td scope="col"  hidden={!showView}>
          <SimpleMenu order={order}/>
        </td>
    </tr>
  )
}
class OrderDetails extends Component {
  constructor(props) {
    super(props)
  
   this.state = props.details;
   this.state['isEdit'] = props.isEdit;
   this.state['supplierList'] = [];
   this.state['workshopName'] = '';
   this.state['requesterName'] = '';
   this.state['selectedFile'] = '';
   this.state['file'] = 'data:application/pdf;base64,';
   this.state['requestedDate'] = moment().format('YYYY-MM-DD HH:mm:ss');
   this.state['workshopStatus'] = null
   if (this.state.workshop === null) {
    this.state.workshopName = this.state.user.workshop.name || '';
    this.state.requesterName = this.state.user.fullName || '';
   } else {
    this.state.workshopName = this.state.workshop.name || '';
    this.state.requesterName = this.state.requested.fullName || '';
    this.state.workshopStatus = this.state.workshop.status
   }
   if (this.state.createdAt !== undefined) {
    this.state.requestedDate = moment(this.state.createdAt).format('YYYY-MM-DD HH:mm:ss');
   }
   if (this.state.supplier !== null) {
    this.state.supplier['value'] = this.state.supplier.id;
    this.state.supplier['label'] = this.state.supplier.name;
   }
   this.handleSelect = this.handleSelect.bind(this);
   this.handleChange = this.handleChange.bind(this);
   this.parentHandleChange = props.handleChange;
   this.toggle = this.toggle.bind(this);
   this.fileChangedHandler = this.fileChangedHandler.bind(this);
   this.uploadHandler = this.uploadHandler.bind(this);
   this.request = new RequestService();
  }
  componentWillMount() {
    this.getSuppliers();
  }
  getPurchaseFiles(file){
    let om = this;
    this.request.postRequest('/google/upload', file, (res) => {
      if (res.code === '00') {
        om.setState({purchaseId: res.data.id})
      }
    });
  }
  getQuoteFiles(file){
    let om = this;
    this.request.postRequest('/google/upload', file, (res) => {
      if (res.code === '00') {
        om.setState({quoteId: res.data.id})
      }
    });
  }
  getInvoiceFiles(file){
    let om = this;
    this.request.postRequest('/google/upload', file, (res) => {
      if (res.code === '00') {
        om.setState({invoiceId: res.data.id})
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

toggle() {
 this.setState(prevState => ({
   dropdownOpen: !prevState.dropdownOpen
 }));
}
handleSelect(e) {
  let event = {
    target: {
      name: 'supplier',
      value: e
    }
  };
  this.setState({['supplier']: e});
  this.parentHandleChange(event);
}
fileChangedHandler = (event) => {
  const file = event.target.files[0];
  this.setState({selectedFile: file.name});
  this.request.postRequest('/google/upload', {name: file.name, data: file}, (res) => {
    // if (res.code === '00') {
      console.log(res);
    // }
  });
}

uploadHandler = () => { 
  console.log(this.state.selectedFile)
}
  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
    this.parentHandleChange(e);
  }
  render() {
  return (
    <div>
    <Card className="p-4" style={{minHeight: 130, maxHeight: 190, top: -10}}>
    <CardHeader>
        <i className="fa fa-align-justify"></i> Workshop Details <small>Date: <b>{this.state.requestedDate}</b></small> 
    </CardHeader>
    <CardBody>
      <Row className="justify-content-center">
      <Col xl={6}>
        <InputGroup className="mb-3">
          <InputGroupAddon addonType="prepend">
            <InputGroupText>
              Name
            </InputGroupText>
          </InputGroupAddon>
          <Input type="text" disabled='disabled' name='name' value={this.state.workshopName} placeholder="Name" />
        </InputGroup>
      </Col>
      <Col xl={6}>
        <InputGroup className="mb-3">
          <InputGroupAddon addonType="prepend">
            <InputGroupText>
              Requested By
            </InputGroupText>
          </InputGroupAddon>
          <Input type="text" disabled='disabled' name='requestedby' value={this.state.requesterName} placeholder="Requested By" />
        </InputGroup>
      </Col>
      <Col xl={6} hidden={this.state.workshopStatus === null}>
        <InputGroup className="mb-3">
          <InputGroupAddon addonType="prepend">
            <InputGroupText>
              Status
            </InputGroupText>
          </InputGroupAddon>
          <Input type="text" disabled='disabled' name='status' value={this.state.workshopStatus} placeholder="Status" />
        </InputGroup>
      </Col>
      </Row>
    </CardBody>
  </Card>
    <Card className="p-4" style={{minHeight: 285, maxHeight: 485, top:-10}}>
    <CardHeader>
        <i className="fa fa-align-justify"></i> Supplier and Quote Details
    </CardHeader>
    <CardBody>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            Quote Number
          </InputGroupText>
        </InputGroupAddon>
        <Input type="text" disabled={!this.state.isEdit} name='quoteNumber' value={this.state.quoteNumber} onChange={this.handleChange} placeholder="Quote Number" />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            Quote Value (incl. VAT)
          </InputGroupText>
        </InputGroupAddon>
        <Input type="text" disabled={!this.state.isEdit} name='quoteValue' value={this.state.quoteValue} onChange={this.handleChange} placeholder="Quote Value (incl. VAT)" />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            Available Credit
          </InputGroupText>
        </InputGroupAddon>
        <Input type="text" disabled='disabled' name='availableCredit' value={this.state.availableCredit} onChange={this.handleChange} placeholder="Available Credit" />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            Supplier
          </InputGroupText>
        </InputGroupAddon>
        <Select className='custom-select'
            isDisabled={!this.state.isEdit}
            name='supplier'
            closeMenuOnSelect={false}
            components={{ Inputs }}
            onChange={this.handleSelect}
            defaultValue={this.state.supplier}
            options={this.state.supplierList}
          />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            Upload Quote
          </InputGroupText>
        </InputGroupAddon>
        <FileBase64 className="btn btn-default btn-file" onDone={ this.getQuoteFiles.bind(this) } />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            Upload Purchase Order
          </InputGroupText>
        </InputGroupAddon> 
        <FileBase64 className="btn btn-default btn-file" onDone={ this.getPurchaseFiles.bind(this) } />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            Upload Invoice
          </InputGroupText>
        </InputGroupAddon> 
         <FileBase64 className="btn btn-default btn-file" onDone={ this.getInvoiceFiles.bind(this) } />
      </InputGroup>
    </CardBody>
  </Card>
  </div>
  )
}
}

class Orders extends Component {
  constructor(props) {
    super(props)
    this.state = {
      orderList: [],
      orderPending: [],
      orderApproved: [],
      branchList: [],
      roleList: [],
      selectedRow: null,
      showAdd: false,
      showView: false,
      showApprove: false,
      dropdownOpen: false,
      selectedSupplier: 'Select Supplier',
      large: false,
      view_order: false,
      quoteNumber: '', 
      quoteValue: '',
      availableCredit: 'R 50,000.00',
      purchaseId: null,
      quoteId: null,
      invoiceId: null,
      branchId: null, 
      supplierId: null,
      workshopId: null,
      branch: null, 
      supplier: null,
      workshop: null,
      approvedId: null,
      requestedId: null,
      user: JSON.parse(sessionStorage.getItem('user')),
    };

    vm = this;
    this.permissions = JSON.parse(sessionStorage.getItem('permissions'));
    this.onAddOrder = this.onAddOrder.bind(this);
    this.handleOriginal = this.handleOriginal.bind(this);
    this.onSaveOrder = this.onSaveOrder.bind(this);
    this.request = new RequestService();
    this.query = null;
  }

  componentWillMount() {
    this.getOrders();
  }
  componentDidMount(){
    if (_.findIndex(this.permissions, {code: 'UM-MENU-ADD-ORDER'}) >= 0) {
      this.setState({showAdd: true});
    }
    if (_.findIndex(this.permissions, {code: 'UM-MENU-ORDER-APPROVE'}) >= 0) {
      this.setState({showApprove: true});
    }
    if (_.findIndex(this.permissions, {code: 'UM-MENU-ORDER-VIEW'}) >= 0) {
      this.setState({showView: true});
    }
  }
  
  handleChange(e) {
    const { name, value } = e.target;
    vm.setState({ [name]: value });
  }
  getOrders() {
    // if(this.state.user.branchId !== null) {
    //   this.query ={branchId: this.state.user.branchId};
    if(this.state.user.workshopId !== null) {
      this.query ={workshopId: this.state.user.workshopId};
    } else if(this.state.user.supplierId !== null) {
      this.query ={supplierId: this.state.user.supplierId};
    } else{
      this.query = {};
    }
    this.request.postRequest('/order/list_all', {query: this.query}, (res) => {
      if (res.code === '00') {
        this.setState({orderList: res.data});
        this.setState({orderPending: _.filter(res.data, {status: 'PENDING'})});
        this.setState({orderApproved: _.filter(res.data, {status: 'APPROVED'})});
      }
    });
  }
    onAddOrder() {
      this.setState({
        large: !this.state.large,
      });
    }
    onViewOrder() {
      vm.setState({
        view_order: !vm.state.view_order,
      });
    }
    handleOriginal(order) {
      if (_.findIndex(vm.permissions, {code: 'UM-MENU-ORDER-APPROVE'}) >= 0 && order !==null&& order.status !=='APPROVED' && order.workshop.status ==='ACTIVE') {
        vm.setState({showApprove: true});
      } else {
        vm.setState({showApprove: false});
      }
      this.setState({selectedRow: order});
      this.onViewOrder();
    }
    onApproveOrder() {
      if (vm.state.user.branchId !== null && vm.state.user.branch !== null){
      vm.state.selectedRow.branchId = vm.state.user.branch.id;
      vm.state.selectedRow.approvedId = vm.state.user.id;
      vm.state.selectedRow.approvedDate = new Date();
      vm.state.selectedRow.status = 'APPROVED'
  
  
      vm.request.postRequest('/order/edit', {order: vm.state.selectedRow}, (res) => {
        if (res.code === '00') {
          vm.setState({selectedRow: null});
          vm.onViewOrder();
          vm.getOrders();
        }
      });
    }
    }
  onSaveOrder() {
    if (this.state.user.workshopId !== null && this.state.supplier !== null){
    this.state.workshopId = this.state.user.workshopId;
    this.state.supplierId = this.state.supplier.id;
    this.state.requestedId = this.state.user.id;
    this.request.postRequest('/order/create', {order: this.state}, (res) => {
      if (res.code === '00') {
        this.onAddOrder();
        this.getOrders();
      }
    });
  }
  }

  render() {

    const { orderList } = this.state;
    const columnsPending = [{
      Header: 'Pending Orders',
      columns:  [{
      Header: 'Order Number',
      accessor: 'order_no' // String-based value accessors!
    }, {
      Header: 'Quote Number',
      accessor: 'quoteNumber'
    }, {
      Header: 'Quote Total',
      accessor: 'quoteValue',
      Cell: props => <CurrencyFormat value={props.value} displayType={'text'} thousandSeparator={true} prefix={'R '} suffix={props.value.lastIndexOf('.')< 0 ?'.00': null} renderText={value => <div>{value}</div>} />
    }, {
      id: 'pendingSupplierName', // Required because our accessor is not a string
      Header: 'Supplier Name',
      accessor: order => order.supplier.name // Custom value accessors!
    }, {
      id: 'pendingRequestedBy', // Required because our accessor is not a string
      Header: 'Requested By',
      accessor: order => order.requested.fullName // Custom value accessors!
    }, {
      Header: 'Requested Date',
      accessor: 'createdAt',
      filterable: false,
      Cell: props => <span className='date'>{moment(props.value).format('YYYY-MM-DD HH:mm:ss')}</span>
    }, 
    {
      Header: 'View',
      show: this.state.showView,
      accessor: 'workshop',
      filterable: false,
      Cell: props =><i className="fa fa-eye">View</i>,
      getProps: (state, rowInfo) => ({
        onClick: () => this.handleOriginal(rowInfo.original)
      })}
  ]
}]
    const columnsApproved = [{
    Header: 'Approved Orders',
    columns: [
      {
      Header: 'Order Number',
      accessor: 'order_no' // String-based value accessors!
      }, {
        Header: 'Quote Number',
        accessor: 'quoteNumber',
      }, {
        Header: 'Quote Total',
        accessor: 'quoteValue',
        Cell: props => <CurrencyFormat value={props.value} displayType={'text'} thousandSeparator={true} prefix={'R '} suffix={props.value.lastIndexOf('.')< 0 ?'.00': null} renderText={value => <div>{value}</div>} />
      }, {
        id: 'approvedSupplierName', // Required because our accessor is not a string
        Header: 'Supplier Name',
        accessor: order => order.supplier.name // Custom value accessors!
      }, {
        id: 'approvedRequestedBy', // Required because our accessor is not a string
        Header: 'Requested By',
        accessor: order => order.requested.fullName // Custom value accessors!
      },{
        Header: 'Requested Date',
        accessor: 'createdAt',
        filterable: false,
        Cell: props => <span className='date'>{moment(props.value).format('YYYY-MM-DD HH:mm:ss')}</span>
      }, {
        id: 'approvedBy', // Required because our accessor is not a string
        Header: 'Approved By',
        accessor: order => order.approved.fullName // Custom value accessors!
      }, {
        Header: 'Approved Date',
        accessor: 'approvedDate',
        filterable: false,
        Cell: props => <span className='date'>{moment(props.value).format('YYYY-MM-DD HH:mm:ss')}</span>
      }, 
      {
        Header: 'View',
        show: this.state.showView,
        filterable: false,
        Cell: props => <i className="fa fa-eye">View</i>,
        getProps: (state, rowInfo) => ({
          onClick: () => this.handleOriginal(rowInfo.original)
        })}
    ]
  }]

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i> Orders
              </CardHeader>
              <CardBody>
                <Button color="primary" hidden={!this.state.showAdd} onClick={this.onAddOrder} className="px-4">Add Order</Button>
               <p></p>
                <Modal style={{overflow: 'auto'}} isOpen={this.state.large} toggle={this.onAddOrder}
                       className={'modal-lg '}>
                  <ModalHeader toggle={this.onAddOrder}>Add Order</ModalHeader>
                  <ModalBody>
                  {/* <WizardStep isShowStepBar={true}> */}
                    <OrderDetails details={this.state} handleChange={this.handleChange}  isEdit={true}/>
                    {/* <AssignRole details={this.state} handleChange={this.handleChange} />
                    <AssignBranch details={this.state} handleChange={this.handleChange} />
                  </WizardStep> */}
                  </ModalBody>
                  <ModalFooter>
                    <Button color="primary" hidden={!this.state.showAdd} onClick={this.onSaveOrder}>Save</Button>
                    <Button color="secondary" onClick={this.onAddOrder}>Cancel</Button>
                  </ModalFooter>
                </Modal>
                <Modal style={{overflow: 'auto'}} isOpen={this.state.view_order} toggle={this.onViewOrder}
                        className={'modal-lg '}>
                  <ModalHeader toggle={this.onViewOrder}>Order</ModalHeader>
                  <ModalBody>
                  <OrderDetails details={this.state.selectedRow} handleChange={this.handleChange} isEdit={false} />
                  </ModalBody>
                  <ModalFooter>
                    
                  <Button color="primary" hidden={!this.state.showApprove} onClick={this.onApproveOrder}>Approve</Button>
                    <Button color="secondary" onClick={this.onViewOrder}>Cancel</Button>
                  </ModalFooter>
                </Modal>
                {/* <Table responsive hover>
                  <thead>
                    <tr>
                      <th scope="col">Order Number</th>
                      <th scope="col">Quote Number</th>
                      <th scope="col">Quote Total</th>
                      <th scope="col">Supplier Name</th>
                      <th scope="col">Requested By</th>
                      <th scope="col">Requested Date</th>
                      <th scope="col">Approved By</th>
                      <th scope="col">Approved Date</th>
                      <th scope="col">Status</th>
                      <th scope="col"  hidden={!this.state.showView}>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderList.map((order, index) =>
                      <OrderRow key={index} order={order} showView={this.state.showView}/>
                    )}
                  </tbody>
                </Table> */}
                
                <ReactTable
                  data={this.state.orderPending}
                  columns={columnsPending}
                  defaultPageSize ={5}
                  style={{color: 'white'}}
                  className="-striped -highlight"
                  filterable
                />
                <br />
                <ReactTable
                  data={this.state.orderApproved}
                  columns={columnsApproved}
                  defaultPageSize ={5}
                  style={{color: 'white'}}
                  className="-striped -highlight"
                  filterable
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Orders;
