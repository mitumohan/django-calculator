import re
from decimal import Decimal, DivisionByZero, InvalidOperation, getcontext

getcontext().prec = 28

TOKEN_RE = re.compile(r'\d+\.?\d*|\.\d+|[+\-*/]')
OPERATORS = {'+', '-', '*', '/'}


class CalculationError(Exception):
    pass


def tokenize(expression):
    expression = expression.replace(' ', '')
    tokens = TOKEN_RE.findall(expression)
    if ''.join(tokens) != expression or not tokens:
        raise CalculationError('Invalid expression')
    return tokens


def evaluate(expression):
    tokens = tokenize(expression)

    # Split into numbers and operators, handling negatives like "5*-2" or "-3"
    numbers, ops = [], []
    expect_number = True
    sign = 1
    for token in tokens:
        if expect_number:
            if token == '-':
                sign = -sign
                continue
            if token in OPERATORS:
                raise CalculationError('Invalid expression')
            numbers.append(sign * Decimal(token))
            sign = 1
            expect_number = False
        else:
            ops.append(token)
            expect_number = True
    if expect_number:
        raise CalculationError('Expression cannot end with an operator')

    try:
        # First pass: × and ÷
        values = [numbers[0]]
        low_ops = []
        for op, number in zip(ops, numbers[1:]):
            if op == '*':
                values[-1] *= number
            elif op == '/':
                values[-1] /= number
            else:
                low_ops.append(op)
                values.append(number)

        # Second pass: + and −, left to right
        result = values[0]
        for op, number in zip(low_ops, values[1:]):
            result = result + number if op == '+' else result - number
    except (DivisionByZero, InvalidOperation):
        raise CalculationError('Cannot divide by zero')

    return result


def format_number(value):
    """Show 10 instead of 10.000 and 0.5 instead of 5E-1."""
    if value == value.to_integral_value():
        return str(value.quantize(Decimal(1)))
    return format(value.normalize(), 'f')
