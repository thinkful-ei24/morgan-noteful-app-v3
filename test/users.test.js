const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const { TEST_MONGODB_URI } = require('../config');

const User = require('../models/user');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Noteful API - Users', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const fullname = 'Example User';

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return User.createIndexes();
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  const req = (method, endpoint = '/') => {
    method = method.toLowerCase();
    return chai.request(app)[method]('/api/users' + endpoint);
  };
  
  describe('/api/users', function () {
    describe('POST', function () {
      it('Should create a new user', function () {
        const testUser = { username, password, fullname };
        let res;
        return req('post')
          .send(testUser)
          .then(_res => {
            res = _res;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.include.keys('id', 'username', 'fullname');

            expect(res.body.id).to.exist;
            expect(res.body.username).to.equal(testUser.username);
            expect(res.body.fullname).to.equal(testUser.fullname);

            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.exist;
            expect(user.id).to.equal(res.body.id);
            expect(user.fullname).to.equal(testUser.fullname);
            return user.validatePassword(password);
          })
          .then(isValid => {
            expect(isValid).to.be.true;
          });
      });
      it('Should reject users with missing username', function () {
        const testUser = { password, fullname };
        return req('post')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
          });
      });
      
      it('Should reject users with missing password', () => {
        const testUser = { fullname, username };
        return req('post')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
          });
      });

      it('Should reject users with non-string username', () => {
        const testUser = { fullname, password, username: {hello: 'world'} };
        return req('post')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(400);
          });
      });

      it('Should reject users with non-string password', () => {
        const testUser = { fullname, username, password: {hello: 'world'} };
        return req('post')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(400);
          });
      });

      it('Should reject users with non-trimmed username', () => {
        const testUser = { fullname, password, username: ' userHere ' };
        return req('post')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(400);
          });
      });

      it('Should reject users with non-trimmed password', () => {
        const testUser = { fullname, username, password: ' hello!' };
        return req('post')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(400);
          });
      });

      it('Should reject users with empty username', () => {
        const testUser = { fullname, username: '', password };
        return req('post')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(400);
          });
      });

      it('Should reject users with password less than 8 characters', () => {
        const testUser = { fullname, username, password: '1234567' };
        return req('post')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(400);
          });
      });

      it('Should reject users with password greater than 72 characters', () => {
        const testUser = { fullname, username, password: 'hfjhfksdjhdfjkdfsjkhfdhskjfdkjsjkhfdhfdjksdjfkdskjfhkvbfskhvbjfhksjvbhfkekshbvsehvbfhesui4wrhbiubesbvgrukseyrnhrsyhruvhsksrebyseuvbryksvbryesukvbresyrksbukrsyvebrysvbyreusvyrksyervkusbrkvuse' };
        return req('post')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(400);
          });
      });

      it('Should reject users with duplicate username', () => {
        const testUser = { fullname, username, password };
        return req('post').send(testUser)
          .then(() => req('post').send(testUser))
          .then(res => expect(res).to.have.status(400));
      });

      it('Should trim fullname', () => {
        const testUser = { fullname: ' Morgan Freeman  ', username, password };
        return req('post').send(testUser)
          .then(res => expect(res.body.fullname).to.equal('Morgan Freeman'));
      });

    });
  });
});