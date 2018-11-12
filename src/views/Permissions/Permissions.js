import React, { Component } from 'react';
import { Badge, Card, CardBody, CardHeader, Col, Row, Table, Button, Modal, ModalBody, ModalFooter, ModalHeader,Input, InputGroup, InputGroupAddon, InputGroupText, } from 'reactstrap';
import { RequestService } from '../../shared/services/request.service';
import * as _ from 'lodash';
import ReactTable from 'react-table';
import * as moment from 'moment';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@atlaskit/tooltip';

import Select, { components } from 'react-select';

let vm = null;

function PermissionRow(props) {
  const permission = props.permission
  const permissionLink = `#/permissions/${permission.id}`

  const getBadge = (status) => {
    return status === 'ACTIVE' ? 'success' :
      status === 'INACTIVE' ? 'warning' :
            'primary'
  }
  return (
    <tr key={permission.id.toString()}>
        <th scope="row">{permission.id}</th>
        <td>{permission.code}</td>
        <td>{permission.category}</td>
        <td>{permission.type}</td>
        <td>{permission.menu}</td>
        <td>{permission.channel}</td>
        {/* <td><Badge href={permissionLink} color={getBadge(permission.status)}>{permission.status}</Badge></td> */}
    </tr>
  )
}
class PermissionDetails extends Component {
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
    <Card className="p-4">
    <CardBody>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            Code
          </InputGroupText>
        </InputGroupAddon>
        <Input type="text" name='code' value={this.state.code} onChange={this.handleChange} placeholder="Code" />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            Category
          </InputGroupText>
        </InputGroupAddon>
        <Input type="text" name='category' value={this.state.category} onChange={this.handleChange} placeholder="Category" />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            Type
          </InputGroupText>
        </InputGroupAddon>
        <Input type="text" name='type' value={this.state.type} onChange={this.handleChange} placeholder="Type" />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            Menu
          </InputGroupText>
        </InputGroupAddon>
        <Input type="text" name='menu' value={this.state.menu} onChange={this.handleChange} placeholder="Menu" />
      </InputGroup>
    </CardBody>
  </Card>
  )
}
}

class Permissions extends Component {
  constructor(props) {
    super(props)
    this.state = {
      large: false,
      permissionList: [],
      code: '',
      category:  '',
      type:  '',
      menu:  '',
      channel:  'portal',
      system: 'no'
    };
    vm = this;
    this.onAddPermission = this.onAddPermission.bind(this);
    this.onSavePermission = this.onSavePermission.bind(this);
    this.request = new RequestService();
    this.query = {};
  }

  componentWillMount() {
    this.getPermissions();
  }
  handleChange(e) {
    const { name, value } = e.target;
    vm.setState({ [name]: value });
  }
  onAddPermission() {
    this.setState({
      large: !this.state.large,
    });
  }
  onSavePermission() {
    this.request.postRequest('/permission/create', {permission: this.state}, (res) => {
      if (res.code === '00') {
        this.onAddPermission();
        this.getPermissions();
      }
    });
  }
  getPermissions() {
    this.request.postRequest('/permission/list_all', {query: this.query}, (res) => {
      if (res.code === '00') {
        this.setState({permissionList: res.data});
      }
    });
  }

  render() {

    const columns =[{
      Header: 'ID',
      accessor: 'id' // String-based value accessors!
    }, {
      Header: 'Code',
      accessor: 'code'
    }, {
      Header: 'Category',
      accessor: 'category'
    }, {
      Header: 'Type',
      accessor: 'type'
    },{
      Header: 'Menu',
      accessor: 'menu'
    },{
      Header: 'System',
      accessor: 'channel'
    },
    // {
    //   Header: 'Status',
    //   accessor: 'status',
    //   filterable: false,
    //   Cell: supplier =><Badge color={this.getBadge(supplier.value)}>{supplier.value}</Badge>
    // }, 
    // {
    //   Header: 'View',
    //   show: this.state.showView,
    //   accessor: 'supplier',
    //   filterable: false,
    //   Cell: props =><SimpleMenu supplier={props.original} getSupplier={this.getSupplier}/>,
    // }
  ]
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i> Permissions
              </CardHeader>
              <CardBody>
                <Button color="primary" onClick={this.onAddPermission} className="px-4">Add Permission</Button>
               <p></p>
                <Modal style={{overflow: 'auto'}} isOpen={this.state.large} toggle={this.onAddPermission}
                       className={'modal-lg '}>
                  <ModalHeader toggle={this.onAddPermission}>Add Permission</ModalHeader>
                  <ModalBody>
                    <PermissionDetails details={this.state} handleChange={this.handleChange} />
                  </ModalBody>
                  <ModalFooter>
                    <Button color="primary" onClick={this.onSavePermission}>Save</Button>
                    <Button color="secondary" onClick={this.onAddPermission}>Cancel</Button>
                  </ModalFooter>
                </Modal>

                <ReactTable
                  data={this.state.permissionList}
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
                      <th scope="col">Code</th>
                      <th scope="col">Catergory</th>
                      <th scope="col">Type</th>
                      <th scope="col">Menu</th>
                      <th scope="col">System</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.permissionList.map((permission, index) =>
                      <PermissionRow key={index} permission={permission}/>
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

export default Permissions;
