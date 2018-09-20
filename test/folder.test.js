const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const {
  TEST_MONGODB_URI
} = require('../config');

const Folder = require('../models/folder');

const {
  folders
} = require('../db/seed/folders');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Folder Router Tests', () => {
  before(function() {
    return mongoose.connect(TEST_MONGODB_URI, {
        useNewUrlParser: true
      })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return Folder.insertMany(folders);
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  const req = (method, endpoint) => {
    method = method.toLowerCase();
    return chai.request(app)[method]('/api/folders' + endpoint);
  };


  const validateFields = (res, expectedFields) => {
    const response = res.body;
    if (typeof response === 'object') {
      if (Array.isArray(response)) {
        for (const item of response) {
          expect(item).to.have.keys(expectedFields);
        }
      } else expect(response).to.have.keys(expectedFields);
    }
  };
  const expectedFields = ['id', 'name', 'createdAt', 'updatedAt'];

  describe('GET /api/folders', function() {

    it('should respond with all folders', () => {
      // 1) Call the database **and** the API
      // 2) Wait for both promises to resolve using `Promise.all`
      return Promise.all([
        Folder.find(),
        req('get', '/')
      ])
        // 3) then compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          validateFields(res, expectedFields);
        });
    });

    it('should sort folders by name', () => {
      return req('get', '/')
        .then((dbRes) => {
          expect(dbRes.body.map(item => item.name)).to.eql(['Archive', 'Drafts', 'Personal', 'Work']);
        });
    });

  });

  // describe('GET /api/folders/:id', function() {

  //   it('should return correct folder by the `id` parameter', function() {
  //     let data;
  //     // 1) First, call the database
  //     return Folder.findOne()
  //       .then(_data => {
  //         data = _data;
  //         // 2) then call the API with the ID
  //         return chai.request(app).get(`/api/folders/${data.id}`);
  //       })
  //       .then((res) => {
  //         expect(res).to.have.status(200);
  //         expect(res).to.be.json;

  //         expect(res.body).to.be.an('object');
  //         validateFields(res, expectedFields);

  //         // 3) then compare database results to API response
  //         expect(res.body.id).to.equal(data.id);
  //         expect(res.body.title).to.equal(data.title);
  //         expect(res.body.content).to.equal(data.content);
  //         expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
  //         expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
  //       });
  //   });

  //   it('should return the expected fields', () => {
  //     // 1) First, call the database
  //     let data;
  //     return Folder.findOne()
  //       .then(_data => {
  //         data = _data;
  //         // 2) then call the API with the ID
  //         return req('get', `/${data.id}`);
  //       })
  //       .then((res) => {
  //         validateFields(res, expectedFields);
  //       });
  //   });

  //   it('should make sure the `id` parameter is a valid ID', () => {
  //     return req('get', '/INVALIDIDHERE')
  //       .then(res => {
  //         expect(res).to.have.status(400);
  //       });
  //   });

  //   it('should 404 if the ID is valid but does not exist in the database', () => {
  //     return req('get', '/faaaaaaaaaaaaaaaaaaaaaaa')
  //       .then(res => {
  //         expect(res).to.have.status(404);
  //       });
  //   });

  // });

  // describe('POST /api/folders', function() {
  //   it('should create and return a new item when provided valid data', function() {
  //     const newItem = {
  //       name: 'TestFolder'
  //     };

  //     let res;
  //     // 1) First, call the API
  //     return chai.request(app)
  //       .post('/api/folders')
  //       .send(newItem)
  //       .then(function(_res) {
  //         res = _res;
  //         expect(res).to.have.status(201);
  //         expect(res).to.have.header('location');
  //         expect(res).to.be.json;
  //         expect(res.body).to.be.a('object');
  //         validateFields(res, expectedFields);
  //         // 2) then call the database
  //         return Folder.findById(res.body.id);
  //       })
  //       // 3) then compare the API response to the database results
  //       .then(data => {
  //         expect(res.body.id).to.equal(data.id);
  //       });
  //   });

  //   it('should return an object with the expected fields', () => {
  //     return req('post', '/')
  //       .send({
  //         title: 'Testing title here!',
  //         content: 'Who needs it?'
  //       })
  //       .then(res => {
  //         expect(res.body).to.be.an('object');
  //         validateFields(res, expectedFields);
  //       });
  //   });

  //   it('should catch duplicate key errors', () => {
  //     return req('post', '/')
  //       .send({
  //         title: 'TestFolder'
  //       })
  //       .then(res => {
  //         expect(res).to.have.status(400);
  //       });
  //   });

  //   it('should return a valid location header with new ID', () => {
  //     req('post', '/')
  //       .send({
  //         title: 'Another test here',
  //         content: 'Who needs it?'
  //       })
  //       .then(res => {
  //         expect(res).to.have.header('Location', /\/api\/folders\/[0-9a-fA-F]{24}/);
  //       });
  //   });

  // });

  // describe('PUT /api/folders/:id', () => {

  //   it('should update a folder by an `id`', () => {
  //     let item;
  //     return Folder.findOne()
  //       .then(res => {
  //         item = res;
  //         return req('put', `/${item.id}`)
  //           .send({
  //             id: item.id,
  //             title: 'Test title!',
  //             content: 'hello world!'
  //           });
  //       })
  //       .then(res => {
  //         validateFields(res, expectedFields);
  //         expect(res.body.id).to.equal(item.id);
  //         expect(res.body.title).to.equal('Test title!');
  //         expect(res.body.content).to.equal('hello world!');
  //       });
  //   });

  //   it('should be able to update a single field', () => {
  //     let item;
  //     return Folder.findOne()
  //       .then(res => {
  //         item = res;
  //         return req('put', `/${item.id}`)
  //           .send({
  //             id: item.id,
  //             content: 'hello world!'
  //           });
  //       })
  //       .then(res => {
  //         validateFields(res, expectedFields);
  //         expect(res.body.id).to.equal(item.id);
  //         expect(res.body.content).to.equal('hello world!');
  //       });
  //   });

  //   it('should require a valid id', () => {
  //     return req('put', '/INVALIDIDHERE')
  //       .send({
  //         id: 'INVALIDIDHERE',
  //         title: 'HEllo!',
  //         content: 'hello world!'
  //       })
  //       .then(res => {
  //         expect(res).to.have.status(400);
  //       });
  //   });

  //   it('should 404 if the id is valid but does not exist in the database', () => {
  //     return req('put', '/faaaaaaaaaaaaaaaaaaaaaaa')
  //       .send({
  //         id: 'faaaaaaaaaaaaaaaaaaaaaaa',
  //         title: 'HEllo!',
  //         content: 'hello world!'
  //       })
  //       .then(res => {
  //         expect(res).to.have.status(404);
  //       });
  //   });

  //   it('should require an id in request body', () => {
  //     return req('put', '/000000000000000000000000')
  //       .send({
  //         title: 'HEllo!',
  //         content: 'hello world!'
  //       })
  //       .then(res => {
  //         expect(res).to.have.status(400);
  //       });
  //   });

  //   it('should require a matching id in both the request query and body', () => {
  //     return req('put', '/faaaaaaaaaaaaaaaaaaaaaaa')
  //       .send({
  //         id: '111111111111111111111110',
  //         title: 'HEllo!',
  //         content: 'hello world!'
  //       })
  //       .then(res => {
  //         expect(res).to.have.status(400);
  //       });
  //   });

  // });

  // describe('DELETE /api/folders/:id', () => {

  //   it('should delete a folder by an `id`', () => {
  //     return req('delete', '/000000000000000000000000')
  //       .then(res => {
  //         expect(res).to.have.status(204);
  //       });
  //   });

  //   it('should require a valid id', () => {
  //     return req('delete', '/00000')
  //       .then(res => {
  //         expect(res).to.have.status(400);
  //       });

  //   });

  //   it('should 404 if the id is valid but does not exist in the database', () => {
  //     return req('delete', '/100000000000000000000000')
  //       .then(res => {
  //         expect(res).to.have.status(404);
  //       });
  //   });

  // });

});