import APIFactory from '.'
import { SSTConstructsFileContents } from '../../types'
import API from '../API'
import File from '../File'
jest.mock('../API', () =>
  jest.fn().mockImplementation(() => {
    return {}
  })
)

jest.mock('../File', () =>
  jest.fn().mockImplementation(() => {
    return {}
  })
)

describe('APIFactory', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Instantiates one API for each field of type API in the SSTConstructsFile', () => {
    const constructsFileContents: SSTConstructsFileContents = [
      {
        type: 'Api',
        id: 'id 1',
        addr: 'string',
        stack: 'string',
        data: {
          httpApiId: 'string',
          routes: [],
        },
      },
      {
        type: 'Function',
        id: 'string',
        addr: 'string',
        stack: 'string',
        data: {
          localId: 'string',
          arn: 'string',
        },
      },
      {
        type: 'Api',
        id: 'id 2',
        addr: 'string',
        stack: 'string',
        data: {
          httpApiId: 'string',
          routes: [],
        },
      },
    ]

    const apiFactory = new APIFactory(
      constructsFileContents,
      [],
      API,
      new File('at address'),
      'foo'
    )
    const apis = apiFactory.getAPIs()
    expect(apis.length).toBe(2)
  })

  it('Passes the correct arguments to the API', () => {
    const constructsFileContents: SSTConstructsFileContents = [
      {
        type: 'Api',
        id: 'id 1',
        addr: 'string',
        stack: 'string',
        data: {
          httpApiId: 'string',
          routes: [],
        },
      },
      {
        type: 'Api',
        id: 'id 2',
        addr: 'string',
        stack: 'string',
        data: {
          httpApiId: 'string',
          routes: [],
        },
      },
    ]

    const file = new File('At address')

    const apiFactory = new APIFactory(
      constructsFileContents,
      [],
      API,
      file,
      'foo'
    )
    apiFactory.getAPIs()
    const calls = (API as jest.Mock).mock.calls
    expect(calls[0]).toMatchObject([
      constructsFileContents[0],
      [],
      constructsFileContents,
      'foo',
      file,
    ])
    expect(calls[1]).toMatchObject([
      constructsFileContents[1],
      [],
      constructsFileContents,
      'foo',
      file,
    ])
  })
})
