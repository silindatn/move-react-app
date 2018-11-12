import React, { Component } from 'react';
import { Badge, Card, CardBody, CardHeader, Col, Row, Table, Button, Modal, ModalBody, ModalFooter, ModalHeader,Input, InputGroup, InputGroupAddon, InputGroupText, Dropdown, DropdownItem,DropdownMenu, DropdownToggle} from 'reactstrap';
import { RequestService } from '../../shared/services/request.service';
import ReactTable from 'react-table';
import * as _ from 'lodash';
import * as moment from 'moment';
import Iframe from 'react-iframe';
import FileBase64 from 'react-file-base64';
import CurrencyFormat from 'react-currency-format';
import * as download from 'downloadjs'
let vm = null;

class OrderDetails extends Component {
  constructor(props) {
    super(props)
  
   this.state = props.details;
   this.handleChange = props.handleChange;
   this.request = new RequestService();
   console.log(this.state);
  }
  componentWillMount() {
    this.getQuoteFiles();
  }
  getInvoiceFiles(file){
    let ap = this;
    this.request.postRequest('/google/upload', file, (res) => {
      if (res.code === '00') {
        ap.setState({purchaseId: res.data.id})
        ap.handleChange({target:{name: 'fileId', value: res.data.id}})
      }
    });
  }
  getQuoteFiles(){
    let ap = this;
    this.request.postRequest('/google/download', {fileId: this.state.fileId}, (res) => {
      if (res.code === '00') {
        ap.setState({file: res.data})
        download("data:application/pdf;base64," + res.data, "download.pdf", "application/pdf");
      }
    });
  }
  render() {
    const fileurl = "https://www.drive.google.com/file/d/" + this.state.fileId + "/preview";
  return (
    <Card className="p-4" style={{height: 500}}>
    <CardHeader>
        <i className="fa fa-align-justify"></i> Quote <small>Date: <b>{this.state.createdAt}</b></small>  <br />
        <small className="row" style={{marginLeft: "2.5em"}}>Quote Total: <b><CurrencyFormat value={this.state.quoteValue} displayType={'text'} thousandSeparator={true} prefix={'R '} suffix={this.state.quoteValue.lastIndexOf('.')< 0 ?'.00': null} renderText={value => <div>{value}</div>} /></b>
        <small className="col" style={{marginLeft: "2.5em"}}>Credit Limit: <b>{this.state.availableCredit}</b></small>
        <small className="col" style={{marginLeft: "2.5em"}}>Member Status: <b>{this.state.workshop.status}</b></small> 
        <small className="col" style={{marginLeft: "2.5em"}}>Supplier Status: <b>{this.state.supplier.status}</b></small> 
        </small> 
    </CardHeader>
    <CardBody>
      {/* <InputGroup className="mb-3" hidden={this.state.invoiceId !== null}>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            Upload Invoice
          </InputGroupText>
        </InputGroupAddon> 
        <FileBase64 className="btn btn-default btn-file" onDone={ this.getInvoiceFiles.bind(this) } />
      </InputGroup> */}
    <Iframe url={fileurl}
            position="absolute"
            width="90%"
            id="approveddoc"
            className="myClassname"
            height="70%"
            allowFullScreen/>
    </CardBody>
    </Card>
  )
}
}

class Orders extends Component {
  constructor(props) {
    super(props)
    this.state = {
      orderList: [],
      selectedRow: null,
      fileId: '',
      showAdd: false,
      showView: false,
      showApprove: false,
      view_order: false,
      user: JSON.parse(sessionStorage.getItem('user')),
      type: ''
    };

    vm = this;
    this.permissions = JSON.parse(sessionStorage.getItem('permissions'));
    this.handleOriginal = this.handleOriginal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.request = new RequestService();
    this.query = {status: 'APPROVED'};
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
    if(this.state.user.workshopId !== null) {
      this.query['workshopId'] = this.state.user.workshopId;
    } else if(this.state.user.supplierId !== null) {
      this.query['supplierId'] = this.state.user.supplierId;
    }
    this.request.postRequest('/order/list_all', {query: this.query, type: 'invoiced'}, (res) => {
      if (res.code === '00') {
        this.setState({orderList: res.data});
      }
    });
  }
    onViewOrder() {
      vm.setState({
        view_order: !vm.state.view_order,
      });
    }
    handleOriginal(order, type) {

      order['fileId'] = '';
      order['file'] = 'data:application/pdf;base64,';
      if(type === 'purchaseId') {
        order.fileId  =order.purchaseId;
      } else if(type === 'invoiceId') {
        order.fileId = order.invoiceId;
      } else{
        order.fileId  = order.quoteId;
      }
      if (order.invoiceId === null) {
        vm.setState({showApprove: true});
      } else {
        vm.setState({showApprove: false});
      }
      this.setState({selectedRow: order});
      this.setState({type: type});
      this.onViewOrder();
    }
    onApproveOrder() {
      if (vm.state.user.supplier !== null && vm.state.user.supplierId !== null){
      vm.state.selectedRow.invoiceId = vm.state.fileId;
  
      vm.request.postRequest('/order/edit', {order: vm.state.selectedRow}, (res) => {
        if (res.code === '00') {
          vm.setState({selectedRow: null});
          vm.onViewOrder();
          vm.getOrders();
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
      Header: 'Quote',
      show: this.state.quoteId !== null,
      accessor: 'quoteId',
      filterable: false,
      Cell: props =><i className="fa fa-eye" hidden={props.value === null}>View</i>,
      getProps: (state, rowInfo) => ({
        onClick: () => this.handleOriginal(rowInfo.original, 'quoteId')
      })}, 
      {
        Header: 'Purchase Order',
        show: this.state.purchaseId !== null,
        accessor: 'purchaseId',
        filterable: false,
        Cell: props =><i className="fa fa-eye"  hidden={props.value === null}>View</i>,
        getProps: (state, rowInfo) => ({
          onClick: () => this.handleOriginal(rowInfo.original, 'purchaseId')
        })}, 
        {
          Header: 'Invoice',
          show: this.state.invoiceId !== null,
          accessor: 'invoiceId',
          filterable: false,
          Cell: props =><i className="fa fa-eye" hidden={props.value === null}>View</i>,
          getProps: (state, rowInfo) => ({
            onClick: () => this.handleOriginal(rowInfo.original, 'invoiceId')
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
                <Modal style={{overflow: 'auto'}} isOpen={this.state.view_order} toggle={this.onViewOrder}
                        className={'modal-lg '}>
                  <ModalHeader toggle={this.onViewOrder}>Order</ModalHeader>
                  <ModalBody>
                  <OrderDetails details={this.state.selectedRow} handleChange={this.handleChange} type={this.state.type}/>
                  </ModalBody>
                  <ModalFooter>
                    
                  <Button color="primary" hidden={!this.state.showApprove} onClick={this.onApproveOrder}>Approve</Button>
                    <Button color="secondary" onClick={this.onViewOrder}>Cancel</Button>
                  </ModalFooter>
                </Modal>                
                <ReactTable
                  data={this.state.orderList}
                  columns={columnsPending}
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
