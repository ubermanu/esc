import { keywords } from './keywords.ts'

const delimiters = ['(', ')', '{', '}', '[', ']', ',', ';']
const operators = ['=', '+', '-', '*', '/', '%']
const operators2 = ['==', '!=', '<=', '>=', '&&', '||', '++', '--', '**']

export class Lexer {
  constructor(input) {
    this.input = input
    this.position = 0
  }

  tokenize() {
    const tokens = []
    let line = 1
    let column = 0

    function addToken(type, value) {
      tokens.push({ type, value, line, column })
    }

    while (this.position < this.input.length) {
      const char = this.input[this.position]
      const nextChar = this.input[this.position + 1]
      column++

      // Single line comments
      if (char === '/' && this.input[this.position + 1] === '/') {
        this.position += 2
        while (
          this.position < this.input.length &&
          this.input[this.position] !== '\n'
        ) {
          this.position++
        }
        continue
      }

      // Multi line comments
      if (char === '/' && this.input[this.position + 1] === '*') {
        this.position += 2
        while (
          this.position < this.input.length &&
          !(
            this.input[this.position] === '*' &&
            this.input[this.position + 1] === '/'
          )
        ) {
          this.position++
        }
        this.position += 2
      }

      if (delimiters.includes(char)) {
        addToken('DELIMITER', char)
        this.position++
        continue
      }

      if (operators2.includes(char + nextChar)) {
        addToken('OPERATOR', char + nextChar)
        this.position += 2
        continue
      }

      if (operators.includes(char)) {
        addToken('OPERATOR', char)
        this.position++
        continue
      }

      // Numbers
      if (/[0-9]/.test(char)) {
        let value = ''
        while (
          this.position < this.input.length &&
          /[0-9]/.test(this.input[this.position])
        ) {
          value += this.input[this.position]
          this.position++
        }
        addToken('NUMBER', value)
        continue
      }

      // Keywords
      if (/[a-zA-Z]/.test(char)) {
        let value = ''
        while (
          this.position < this.input.length &&
          /[a-zA-Z]/.test(this.input[this.position])
        ) {
          value += this.input[this.position]
          this.position++
        }
        if (keywords.includes(value)) {
          addToken('KEYWORD', value)
        } else {
          addToken('IDENTIFIER', value)
        }
        continue
      }

      if (char === '\n') {
        line++
        column = 0
      }

      // Skip whitespaces
      if (/\s/.test(char)) {
        this.position++
        continue
      }

      throw new Error(`Unexpected "${char}"`)
    }

    return tokens
  }
}
