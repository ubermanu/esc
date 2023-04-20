export class Parser {
  tokens
  cur = 0

  constructor(tokens) {
    this.tokens = tokens
  }

  parse() {
    const ast = {
      type: 'Program',
      body: [],
    }

    while (this.cur < this.tokens.length) {
      const token = this.tokens[this.cur]

      if (token.type === 'KEYWORD' && token.value === 'function') {
        ast.body.push(this.parseFunction())
      } else {
        ast.body.push(this.parseExpression())
      }

      this.cur++
    }

    return ast
  }

  parseFunction() {
    let token = this.tokens[this.cur]
    const node = {
      type: 'FunctionDeclaration',
      name: null,
      params: [],
      body: [],
    }

    if (token.type === 'KEYWORD' && token.value === 'function') {
      this.cur++
    }

    expect(this.tokens[this.cur], 'IDENTIFIER')

    // Function name
    node.name = this.tokens[this.cur].value
    this.cur++

    expect(this.tokens[this.cur], 'DELIMITER')

    if (
      this.tokens[this.cur].type === 'DELIMITER' &&
      this.tokens[this.cur].value === '('
    ) {
      this.cur++
    }

    // Parameters
    while (
      this.tokens[this.cur].type !== 'DELIMITER' ||
      this.tokens[this.cur].value !== ')'
    ) {
      if (
        this.tokens[this.cur].type === 'DELIMITER' &&
        this.tokens[this.cur].value === ','
      ) {
        this.cur++
      }

      expect(this.tokens[this.cur], 'IDENTIFIER')

      const param = {
        type: 'Identifier',
        name: this.tokens[this.cur].value,
      }
      node.params.push(param)
      this.cur++
    }

    this.cur++

    if (
      this.tokens[this.cur].type === 'DELIMITER' &&
      this.tokens[this.cur].value === '{'
    ) {
      this.cur++
    }

    // Pares expressions until we reach a closing curly brace
    while (
      this.tokens[this.cur].type !== 'DELIMITER' ||
      this.tokens[this.cur].value !== '}'
    ) {
      if (
        this.tokens[this.cur].type === 'KEYWORD' &&
        this.tokens[this.cur].value === 'return'
      ) {
        node.body.push(this.parseReturnStatement())
      } else {
        node.body.push(this.parseExpression())
      }

      this.cur++
    }

    // Skip the closing curly brace
    this.cur++

    return node
  }

  parseExpression() {
    const token = this.tokens[this.cur]

    // Here we need to check if the token is a function call
    // or a regular expression

    if (
      token.type === 'IDENTIFIER' &&
      this.tokens[this.cur + 1].type === 'DELIMITER' &&
      this.tokens[this.cur + 1].value === '('
    ) {
      return this.parseCallExpression()
    }

    // Now we can parse a regular expression
    const node = {
      type: 'ExpressionStatement',
      expression: null,
    }

    // Fetches the next tokens until we reach a semicolon
    // or a closing curly brace
    const tokens = []
    while (
      this.tokens[this.cur].type !== 'DELIMITER' ||
      (this.tokens[this.cur].value !== ';' &&
        this.tokens[this.cur].value !== '}')
    ) {
      tokens.push(this.tokens[this.cur])
      this.cur++
    }

    this.cur--

    // We need to check if the expression is a binary expression
    // or a simple identifier
    if (tokens.length === 1 && tokens[0].type === 'IDENTIFIER') {
      node.expression = {
        type: 'Identifier',
        name: tokens[0].value,
      }
    }

    // If the expression is a mathematical expression
    // we need to parse it
    // TODO: We should regroup the tokens into sub-expressions
    if (tokens.find((token) => token.type === 'OPERATOR')) {
      node.expression = this.parseMathExpression(tokens)
    }

    return node
  }

  parseMathExpression(tokens) {
    const node = {
      type: 'BinaryExpression',
      left: null,
      right: null,
      operator: null,
    }

    const operator = tokens.find((token) => token.type === 'OPERATOR')
    node.operator = operator.value

    const leftTokens = tokens.slice(0, tokens.indexOf(operator))
    const rightTokens = tokens.slice(tokens.indexOf(operator) + 1)

    if (leftTokens.length === 1 && leftTokens[0].type === 'IDENTIFIER') {
      node.left = {
        type: 'Identifier',
        name: leftTokens[0].value,
      }
    }

    if (rightTokens.length === 1 && rightTokens[0].type === 'IDENTIFIER') {
      node.right = {
        type: 'Identifier',
        name: rightTokens[0].value,
      }
    }

    return node
  }

  parseReturnStatement() {
    const token = this.tokens[this.cur]
    const node = {
      type: 'ReturnStatement',
      argument: null,
    }

    if (token.type === 'KEYWORD' && token.value === 'return') {
      this.cur++
    }

    node.argument = this.parseExpression()

    return node
  }

  parseCallExpression() {
    const node = {
      type: 'CallExpression',
      callee: null,
      arguments: [],
    }

    this.cur++

    while (
      this.tokens[this.cur].type !== 'DELIMITER' ||
      this.tokens[this.cur].value !== ')'
    ) {
      node.arguments.push(this.parseExpression())
      this.cur++
    }

    return node
  }
}

function expect(token, ...types: string[]) {
  if (types.includes(token.type)) {
    return
  }
  throw new Error(
    `Unexpected token ${token.type} ${token.value}, expected ${types.join(
      ' or '
    )} at ./hello.js:${token.line}:${token.column}`
  )
}
