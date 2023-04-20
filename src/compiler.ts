import { Lexer } from './lexer.ts'
import { Parser } from './parser.ts'

export const compile = (input: string) => {
  const lexer = new Lexer(input)
  const tokens = lexer.tokenize()
  console.log(tokens)

  const parser = new Parser(tokens)
  const ast = parser.parse()
  console.log(JSON.stringify(ast, null, 2))
}
