// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const mongoose = require('mongoose');

// const app = require('../server');
// const {
//   TEST_MONGODB_URI
// } = require('../config');

// const Note = require('../models/note');

// const {
//   notes
// } = require('../db/seed/notes');

// const expect = chai.expect;
// chai.use(chaiHttp);

// describe('Note Router Tests', () => {
//   before(function() {
//     return mongoose.connect(TEST_MONGODB_URI, {
//         useNewUrlParser: true
//       })
//       .then(() => mongoose.connection.db.dropDatabase());
//   });

//   beforeEach(function() {
//     return Note.insertMany(notes);
//   });

//   afterEach(function() {
//     return mongoose.connection.db.dropDatabase();
//   });

//   after(function() {
//     return mongoose.disconnect();
//   });

//   const req = (method, endpoint) => {
//     method = method.toLowerCase();
//     return chai.request(app)[method]('/api/notes' + endpoint);
//   };


//   const validateFields = (res, expectedFields) => {
//     const response = res.body;
//     if (typeof response === 'object') {
//       if (Array.isArray(response)) {
//         for (const item of response) {
//           expect(item).to.have.keys(expectedFields);
//         }
//       } else expect(response).to.have.keys(expectedFields);
//     }
//   };
//   const expectedFields = ['id', 'title', 'content', 'createdAt', 'updatedAt'];

//   describe('GET /api/notes', function() {

//     it('should respond with all notes', () => {
//       // 1) Call the database **and** the API
//       // 2) Wait for both promises to resolve using `Promise.all`
//       return Promise.all([
//           Note.find(),
//           chai.request(app).get('/api/notes')
//         ])
//         // 3) then compare database results to API response
//         .then(([data, res]) => {
//           expect(res).to.have.status(200);
//           expect(res).to.be.json;
//           expect(res.body).to.be.a('array');
//           expect(res.body).to.have.length(data.length);
//         });
//     });

//     it('should return the correct fields for each item', () => {
//       return req('get', '/')
//         .then(res => {
//           validateFields(res, expectedFields);
//         });
//     });

//     it('should be able to search for notes (case-insensitive)', () => {
//       return req('get', '/?searchTerm=GAGA')
//         .then(res => {
//           expect(res.body[0].title).to.equal('7 things Lady Gaga has in common with cats');
//         });
//     });

//     it('should return an empty array with an invalid search', () => {
//       return req('get', '/?searchTerm=INVALIDDDDDDD')
//         .then(res => {
//           expect(res.body).to.deep.equal([]);
//         });
//     });

//   });

//   describe('GET /api/notes/:id', function() {

//     it('should return correct note by the `id` parameter', function() {
//       let data;
//       // 1) First, call the database
//       return Note.findOne()
//         .then(_data => {
//           data = _data;
//           // 2) then call the API with the ID
//           return chai.request(app).get(`/api/notes/${data.id}`);
//         })
//         .then((res) => {
//           expect(res).to.have.status(200);
//           expect(res).to.be.json;

//           expect(res.body).to.be.an('object');
//           expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');

//           // 3) then compare database results to API response
//           expect(res.body.id).to.equal(data.id);
//           expect(res.body.title).to.equal(data.title);
//           expect(res.body.content).to.equal(data.content);
//           expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
//           expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
//         });
//     });

//     it('should return the expected fields', () => {
//       // 1) First, call the database
//       let data;
//       return Note.findOne()
//         .then(_data => {
//           data = _data;
//           // 2) then call the API with the ID
//           return req('get', `/${data.id}`);
//         })
//         .then((res) => {
//           validateFields(res, expectedFields);
//         });
//     });

//     it('should make sure the `id` parameter is a valid ID', () => {
//       return req('get', '/INVALIDIDHERE')
//         .then(res => {
//           expect(res).to.have.status(400);
//         });
//     });

//     it('should 404 if the ID is valid but does not exist in the database', () => {
//       return req('get', '/faaaaaaaaaaaaaaaaaaaaaaa')
//         .then(res => {
//           expect(res).to.have.status(404);
//         });
//     });

//   });

//   describe('POST /api/notes', function() {
//     it('should create and return a new item when provided valid data', function() {
//       const newItem = {
//         'title': 'The best article about cats ever!',
//         'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
//       };

