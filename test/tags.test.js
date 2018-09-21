const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const {
  TEST_MONGODB_URI
} = require('../config');

const Tag = require('../models/tag');

const {
  tags
} = require('../db/seed/tags');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Tag Router Tests', () => {
  before(function() {
    return mongoose.connect(TEST_MONGODB_URI, {
        useNewUrlParser: true
      })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return Tag.insertMany(tags).then(() => Tag.createIndexes());
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  const req = (method, endpoint) => {
    method = method.toLowerCase();
    return chai.request(app)[method]('/api/tags' + endpoint);
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

  describe('GET /api/tags', function() {

    it('should respond with all tags', () => {
      // 1) Call the database **and** the API
      // 2) Wait for both promises to resolve using `Promise.all`
      return Promise.all([
        Tag.find(),
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

    it('should sort tags by name', () => {
      return req('get', '/')
        .then((dbRes) => {
          expect(dbRes.body.map(item => item.name)).to.eql(['breed', 'domestic', 'feral', 'hybrid']);
        });
    });

  });

  describe('GET /api/tags/:id', function() {

    it('should return correct tag by the `id` parameter', function() {
      let data;
      // 1) First, call the database
      return Tag.findOne()
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return req('get', `/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          validateFields(res, expectedFields);

          // 3) then compare database results to API response
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should return the expected fields', () => {
      // 1) First, call the database
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return req('get', `/${data.id}`);
        })
        .then((res) => {
          validateFields(res, expectedFields);
        });
    });

    it('should make sure the `id` parameter is a valid ID', () => {
      return req('get', '/INVALIDIDHERE')
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    it('should 404 if the ID is valid but does not exist in the database', () => {
      return req('get', '/faaaaaaaaaaaaaaaaaaaaaaa')
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

  });

  describe('POST /api/tags', function() {
    
    const newItem = {
      name: 'TestTag'
    };
    
    it('should create and return a new item when provided valid data', function() {
      let res;
      // 1) First, call the API
      return req('post', '/')
        .send(newItem)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          validateFields(res, expectedFields);
          // 2) then call the database
          return Tag.findById(res.body.id);
        })
        // 3) then compare the API response to the database results
        .then(data => {
          expect(res.body.id).to.equal(data.id);
        });
    });

    it('should return an object with the expected fields', () => {
      return req('post', '/')
        .send(newItem)
        .then(res => {
          expect(res.body).to.be.an('object');
          validateFields(res, expectedFields);
        });
    });

    it('should catch duplicate key errors', () => {
      let item;
      return Tag.findOne()
        .then(_data => {
          item = _data;
          return chai.request(app).post('/api/tags/')
            .send({name: item.name});
        })
        .then((res) => {
          expect(res).to.have.status(400);
        });
    });

    it('should return a valid location header with new ID', () => {
      req('post', '/')
        .send(newItem)
        .then(res => {
          expect(res).to.have.header('Location', /\/api\/tags\/[0-9a-fA-F]{24}/);
        });
    });

  });

  describe('PUT /api/tags/:id', () => {

    it('should update a tag by an `id`', () => {
      let item;
      return Tag.findOne()
        .then(res => {
          item = res;
          return req('put', `/${item.id}`)
            .send({
              id: item.id,
              name: 'testTag'
            });
        })
        .then(res => {
          validateFields(res, expectedFields);
          expect(res.body.id).to.equal(item.id);
          expect(res.body.name).to.equal('testTag');
        });
    });

    it('should require a valid id', () => {
      return req('put', '/INVALIDIDHERE')
        .send({
          id: 'INVALIDIDHERE',
          tag: 'huehueheue'
        })
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    it('should 404 if the id is valid but does not exist in the database', () => {
      return req('put', '/faaaaaaaaaaaaaaaaaaaaaaa')
        .send({
          id: 'faaaaaaaaaaaaaaaaaaaaaaa',
          name: 'Hello'
        })
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should require an id in request body', () => {
      return req('put', '/000000000000000000000000')
        .send({
          name: 'Test'
        })
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    it('should require a matching id in both the request query and body', () => {
      return req('put', '/faaaaaaaaaaaaaaaaaaaaaaa')
        .send({
          id: '111111111111111111111110',
          name: 'Hello'
        })
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

  });

  describe('DELETE /api/tags/:id', () => {

    it('should delete a tag by an `id`', () => {
      return req('delete', '/222222222222222222222202')
        .then(res => {
          expect(res).to.have.status(204);
          expect(res).to.not.have.key('Archive');
        });
    });

    it('should require a valid id', () => {
      return req('delete', '/00000')
        .then(res => {
          expect(res).to.have.status(400);
        });

    });

    it('should 404 if the id is valid but does not exist in the database', () => {
      return req('delete', '/faaaaaaaaaaaaaaaaaaaaaaa')
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should remove corresponding tagId references after deleting tag', () => {
      return req('delete', '222222222222222222222201')
        .then((res) => {
          return chai.request(app).get('/api/notes/');
        })
        .then((res) => {
          const notesWithTag = res.body.reduce((tags, note) => {
            if (note.tags.includes('222222222222222222222201')) tags++;
            return tags;
          }, 0);
          expect(notesWithTag).to.equal(0);
        });
    });

  });

});