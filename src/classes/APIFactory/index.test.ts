import APIFactory from '.'
import {
  SSTAPIConstruct,
  SSTConstructsFileContents,
  SSTFunctionsFileContents,
} from '../../types'

class MockedAPI {
  public apiConstruct: SSTAPIConstruct
  public functionsFileContents: SSTFunctionsFileContents

  constructor(
    apiConstruct: SSTAPIConstruct,
    functionsFileContents: SSTFunctionsFileContents
  ) {
    this.apiConstruct = apiConstruct
    this.functionsFileContents = functionsFileContents
  }
}

describe('APIFactory', () => {
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

    const apiFactory = new APIFactory(constructsFileContents, [], MockedAPI)
    const apis = apiFactory.getAPIs()
    expect(apis.length).toBe(2)
  })

  it('Passes the correct API construct field to the correct APIs', () => {
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

    const apiFactory = new APIFactory(constructsFileContents, [], MockedAPI)
    const apis = apiFactory.getAPIs()
    expect(apis[0].apiConstruct.id).toBe('id 1')
    expect(apis[1].apiConstruct.id).toBe('id 2')
  })

  it('Instantiates every API with the functions file data the factory was passed', () => {
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

    const localLambdaRecord = {
      id: 'dbbxd',
      handler: 'gddsd',
      runtime: 'bsfbs',
      srcPath: '.',
      root: '..',
    }

    const apiFactory = new APIFactory(
      constructsFileContents,
      [localLambdaRecord],
      MockedAPI
    )
    const apis = apiFactory.getAPIs()
    expect(apis.map((api) => api.functionsFileContents)).toMatchObject(
      new Array(apis.length).fill([localLambdaRecord])
    )
  })
})
