const Mock = require('mockjs');
Mock.mock('/info/pv', 'get', require('./pv.json'));
