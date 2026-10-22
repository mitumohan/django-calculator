let expression = '';
let justAnswered = false;

// Memory: the saved steps (newest first), loaded from the page,
// and which step the M button is showing (-1 = not showing memory).
let memory = JSON.parse(document.getElementById('memory-data').textContent);
let memoryIndex = -1;

const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
const OPERATORS = ['+', '-', '*', '/'];

// Show * and / as × and ÷
function pretty(text) {
    return text.replace(/\*/g, ' × ').replace(/\//g, ' ÷ ')
               .replace(/(\d|\.)\+/g, '$1 + ').replace(/(\d|\.)-/g, '$1 − ');
}

function updateDisplay() {
    resultEl.classList.remove('error');
    resultEl.textContent = expression === '' ? '0' : pretty(expression);
}

function showError(message) {
    resultEl.textContent = message;
    resultEl.classList.add('error');
}

function currentNumber() {
    const parts = expression.split(/[+\-*/]/);
    return parts[parts.length - 1];
}

function startFresh() {
    expression = '';
    expressionEl.textContent = '';
    justAnswered = false;
}

function addDigit(digit) {
    if (justAnswered) startFresh();
    if (currentNumber() === '0') expression = expression.slice(0, -1);  // no "05"
    expression += digit;
    updateDisplay();
}

function addDecimal() {
    if (justAnswered) startFresh();
    if (currentNumber().includes('.')) return;   // only one dot per number
    expression += currentNumber() === '' ? '0.' : '.';
    updateDisplay();
}

function addOperator(op) {
    justAnswered = false;   // continue from the previous answer
    const last = expression.slice(-1);
    if (expression === '') {
        if (op === '-') { expression = '-'; updateDisplay(); }
        return;
    }
    if (OPERATORS.includes(last)) {
        if (op === '-' && (last === '*' || last === '/')) expression += op;  // 5 × −2
        else expression = expression.replace(/[+\-*/]+$/, '') + op;         // replace operator
    } else if (last === '.') {
        expression += '0' + op;
    } else {
        expression += op;
    }
    updateDisplay();
}

function backspace() {
    if (justAnswered) return;
    expression = expression.slice(0, -1);
    updateDisplay();
}

function clearAll() {
    startFresh();
    updateDisplay();
}

async function postTo(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'X-CSRFToken': csrfToken },
        body: new URLSearchParams(data),
    });
    return { ok: response.ok, data: await response.json() };
}

async function showAnswer() {
    if (expression === '' || justAnswered) return;
    const { ok, data } = await postTo(CALCULATE_URL, { expression });
    if (!ok) { showError(data.error); return; }
    expressionEl.textContent = pretty(expression) + ' =';
    expression = data.result;
    justAnswered = true;
    updateDisplay();
    memory = data.history;   // keep memory up to date with the new step
}

// M: each click shows the next older step on the display
function showMemory() {
    if (memory.length === 0) {
        expressionEl.textContent = '';
        showError('Memory is empty');
        return;
    }
    // Move one step back; after the oldest, start again from the newest
    memoryIndex = (memoryIndex + 1) % memory.length;
    const step = memory[memoryIndex];
    expressionEl.textContent = `M${memoryIndex + 1}/${memory.length}:  ${pretty(step.expression)} =`;
    expression = step.result;   // so you can keep calculating with it
    justAnswered = true;
    updateDisplay();
}

// MC: delete all saved steps
async function clearMemory() {
    await postTo(CLEAR_MEMORY_URL, {});
    memory = [];
    memoryIndex = -1;
    clearAll();
    expressionEl.textContent = 'Memory cleared';
}

// Buttons
document.querySelector('.keys').addEventListener('click', (event) => {
    const key = event.target.closest('button');
    if (!key) return;
    if (key.dataset.action !== 'memory') memoryIndex = -1;   // next M starts from the newest

    if (key.dataset.digit !== undefined) addDigit(key.dataset.digit);
    else if (key.dataset.op) addOperator(key.dataset.op);
    else if (key.dataset.action === 'decimal') addDecimal();
    else if (key.dataset.action === 'clear') clearAll();
    else if (key.dataset.action === 'backspace') backspace();
    else if (key.dataset.action === 'answer') showAnswer();
    else if (key.dataset.action === 'memory') showMemory();
    else if (key.dataset.action === 'memory-clear') clearMemory();
});

// Keyboard: digits, + - * / . , Enter = ANS, Escape = C, M = memory
document.addEventListener('keydown', (event) => {
    const isM = event.key.toLowerCase() === 'm';
    if (!isM) memoryIndex = -1;

    if (/^\d$/.test(event.key)) addDigit(event.key);
    else if (OPERATORS.includes(event.key)) addOperator(event.key);
    else if (event.key === '.') addDecimal();
    else if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); showAnswer(); }
    else if (event.key === 'Backspace') backspace();
    else if (event.key === 'Escape') clearAll();
    else if (isM) showMemory();
});
