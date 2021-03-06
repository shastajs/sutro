/*eslint no-console: 0*/
import should from 'should'
import sutro, { rewriteLargeRequests } from '../src'
import request from 'supertest'
import express from 'express'
import Parser from 'swagger-parser'
import JSONStream from 'jsonstream-next'
import { SutroArgs } from '../src/types'

const parser = new Parser()
const users = [
  { id: 0, name: 'foo' },
  { id: 1, name: 'bar' },
  { id: 2, name: 'baz' }
]

const passengers = [{ name: 'todd' }, { name: 'rob' }]
const cars = [
  [
    { id: 0, name: 'foo', passengers },
    { id: 1, name: 'bar', passengers },
    { id: 2, name: 'baz', passengers }
  ],
  [
    { id: 0, name: 'foo', passengers },
    { id: 1, name: 'bar', passengers },
    { id: 2, name: 'baz', passengers }
  ],
  [
    { id: 0, name: 'foo', passengers },
    { id: 1, name: 'bar', passengers },
    { id: 2, name: 'baz', passengers }
  ]
]

describe('sutro', () => {
  it('should export a function', () => {
    should.exist(sutro)
    should(typeof sutro).eql('function')
  })
  it('should return a router', () => {
    const router = sutro({ resources: {} })
    should.exist(router)
    should(typeof router).eql('function')
  })
  it('should error if missing resources', () => {
    sutro.should.throw()
    sutro.bind(null, {}).should.throw()
  })
})

