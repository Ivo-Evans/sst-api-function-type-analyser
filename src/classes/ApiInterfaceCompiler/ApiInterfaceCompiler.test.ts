import RouteInterfaceCompiler from '.'
import { ApiExportSpec } from '../../types'
import * as path from 'path'

const OUT_DIR = 'example'
const API_NAME = 'myApi'
const INDENT = '    '

describe('RouteInterfaceCompiler', () => {
  it('Can create imports from named exports', () => {
    const apiExportSpec: ApiExportSpec = {
      'first/filepath': {
        foo: {
          method: 'GET',
          route: '/foo',
        },
        bar: {
          method: 'POST',
          route: '/bar',
        },
      },
    }
    const mockedFilesystem = {}

    const writeFile = (path: string, text: string) =>
      (mockedFilesystem[path] = text)

    const routeInterfaceCompiler = new RouteInterfaceCompiler(
      API_NAME,
      apiExportSpec,
      OUT_DIR,
      writeFile
    )

    routeInterfaceCompiler.compile()

    expect(mockedFilesystem[path.join(OUT_DIR, `${API_NAME}.d.ts`)]).toMatch(
      /^import { foo, bar } from "first\/filepath";$/m
    )
  })

  it('Can create imports from default exports', () => {
    const apiExportSpec: ApiExportSpec = {
      'first/filepath': {
        default: {
          method: 'GET',
          route: '/foo',
        },
      },
    }
    const mockedFilesystem = {}

    const writeFile = (path: string, text: string) =>
      (mockedFilesystem[path] = text)

    const routeInterfaceCompiler = new RouteInterfaceCompiler(
      API_NAME,
      apiExportSpec,
      OUT_DIR,
      writeFile
    )

    routeInterfaceCompiler.compile()

    expect(mockedFilesystem[path.join(OUT_DIR, `${API_NAME}.d.ts`)]).toMatch(
      /^import { default as lambda } from "first\/filepath";$/m
    )
  })

  it('Can create import statements for default and named exports from the same file', () => {
    const apiExportSpec: ApiExportSpec = {
      'first/filepath': {
        default: {
          method: 'GET',
          route: '/foo',
        },
        bar: {
          method: 'POST',
          route: '/bar',
        },
      },
    }
    const mockedFilesystem = {}

    const writeFile = (path: string, text: string) =>
      (mockedFilesystem[path] = text)

    const routeInterfaceCompiler = new RouteInterfaceCompiler(
      API_NAME,
      apiExportSpec,
      OUT_DIR,
      writeFile
    )

    routeInterfaceCompiler.compile()

    expect(mockedFilesystem[path.join(OUT_DIR, `${API_NAME}.d.ts`)]).toMatch(
      /^import { default as lambda, bar } from "first\/filepath";$/m
    )
  })

  it('Can create API route interfaces containing exports which have to be renamed to avoid name collisions', () => {
    const apiExportSpec: ApiExportSpec = {
      'first/filepath': {
        foo: {
          method: 'GET',
          route: '/foo',
        },
      },
      'second/filepath': {
        foo: {
          method: 'GET',
          route: '/footoyoutoo',
        },
      },
    }
    const mockedFilesystem = {}

    const writeFile = (path: string, text: string) =>
      (mockedFilesystem[path] = text)

    const routeInterfaceCompiler = new RouteInterfaceCompiler(
      API_NAME,
      apiExportSpec,
      OUT_DIR,
      writeFile
    )

    routeInterfaceCompiler.compile()

    const [firstLine, secondLine] =
      mockedFilesystem[path.join(OUT_DIR, `${API_NAME}.d.ts`)].split('\n')

    expect(firstLine).toMatch(/^import { foo } from "first\/filepath";$/)
    expect(secondLine).toMatch(
      /^import { foo as foo_2 } from "second\/filepath";$/
    )
  })

  it('Creates a syntactically valid interface', () => {
    const apiExportSpec: ApiExportSpec = {
      'first/filepath': {
        default: {
          method: 'GET',
          route: '/foo',
        },
      },
    }
    const mockedFilesystem = {}

    const writeFile = (path: string, text: string) =>
      (mockedFilesystem[path] = text)

    const routeInterfaceCompiler = new RouteInterfaceCompiler(
      API_NAME,
      apiExportSpec,
      OUT_DIR,
      writeFile
    )

    routeInterfaceCompiler.compile()

    const INTERFACE_SUBSTRING =
      'export interface MyApiRoutes {\n' +
      INDENT +
      '[index: `/foo`]: {\n' +
      INDENT +
      INDENT +
      'GET: ReturnType<typeof lambda>;\n' +
      INDENT +
      INDENT +
      '};\n' +
      INDENT +
      '}'

    expect(
      mockedFilesystem[path.join(OUT_DIR, `${API_NAME}.d.ts`)].trim()
    ).toMatch(INTERFACE_SUBSTRING)
  })

  it('can handle different methods with the same path', () => {
    const apiExportSpec: ApiExportSpec = {
      'first/filepath': {
        default: {
          method: 'GET',
          route: '/foo',
        },
        baz: {
          method: 'PUT',
          route: '/foo',
        },
      },
      'second/filepath': {
        bar: {
          method: 'DELETE',
          route: '/foo',
        },
      },
    }
    const mockedFilesystem = {}

    const writeFile = (path: string, text: string) =>
      (mockedFilesystem[path] = text)

    const routeInterfaceCompiler = new RouteInterfaceCompiler(
      API_NAME,
      apiExportSpec,
      OUT_DIR,
      writeFile
    )

    routeInterfaceCompiler.compile()

    const INTERFACE_SUBSTRING =
      'export interface MyApiRoutes {\n' +
      INDENT +
      '[index: `/foo`]: {\n' +
      INDENT +
      INDENT +
      'GET: ReturnType<typeof lambda>;\n' +
      INDENT +
      INDENT +
      'PUT: ReturnType<typeof baz>;\n' +
      INDENT +
      INDENT +
      'DELETE: ReturnType<typeof bar>;\n' +
      INDENT +
      INDENT +
      '};\n' +
      INDENT +
      '}'

    expect(
      mockedFilesystem[path.join(OUT_DIR, `${API_NAME}.d.ts`)].trim()
    ).toMatch(INTERFACE_SUBSTRING)
  })

  it('can correctly infer the return type of a Lambda function', () => {
    const apiExportSpec: ApiExportSpec = {
      'first/filepath': {
        default: {
          method: 'GET',
          route: '/foo',
        },
      },
    }
    const mockedFilesystem = {}

    const writeFile = (path: string, text: string) =>
      (mockedFilesystem[path] = text)

    const routeInterfaceCompiler = new RouteInterfaceCompiler(
      API_NAME,
      apiExportSpec,
      OUT_DIR,
      writeFile
    )

    routeInterfaceCompiler.compile()

    const LAMBDA_RETURN_TYPE_SUBSTRING = 'ReturnType<typeof lambda>'

    expect(mockedFilesystem[path.join(OUT_DIR, `${API_NAME}.d.ts`)]).toMatch(
      LAMBDA_RETURN_TYPE_SUBSTRING
    )
  })

  it('Creates interfaces with keys that support path variables', () => {
    const apiExportSpec: ApiExportSpec = {
      'first/filepath': {
        default: {
          method: 'POST',
          route: '/users/{user_id}/tag',
        },
      },
    }
    const mockedFilesystem = {}

    const writeFile = (path: string, text: string) =>
      (mockedFilesystem[path] = text)

    const routeInterfaceCompiler = new RouteInterfaceCompiler(
      API_NAME,
      apiExportSpec,
      OUT_DIR,
      writeFile
    )

    routeInterfaceCompiler.compile()

    const PATH_TYPE_SUBSTRING = '`/users/${string}/tag`'

    expect(mockedFilesystem[path.join(OUT_DIR, `${API_NAME}.d.ts`)]).toMatch(
      PATH_TYPE_SUBSTRING
    )
  })
})
