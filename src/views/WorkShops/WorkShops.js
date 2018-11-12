import React, { Component } from 'react';
import { Badge, Card, CardBody, CardHeader, Col, Row, Table, Button, Modal, ModalBody, ModalFooter, ModalHeader, Input, InputGroup, InputGroupAddon, InputGroupText, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
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
    return <components.Input {...props} />;
  }
  return (
    <div style={{ border: `1px dotted black` }}>
      <Tooltip content={'Custom Input'}>
        <components.Input {...props} />
      </Tooltip>
    </div>
  );
};


class SimpleMenu extends Component {
  constructor(props) {
    super(props)
    this.state = props.workshop;
    console.log(this.state);
    this.state['anchorEl'] = null,
      this.state['edit'] = false,
      this.state['view_workshop'] = false;
    this.state['showAdd'] = false;
    this.state['showApprove'] = false;
    this.state['showView'] = false;
    this.state['user'] = JSON.parse(sessionStorage.getItem('user'));
    this.handleChange = this.handleChange.bind(this);
    this.onEditWorkshop = this.onEditWorkshop.bind(this);
    this.onViewWorkshop = this.onViewWorkshop.bind(this);
    this.onSaveEditWorkshop = this.onSaveEditWorkshop.bind(this);
    this.onApproveWorkshop = this.onApproveWorkshop.bind(this);
    this.getWorkShop = props.getWorkShop;
    this.permissions = JSON.parse(sessionStorage.getItem('permissions'));
    this.request = new RequestService();
  }
  componentDidMount() {
    // if (_.findIndex(this.permissions, {code: 'UM-MENU-ADD-ORDER'}) >= 0) {
    //   this.setState({showAdd: true});
    // }
    // if (_.findIndex(this.permissions, {code: 'UM-MENU-ORDER-APPROVE'}) >= 0 && this.props.workshop.status !=='APPROVED') {
    //   this.setState({showApprove: true});
    // }
    // if (_.findIndex(this.permissions, {code: 'UM-MENU-ORDER-VIEW'}) >= 0) {
    //   this.setState({showView: true});
    // }
  }
  onSaveEditWorkshop() {
    this.request.postRequest('/workshop/edit', { workshop: this.state }, (res) => {
      if (res.code === '00') {
        this.onEditWorkshop();
        this.getWorkShop();
      }
    });
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }
  onEditWorkshop() {
    this.handleClose();
    this.setState({
      edit: !this.state.edit,
    });
  }
  onViewWorkshop() {
    this.handleClose();
    this.setState({
      view_workshop: !this.state.view_workshop,
    });
  }

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };
  onApproveWorkshop() {
    if (this.state.user.branchId !== null && this.state.user.branch !== null) {
      this.state.branchId = this.state.user.branch.id;
      this.state.approvedId = this.state.user.id;
      this.state.approvedDate = new Date();
      this.state.status = 'APPROVED'


      this.request.postRequest('/workshop/edit', { workshop: this.state }, (res) => {
        if (res.code === '00') {
          this.props.alert.show('Order has been Successfully created', {
            type: 'success'
          })
          this.onViewWorkshop();
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
        <Modal style={{ overflow: 'auto' }} isOpen={this.state.edit} toggle={this.onEditWorkshop}
          className={'modal-lg '}>
          <ModalHeader toggle={this.onEditWorkshop}>Edit Workshop Information</ModalHeader>
          <ModalBody>
            <WorkShopDetails details={this.state} handleChange={this.handleChange} isEdit={true} isUpdate={true} />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.onSaveEditWorkshop}>Save</Button>
            <Button color="secondary" onClick={this.onEditWorkshop}>Cancel</Button>
          </ModalFooter>
        </Modal>
        <Modal style={{ overflow: 'auto' }} isOpen={this.state.view_workshop} toggle={this.onViewWorkshop}
          className={'modal-lg '}>
          <ModalHeader toggle={this.onViewWorkshop}>View Workshop</ModalHeader>
          <ModalBody>
            <WorkShopDetails details={this.state} handleChange={this.handleChange} isEdit={false} isUpdate={false} />
          </ModalBody>
          <ModalFooter>

            <Button color="primary" hidden={!this.state.showApprove} onClick={this.onApproveWorkshop}>Approve</Button>
            <Button color="secondary" onClick={this.onViewWorkshop}>Cancel</Button>
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
          <MenuItem onClick={this.onEditWorkshop}><i className="fa fa-edit">Edit Information</i></MenuItem>
          {/* <MenuItem onClick={this.onViewWorkshop}><i className="fa fa-eye">Chnage Status</i></MenuItem> */}
          {/* <MenuItem hidden={!this.state.showAdd} onClick={this.onEditWorkshop}><i className="fa fa-edit fa-2x"></i></MenuItem>
          <MenuItem hidden={!this.state.showView} onClick={this.onViewWorkshop}><i className="fa fa-eye fa-2x "></i></MenuItem> */}
        </Menu>
      </div>
    );
  }
}
// export default withAlert(SimpleMenu);
class WorkShopDetails extends Component {
  constructor(props) {
    super(props)

    this.state = props.details;
    this.state['isEdit'] = props.isEdit;
    this.state['isUpdate'] = props.isUpdate;
    this.state['dropdownOpen'] = false;
    this.state['statusList'] = [
      { value: 'ACTIVE', label: 'ACTIVE' }, { value: 'ONHOLD', label: 'ONHOLD' }]
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
    this.setState({ ['status']: e.value });
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

class WorkShops extends Component {
  constructor(props) {
    super(props)
    this.state = {
      large: false,
      name: '',
      telephone: '',
      search: '',
      Address: {
        streetAddress: '',
        city: '',
        province: '',
        postalCode: ''
      },
      channel: 'portal',
      showAdd: false,
      showSearch: false,
      showAll: false,
      showView: false,
      permissions: [],
      workshopList: []
    };
    vm = this;
    this.onAddWorkShop = this.onAddWorkShop.bind(this);
    this.onSearchWorkShop = this.onSearchWorkShop.bind(this);
    this.permissions = JSON.parse(sessionStorage.getItem('permissions'));
    this.user = JSON.parse(sessionStorage.getItem('user'));
    this.request = new RequestService();
    this.query = null;
  }

  componentWillMount() {
    if (_.findIndex(this.permissions, { code: 'UM-MENU-WORK-SHOP-VIEW-ALL' }) >= 0) {
      this.query = {};
      this.getWorkShop();
    }
  }
  componentDidMount() {
    if (_.findIndex(this.permissions, { code: 'UM-MENU-ADD-WORK-SHOP' }) >= 0) {
      this.setState({ showAdd: true });
    }
    if (_.findIndex(this.permissions, { code: 'UM-MENU-WORK-SHOP-SEARCH' }) >= 0) {
      this.setState({ showSearch: true });
    }
    if (_.findIndex(this.permissions, { code: 'UM-MENU-WORK-SHOP-VIEW' }) >= 0) {
      this.setState({ showView: true });
    }
    if (_.findIndex(this.permissions, { code: 'UM-MENU-WORK-SHOP-VIEW-ALL' }) >= 0) {
      this.setState({ showAll: true });
    }
  }
  onAddWorkShop() {
    this.setState({
      large: !this.state.large,
    });
  }
  onSearchWorkShop() {
    if (this.state.showAll && this.state.search === '') {
      this.query = {};
      this.getWorkShop();
    } else if (this.state.search !== '') {
      this.query = {
        id: this.state.search
      }
      this.getWorkShop();
    }
  }
  handleChange(e) {
    const { name, value } = e.target;
    vm.setState({ [name]: value });
  }
  getWorkShop() {
    vm.request.postRequest('/workshop/list_all', { query: vm.query }, (res) => {
      if (res.code === '00') {
        vm.setState({ workshopList: res.data });
      }
    });
  }
  getBadge = (status) => {
    return status === 'ACTIVE' ? 'success' :
      status === 'INACTIVE' ? 'secondary' :
        'primary'
  }


  render() {
    const columns = [{
      show: this.user.supplier === null,
      Header: 'Kerridge AR',
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
      accessor: workshop => workshop.address.streetAddress // Custom value accessors!
    }, {
      id: 'city', // Required because our accessor is not a string
      Header: 'City',
      accessor: workshop => workshop.address.city // Custom value accessors!
    }, {
      id: 'province', // Required because our accessor is not a string
      Header: 'Province',
      accessor: workshop => workshop.address.province // Custom value accessors!
    },
    {
      Header: 'Status',
      accessor: 'status',
      filterable: false,
      Cell: workshop => <Badge color={this.getBadge(workshop.value)}>{workshop.value}</Badge>
    },
    {
      Header: 'View',
      show: this.state.showView,
      accessor: 'workshop',
      filterable: false,
      Cell: props => <SimpleMenu workshop={props.original} getWorkShop={this.getWorkShop} />,
    }
    ]

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i> WorkShops
              </CardHeader>
              <CardBody>
                <Row>
                  <Col xl={3} hidden={!this.state.showAdd}>
                    <Button color="primary" onClick={this.onAddWorkShop} className="px-4">Add WorkShop</Button>
                  </Col>
                  <Col xl={6} hidden={!this.state.showSearch}>
                    <InputGroup className="mb-3" style={{ width: 350 }}>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          Move ID
                    </InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" name='search' value={this.state.search} onChange={this.handleChange} placeholder="Workshop Id" />
                      <InputGroupAddon addonType="append">
                        {/* <InputGroupText> */}
                        <Button color="primary" disabled={this.state.search === ''} onClick={this.onSearchWorkShop} className="px-4">Search</Button>
                        {/* </InputGroupText> */}
                      </InputGroupAddon>
                    </InputGroup>
                  </Col>
                </Row>
                <p></p>
                <Modal style={{ overflow: 'auto' }} isOpen={this.state.large} toggle={this.onAddWorkShop}
                  className={'modal-lg '}>
                  <ModalHeader toggle={this.onAddWorkShop}>Add Workshop</ModalHeader>
                  <ModalBody>
                    <WorkShopDetails details={this.state} handleChange={this.handleChange} isEdit={true} isUpdate={false} />
                  </ModalBody>
                  <ModalFooter>
                    <Button color="secondary" onClick={this.onAddWorkShop}>Cancel</Button>
                  </ModalFooter>
                </Modal>
                <ReactTable
                  data={this.state.workshopList}
                  columns={columns}
                  defaultPageSize={5}
                  style={{ color: 'white' }}
                  // SubComponent={row => {
                  //   return (
                  //     <SimpleMenu workshop={row}/>
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
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.workshopList.map((workshop, index) =>
                      <WorkShopRow key={index} workshop={workshop}/>
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

export default withAlert(WorkShops);