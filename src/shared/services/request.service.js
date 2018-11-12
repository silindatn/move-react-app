import axios from 'axios'
import { environment } from './service.config';

axios.interceptors.request.use(function (config) {

    var token = sessionStorage.getItem('token') || 'notoken';
  
    if (token) {
      config.headers['x-access-token'] = token;
    }
  
    // config.headers['X-Requested-With'] = 'XMLHttpRequest';
    // config.headers['Expires'] = '-1';
    // config.headers['Cache-Control'] = "no-cache,no-store,must-revalidate,max-age=-1,private";
  
    return config;
  
  }, function (err) {
  
    return Promise.reject(err);
  });

export class RequestService {
    customPostRequest(uri, body, callback){
        console.log(uri, body);
        axios.post(uri, body)
        .then((response) => {
            callback(response.data);
        })
        .catch((error) => {
            console.log(error)
            if(error.response) {
                callback({code: error.response.status, message: 'service.request.failed'});
            } else {
                callback({code: '404', message: 'service.request.failed'});
            }
        })
    }
    postRequest(uri, body, callback){

        body['channel'] = environment.portal.channel;
        body['application'] = environment.portal.application;

        axios.post(environment.portal.serverUrl + uri, body)
        .then((response) => {
            callback(response.data);
        })
        .catch((error) => {
            if(error.response) {
                callback({code: error.response.status, message: 'service.request.failed'});
            } else {
                callback({code: '404', message: 'service.request.failed'});
            }
        })
    }
    getRequest(uri, callback) {
        axios.get(environment.portal.serverUrl + uri)
        .then((response) => {
            callback(response);
        })
        .catch((error) => {
            if(error.response) {
                callback({code: error.response.status, message: 'service.request.failed'});
            } else {
                callback({code: '404', message: 'service.request.failed'});
            }
        })
    }
}