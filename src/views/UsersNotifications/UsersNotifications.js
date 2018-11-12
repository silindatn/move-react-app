import React, { Component } from 'react';
import { Badge, Card, CardBody, CardHeader, Col, Row, Table } from 'reactstrap';
import { RequestService } from '../../shared/services/request.service';
import * as _ from 'lodash';
import ReactTable from 'react-table';
import * as moment from 'moment';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@atlaskit/tooltip';

import Select, { components } from 'react-select';

function UsersNotificationRow(props) {
  const notification = props.notification;

  const getBadge = (status) => {
    return status === 'ACTIVE' ? 'success' :
      status === 'INACTIVE' ? 'secondary' :
      status === 'PENDING' ? 'warning' :
        status === 'FAILED' ? 'danger' :
            'primary'
  }

  return (
    <tr key={notification.id}>
        <th scope="row">{notification.id}</th>
        <td>{notification.msisdn}</td>
        {/* <td>{notification.user.fullName}</td> */}
        <td>{notification.type}</td>
        <td>{notification.message}</td>
        <td><Badge color={getBadge(notification.status)}>{notification.status}</Badge></td>
    </tr>
  )
}

class UsersNotifications extends Component {
  constructor(props) {
    super(props)
    this.state = {
      notificationList: []
    };
    this.request = new RequestService();
    this.query = {};
  }

  componentWillMount() {
    this.getUsersNotification();
  }
  getBadge = (status) => {
    return status === 'ACTIVE' ? 'success' :
      status === 'INACTIVE' ? 'secondary' :
      status === 'PENDING' ? 'warning' :
        status === 'FAILED' ? 'danger' :
            'primary'
  }
  getUsersNotification() {
    this.request.postRequest('/user/list_all_not', {query: this.query}, (res) => {
      if (res.code === '00') {
        this.setState({notificationList: res.data});
      }
    });
  }

  render() {    
  const columns =[{
    Header: 'ID',
    accessor: 'id' // String-based value accessors!
  }, {
    Header: 'Contact',
    accessor: 'msisdn'
  }, {
    Header: 'Notification Type',
    accessor: 'type'
  },{
    Header: 'Message',
    accessor: 'message'
  },
  {
    Header: 'Status',
    accessor: 'status',
    filterable: false,
    Cell: supplier =><Badge color={this.getBadge(supplier.value)}>{supplier.value}</Badge>
  }, 
  // {
  //   Header: 'View',
  //   show: this.state.showView,
  //   accessor: 'supplier',
  //   filterable: false,
  //   Cell: props =><SimpleMenu supplier={props.original} getSupplier={this.getSupplier}/>,
  // }
]

    const { notificationList } = this.state;
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i> User(s) Notifications
              </CardHeader>
              <CardBody>
              <ReactTable
                  data={this.state.notificationList}
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
                      <th scope="col">Contact</th>
                      <th scope="col">Full Name</th>
                      <th scope="col">Notification Type</th>
                      <th scope="col">Message</th>
                      <th scope="col">status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notificationList.map((notification, index) =>
                      <UsersNotificationRow key={index} notification={notification}/>
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

export default UsersNotifications;
