import { Lexer } from './lexer.ts'

export const compile = (input: string) => {
  const lexer = new Lexer(input)
  const tokens = lexer.tokenize()
  console.log(tokens)
}