//       let res;
//       // 1) First, call the API
//       return chai.request(app)
//         .post('/api/notes')
//         .send(newItem)
//         .then(function(_res) {
//           res = _res;
//           expect(res).to.have.status(201);
//           expect(res).to.have.header('location');
//           expect(res).to.be.json;
//           expect(res.body).to.be.a('object');
//           expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
//           // 2) then call the database
//           return Note.findById(res.body.id);
//         })
//         // 3) then compare the API response to the database results
//         .then(data => {
//           expect(res.body.id).to.equal(data.id);
//           expect(res.body.title).to.equal(data.title);
//           expect(res.body.content).to.equal(data.content);
//           expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
//           expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
//         });
//     });

//     it('should return an object with the expected fields', () => {
//       return req('post', '/')
//         .send({
//           title: 'Testing title here!',
//           content: 'Who needs it?'
//         })
//         .then(res => {
//           expect(res.body).to.be.an('object');
//           validateFields(res, expectedFields);
//         });
//     });

//     it('should require a title in the request body', () => {
//       return req('post', '/')
//         .send({
//           content: 'Who needs it?'
//         })
//         .then(res => {
//           expect(res).to.have.status(400);
//         });
//     });

//     it('should return a valid location header with new ID', () => {
//       req('post', '/')
//         .send({
//           title: 'Another test here',
//           content: 'Who needs it?'
//         })
//         .then(res => {
//           expect(res).to.have.header('Location', /\/api\/notes\/[0-9a-fA-F]{24}/);
//         });
//     });

//   });

//   describe('PUT /api/notes/:id', () => {

//     it('should update a note by an `id`', () => {
//       let item;
//       return Note.findOne()
//         .then(res => {
//           item = res;
//           return req('put', `/${item.id}`)
//             .send({
//               id: item.id,
//               title: 'Test title!',
//               content: 'hello world!'
//             });
//         })
//         .then(res => {
//           validateFields(res, expectedFields);
//           expect(res.body.id).to.equal(item.id);
//           expect(res.body.title).to.equal('Test title!');
//           expect(res.body.content).to.equal('hello world!');
//         });
//     });

//     it('should be able to update a single field', () => {
//       let item;
//       return Note.findOne()
//         .then(res => {
//           item = res;
//           return req('put', `/${item.id}`)
//             .send({
//               id: item.id,
//               content: 'hello world!'
//             });
//         })
//         .then(res => {
//           validateFields(res, expectedFields);
//           expect(res.body.id).to.equal(item.id);
//           expect(res.body.content).to.equal('hello world!');
//         });
//     });

//     it('should require a valid id', () => {
//       return req('put', '/INVALIDIDHERE')
//         .send({
//           id: 'INVALIDIDHERE',
//           title: 'HEllo!',
//           content: 'hello world!'
//         })
//         .then(res => {
//           expect(res).to.have.status(400);
//         });
//     });

//     it('should 404 if the id is valid but does not exist in the database', () => {
//       return req('put', '/faaaaaaaaaaaaaaaaaaaaaaa')
//         .send({
//           id: 'faaaaaaaaaaaaaaaaaaaaaaa',
//           title: 'HEllo!',
//           content: 'hello world!'
//         })
//         .then(res => {
//           expect(res).to.have.status(404);
//         });
//     });

//     it('should require an id in request body', () => {
//       return req('put', '/000000000000000000000000')
//         .send({
//           title: 'HEllo!',
//           content: 'hello world!'
//         })
//         .then(res => {
//           expect(res).to.have.status(400);
//         });
//     });

//     it('should require a matching id in both the request query and body', () => {
//       return req('put', '/faaaaaaaaaaaaaaaaaaaaaaa')
//         .send({
//           id: '111111111111111111111110',
//           title: 'HEllo!',
//           content: 'hello world!'
//         })
//         .then(res => {
//           expect(res).to.have.status(400);
//         });
//     });

//   });

//   describe('DELETE /api/notes/:id', () => {

//     it('should delete a note by an `id`', () => {
//       return req('delete', '/000000000000000000000000')
//         .then(res => {
//           expect(res).to.have.status(204);
//         });
//     });

//     it('should require a valid id', () => {
//       return req('delete', '/00000')
//         .then(res => {
//           expect(res).to.have.status(400);
//         });

//     });

//     it('should 404 if the id is valid but does not exist in the database', () => {
//       return req('delete', '/100000000000000000000000')
//         .then(res => {
//           expect(res).to.have.status(404);
//         });
//     });

//   });

// });