describe('sutro - function handlers', () => {
  const config: SutroArgs = {
    pre: async (o, req, res) => {
      should.exist(o)
      should.exist(req)
      should.exist(res)
    },
    resources: {
      user: {
        create: (opts, cb) => cb(null, { created: true }),
        find: (opts, cb) => cb(null, users),
        findById: (opts, cb) => cb(null, users[opts.userId]),
        deleteById: (opts, cb) => cb(null, { deleted: true }),
        updateById: (opts, cb) => cb(null, { updated: true }),
        replaceById: (opts, cb) => cb(null, { replaced: true }),
        car: {
          create: (opts, cb) => cb(null, { created: true }),
          find: (opts, cb) => cb(null, cars[opts.userId]),
          findById: (opts, cb) => cb(null, cars[opts.userId][opts.carId]),
          deleteById: (opts, cb) => cb(null, { deleted: true }),
          updateById: (opts, cb) => cb(null, { updated: true }),
          replaceById: (opts, cb) => cb(null, { replaced: true }),

          passenger: {
            create: (opts, cb) => cb(null, { created: true }),
            find: (opts, cb) =>
              cb(null, cars[opts.userId][opts.carId].passengers),
            findById: (opts, cb) =>
              cb(
                null,
                cars[opts.userId][opts.carId].passengers[opts.passengerId]
              ),
            deleteById: (opts, cb) => cb(null, { deleted: true }),
            updateById: (opts, cb) => cb(null, { updated: true }),
            replaceById: (opts, cb) => cb(null, { replaced: true })
          }
        },
        me: {
          execute: (opts, cb) => cb(null, { me: true }),
          http: {
            method: 'get',
            instance: false
          }
        }
      }
    }
  }

  const app = express().use(sutro(config))

  it('should register a resource find endpoint', async () =>
    request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, users))

  it('should register a resource findById endpoint', async () =>
    request(app)
      .get('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, users[1]))

  it('should register a resource create endpoint', async () =>
    request(app)
      .post('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201, { created: true }))

  it('should register a resource create endpoint that works with response=false', async () =>
    request(app)
      .post('/users')
      .set('Accept', 'application/json')
      .query({ response: false })
      .expect(201)
      .expect(({ body }) => !body))

  it('should register a resource delete endpoint', async () =>
    request(app)
      .delete('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { deleted: true }))

  it('should register a resource replace endpoint', async () =>
    request(app)
      .put('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { replaced: true }))

  it('should register a resource update endpoint', async () =>
    request(app)
      .patch('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { updated: true }))

  it('should register a custom resource', async () =>
    request(app)
      .get('/users/me')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { me: true }))

  it('should register a nested resource find endpoint', async () =>
    request(app)
      .get('/users/1/cars')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, cars[1]))

  it('should register a nested resource findById endpoint', async () =>
    request(app)
      .get('/users/1/cars/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, cars[1][1]))

  it('should register a nested resource create endpoint', async () =>
    request(app)
      .post('/users/1/cars')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201, { created: true }))

  it('should register a nested resource delete endpoint', async () =>
    request(app)
      .delete('/users/1/cars/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { deleted: true }))

  it('should register a nested resource replace endpoint', async () =>
    request(app)
      .put('/users/1/cars/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { replaced: true }))

  it('should register a nested resource update endpoint', async () =>
    request(app)
      .patch('/users/1/cars/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { updated: true }))
  it('should register a double nested resource find endpoint', async () =>
    request(app)
      .get('/users/1/cars/1/passengers')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, cars[1][1].passengers))

  it('should register a double nested resource findById endpoint', async () =>
    request(app)
      .get('/users/1/cars/1/passengers/0')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, cars[1][1].passengers[0]))

  it('should register a double nested resource create endpoint', async () =>
    request(app)
      .post('/users/1/cars/1/passengers')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201, { created: true }))

  it('should register a double nested resource delete endpoint', async () =>
    request(app)
      .delete('/users/1/cars/1/passengers/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { deleted: true }))

  it('should register a double nested resource replace endpoint', async () =>
    request(app)
      .put('/users/1/cars/1/passengers/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { replaced: true }))

  it('should register a double nested resource update endpoint', async () =>
    request(app)
      .patch('/users/1/cars/1/passengers/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { updated: true }))

  it('should have a valid swagger file', async () => {
    const { body } = await request(app)
      .get('/swagger')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    await parser.validate(body)
  })

  it('should have a meta index', async () => {
    const { body } = await request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    should(body).eql({
      user: {
        me: {
          path: '/users/me',
          method: 'get',
          instance: false
        },
        car: {
          passenger: {
            create: {
              path: '/users/:userId/cars/:carId/passengers',
              method: 'post',
              instance: false
            },
            find: {
              path: '/users/:userId/cars/:carId/passengers',
              method: 'get',
              instance: false
            },
            findById: {
              path: '/users/:userId/cars/:carId/passengers/:passengerId',
              method: 'get',
              instance: true
            },
            deleteById: {
              path: '/users/:userId/cars/:carId/passengers/:passengerId',
              method: 'delete',
              instance: true
            },
            updateById: {
              path: '/users/:userId/cars/:carId/passengers/:passengerId',
              method: 'patch',
              instance: true
            },
            replaceById: {
              path: '/users/:userId/cars/:carId/passengers/:passengerId',
              method: 'put',
              instance: true
            }
          },
          create: {
            path: '/users/:userId/cars',
            method: 'post',
            instance: false
          },
          find: {
            path: '/users/:userId/cars',
            method: 'get',
            instance: false
          },
          findById: {
            path: '/users/:userId/cars/:carId',
            method: 'get',
            instance: true
          },
          deleteById: {
            path: '/users/:userId/cars/:carId',
            method: 'delete',
            instance: true
          },
          updateById: {
            path: '/users/:userId/cars/:carId',
            method: 'patch',
            instance: true
          },
          replaceById: {
            path: '/users/:userId/cars/:carId',
            method: 'put',
            instance: true
          }
        },
        create: {
          path: '/users',
          method: 'post',
          instance: false
        },
        find: {
          path: '/users',
          method: 'get',
          instance: false
        },
        findById: {
          path: '/users/:userId',
          method: 'get',
          instance: true
        },
        deleteById: {
          path: '/users/:userId',
          method: 'delete',
          instance: true
        },
        updateById: {
          path: '/users/:userId',
          method: 'patch',
          instance: true
        },
        replaceById: {
          path: '/users/:userId',
          method: 'put',
          instance: true
        }
      }
    })
  })
})

describe('sutro - async function handlers', () => {
  const config: SutroArgs = {
    resources: {
      user: {
        create: async () => ({ created: true }),
        find: async () => users,
        findById: async (opts) => users[opts.userId],
        deleteById: async () => ({ deleted: true }),
        updateById: async () => ({ updated: true }),
        replaceById: async () => ({ replaced: true }),
        me: {
          execute: async () => ({ me: true }),
          http: {
            method: 'get',
            instance: false
          }
        }
      }
    }
  }

  const app = express().use(sutro(config))

  it('should register a resource find endpoint', async () =>
    request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, users))

  it('should register a resource findById endpoint', async () =>
    request(app)
      .get('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, users[1]))

  it('should register a resource create endpoint', async () =>
    request(app)
      .post('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201, { created: true }))

  it('should register a resource delete endpoint', async () =>
    request(app)
      .delete('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { deleted: true }))

  it('should register a resource replace endpoint', async () =>
    request(app)
      .put('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { replaced: true }))

  it('should register a resource update endpoint', async () =>
    request(app)
      .patch('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { updated: true }))

  it('should register a custom resource', async () =>
    request(app)
      .get('/users/me')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { me: true }))
})

describe('sutro - flat value handlers', () => {
  const config: SutroArgs = {
    pre: async (o, req, res) => {
      should.exist(o)
      should.exist(req)
      should.exist(res)
    },
    post: async (o, req, res, err) => {
      should.exist(o)
      should.exist(req)
      should.exist(res)
      should.not.exist(err)
    },
    resources: {
      user: {
        create: () => ({ created: true }),
        find: () => users,
        findById: (opts) => users[opts.userId],
        deleteById: () => ({ deleted: true }),
        updateById: () => ({ updated: true }),
        replaceById: () => ({ replaced: true }),
        me: {
          execute: () => ({ me: true }),
          http: {
            method: 'get',
            instance: false
          }
        },
        isCool: {
          execute: () => false,
          http: {
            method: 'get',
            instance: true
          }
        },
        nulled: {
          execute: () => null,
          http: {
            method: 'get',
            instance: false
          }
        }
      }
    }
  }

  const app = express().use(sutro(config))

  it('should register a resource find endpoint', async () =>
    request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, users))

  it('should register a resource findById endpoint', async () =>
    request(app)
      .get('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, users[1]))

  it('should register a resource create endpoint', async () =>
    request(app)
      .post('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201, { created: true }))

  it('should register a resource delete endpoint', async () =>
    request(app)
      .delete('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { deleted: true }))

  it('should register a resource replace endpoint', async () =>
    request(app)
      .put('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { replaced: true }))

  it('should register a resource update endpoint', async () =>
    request(app)
      .patch('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { updated: true }))

  it('should register a custom resource', async () =>
    request(app)
      .get('/users/me')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, { me: true }))

  it('should return 200 with data from a custom falsey resource', async () =>
    request(app)
      .get('/users/123/isCool')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, 'false'))

  it('should return 404 from a custom null resource', async () =>
    request(app)
      .get('/users/nulled')
      .set('Accept', 'application/json')
      .expect(404))
})

describe('sutro - caching', () => {
  let meCache
  const findByIdCache = {}
  const keyedCache: { yo?: any } = {}
  const config: SutroArgs = {
    resources: {
      user: {
        find: {
          execute: async () => users,
          cache: {
            header: () => ({ public: true, maxAge: '1hr' }),
            key: () => 'yo',
            get: async (opt, key) => keyedCache[key],
            set: async (opt, data, key) => (keyedCache[key] = data)
          }
        },
        findById: {
          execute: async (opt) => users[opt.userId],
          cache: {
            header: () => ({ public: true }),
            get: async (opt) => findByIdCache[opt.userId],
            set: async (opt, data) => (findByIdCache[opt.userId] = data)
          }
        },
        me: {
          execute: async () => ({ me: true }),
          cache: {
            header: { private: true },
            get: async () => meCache,
            set: async (opt, data) => (meCache = data)
          },
          http: {
            method: 'get',
            instance: false
          }
        }
      }
    }
  }

  const app = express().use(sutro(config))

  it('should cache a findById endpoint', async () => {
    await request(app)
      .get('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect('Cache-Control', 'public')
      .expect(200, users[1])

    await request(app)
      .get('/users/2')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect('Cache-Control', 'public')
      .expect(200, users[2])

    await request(app)
      .get('/users/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect('Cache-Control', 'public')
      .expect(200, users[1])

    await request(app)
      .get('/users/2')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect('Cache-Control', 'public')
      .expect(200, users[2])

    should.exist(findByIdCache)
    findByIdCache.should.eql({
      1: users[1],
      2: users[2]
    })
  })
  it('should cache a custom resource', async () => {
    await request(app)
      .get('/users/me')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect('Cache-Control', 'private')
      .expect(200, { me: true })

    should.exist(meCache)
    meCache.should.eql({ me: true })
  })
  it('should cache with a key function', async () => {
    await request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect('Cache-Control', 'public, max-age=3600')
      .expect(200, users)

    should.exist(keyedCache.yo)
    keyedCache.yo.should.eql(users)
  })
})

describe('sutro - rewriting requests', () => {
  const config: SutroArgs = {
    resources: {
      user: {
        find: () => [{ a: 1 }],
        findById: () => ({ a: 1 })
      }
    }
  }
  const app = express().use(rewriteLargeRequests).use(sutro(config))

  it('should rewrite a post for a resource find endpoint', async () =>
    request(app)
      .post('/users')
      .set('Accept', 'application/json')
      .set('X-HTTP-Method-Override', 'GET')
      .expect('Content-Type', /json/)
      .expect(200, config.resources.user.find()))

  it('should rewrite a post for a resource findById endpoint', async () =>
    request(app)
      .post('/users/1')
      .set('Accept', 'application/json')
      .set('X-HTTP-Method-Override', 'GET')
      .expect('Content-Type', /json/)
      .expect(200, config.resources.user.findById()))
})

describe('sutro - streaming requests', () => {
  const config: SutroArgs = {
    resources: {
      user: {
        find: ({ options }) => {
          const out = JSONStream.stringify()
          out.contentType = 'application/json'
          if (options.asyncError) {
            setTimeout(() => {
              out.emit('error', new Error('Bad news!'))
            }, 100)
          }
          if (options.error) {
            out.emit('error', new Error('Bad news!'))
          }
          setTimeout(() => {
            out.end({ a: 1 })
          }, 200)
          return out
        }
      }
    }
  }
  const app = express()
    .use(sutro(config))
    .use((err, req, res, _next) => {
      res.status(500).send({ error: err.message })
    })

  it('should stream a resource find endpoint', async () =>
    request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, [{ a: 1 }]))
  it('should handle async stream errors correctly', async () =>
    request(app)
      .get('/users')
      .query({ asyncError: true })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500, { error: 'Bad news!' }))
  it('should handle instant stream errors correctly', async () =>
    request(app)
      .get('/users')
      .query({ error: true })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500, { error: 'Bad news!' }))
})
