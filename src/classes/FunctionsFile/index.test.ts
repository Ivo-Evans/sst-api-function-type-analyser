import FunctionsFile from '.'
import path from 'path'

describe('FunctionsFile', () => {
  it('Lets you look up function filepath by id', () => {
    const functionsFile = new FunctionsFile(
      path.join(__dirname, 'testData', 'functions.jsonl')
    )
    expect(functionsFile.filepathById).toMatchObject({
      'test-my-sst-app-MyStack-api-Lambda_POST_-users':
        'backend/functions/users/post.default',
      'test-my-sst-app-MyStack-api-Lambda_GET_-users-{id}':
        'backend/functions/users/get.default',
      'test-my-sst-app-MyStack-api-Lambda_PUT_-users-{id}':
        'backend/functions/users/put.default',
    })
  })
})
