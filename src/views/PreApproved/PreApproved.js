import React, { Component } from 'react';
import { Badge, Card, CardBody, CardHeader, Col, Row, Table, Button, Modal, ModalBody, ModalFooter, ModalHeader,Input, InputGroup, InputGroupAddon, InputGroupText, Dropdown, DropdownItem,DropdownMenu, DropdownToggle} from 'reactstrap';
import { RequestService } from '../../shared/services/request.service';
import ReactTable from 'react-table';
import * as _ from 'lodash';
import * as moment from 'moment';
import Iframe from 'react-iframe';
import FileBase64 from 'react-file-base64';
import { withAlert } from 'react-alert'
import CurrencyFormat from 'react-currency-format';
import * as download from 'downloadjs'

let vm = null;

class OrderDetails extends Component {
  constructor(props) {
    super(props)
  
   this.state = props.details;
   this.handleChange = props.handleChange;
   this.download = this.download.bind(this);
   this.state['file'] = 'data:application/pdf;base64,';
   this.request = new RequestService();
   console.log(this.state);
  }
  componentWillMount() {
    this.getQuoteFiles();
  }
  getPurchaseFiles(file){
    let om = this;
    this.request.postRequest('/google/upload', file, (res) => {
      if (res.code === '00') {
        om.setState({purchaseId: res.data.id})
        om.handleChange({target:{name: 'fileId', value: res.data.id}})
      }
    });
  }
  getQuoteFiles(){
    let om = this;
    this.request.postRequest('/google/download', {fileId: this.state.quoteId}, (res) => {
      if (res.code === '00') {
        om.setState({file: res.data})
        // window.location.href="data:application/pdf;base64," + res.data;
        download("data:application/pdf;base64," + res.data, "download.pdf", "application/pdf");
      }
    });
  }
  download() {
    // fake server request, getting the file url as response
    setTimeout(() => {
      // server sent the url to the file!
      // now, let's download:
      window.location.href = this.state.file;
      // you could also do:
      // window.open(response.file);
    }, 100);
  }
  render() {
    const fileurl = "https://www.drive.google.com/file/d/" + this.state.quoteId + "/view";
    // const fileurl = "https://drive.google.com/viewer?srcid=" + this.state.quoteId + "&pid=explorer&efh=false&a=v&chrome=false&embedded=true";
    // const fileurl = "https://docs.google.com/viewer?srcid=" + this.state.quoteId + "&pid=explorer&efh=false&a=v&chrome=false&embedded=true"
  return (
    <Card className="p-4" style={{height: 500}}>
    <CardHeader>
        <i className="fa fa-align-justify"></i> Quote <small>Date: <b>{this.state.createdAt}</b></small> <br />
        <small className="row" style={{marginLeft: "2.5em"}}>Quote Total: <b><CurrencyFormat value={this.state.quoteValue} displayType={'text'} thousandSeparator={true} prefix={'R '} suffix={this.state.quoteValue.lastIndexOf('.')< 0 ?'.00': null} renderText={value => <div>{value}</div>} /></b>
        <small className="col" style={{marginLeft: "2.5em"}}>Credit Limit: <b>{this.state.availableCredit}</b></small>
        <small className="col" style={{marginLeft: "2.5em"}}>Member Status: <b>{this.state.workshop.status}</b></small> 
        <small className="col" style={{marginLeft: "2.5em"}}>Supplier Status: <b>{this.state.supplier.status}</b></small> 
        </small> 
    </CardHeader>
    <CardBody>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            Upload Purchase Order
          </InputGroupText>
        </InputGroupAddon> 
        <FileBase64 className="btn btn-default btn-file" onDone={ this.getPurchaseFiles.bind(this) } />
      </InputGroup>
      {/* <button onClick={this.download}>Download file </button> */}
      <iframe src={fileurl} width="660" height="340"></iframe>
      {/* {<object data={fileurl} width="660" height="340">
          <embed src={fileurl} width="660" height="340"> </embed>
          Error: Embedded data could not be displayed.
      </object>} */}
    {/* <Iframe url={'data:application/pdf;base64,' + this.state.file}
            position="absolute"
            width="90%"
            id="preapproveddoc"
            className="myClassname"
            height="70%"
            allowFullScreen/> */}
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
    };

    vm = this;
    this.permissions = JSON.parse(sessionStorage.getItem('permissions'));
    this.handleOriginal = this.handleOriginal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.request = new RequestService();
    this.query = {status: 'PRE-APPROVED'};
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
    this.request.postRequest('/order/list_all', {query: this.query}, (res) => {
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
      if (vm.state.user.branch !== null && vm.state.user.branchId !== null){
      vm.state.selectedRow.branchId = vm.state.user.branch.id;
      vm.state.selectedRow.purchaseId = vm.state.fileId;
      vm.state.selectedRow.approvedId = vm.state.user.id;
      vm.state.selectedRow.approvedDate = new Date();
      vm.state.selectedRow.status = 'APPROVED'
  
      vm.request.postRequest('/order/edit', {order: vm.state.selectedRow}, (res) => {
        if (res.code === '00') {
          vm.setState({selectedRow: null});
          vm.onViewOrder();
          vm.getOrders();
          vm.props.alert.show('Order has been Successfully created', {
            type: 'success'
          })
        } else {
          vm.props.alert.show('Order not created!', {
            type: 'error'
          })
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
      show: this.state.showView,
      accessor: 'workshop',
      filterable: false,
      Cell: props =><i className="fa fa-eye">View</i>,
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
                <Modal style={{overflow: 'auto'}} isOpen={this.state.view_order} toggle={this.onViewOrder}
                        className={'modal-lg '}>
                  <ModalHeader toggle={this.onViewOrder}>Order</ModalHeader>
                  <ModalBody>
                  <OrderDetails details={this.state.selectedRow} handleChange={this.handleChange}/>
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

export default withAlert(Orders);
