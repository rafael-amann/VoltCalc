import { calculate, formulas, quantities } from './calculations.js';

const form = document.querySelector<HTMLFormElement>('#calculator-form')!;
const target = document.querySelector<HTMLSelectElement>('#target')!;
const formulaSelect = document.querySelector<HTMLSelectElement>('#formula')!;
const firstInput = document.querySelector<HTMLInputElement>('#first-value')!;
const secondInput = document.querySelector<HTMLInputElement>('#second-value')!;
const firstLabel = document.querySelector<HTMLLabelElement>('#first-label')!;
const secondLabel = document.querySelector<HTMLLabelElement>('#second-label')!;
const expression = document.querySelector<HTMLParagraphElement>('#expression')!;
const result = document.querySelector<HTMLOutputElement>('#result')!;
const error = document.querySelector<HTMLParagraphElement>('#error')!;

function clearResult(): void {
  result.textContent = '—';
  error.textContent = '';
}
function updateFields(): void {
  const formula = formulas[Number(formulaSelect.value)];
  const [first, second] = formula.inputs.map(input => quantities[input]);
  firstLabel.textContent = `${first.label} (${first.unit})`;
  secondLabel.textContent = `${second.label} (${second.unit})`;
  firstInput.value = '';
  secondInput.value = '';
  expression.textContent = formula.expression;
  clearResult();
}
function updateFormulas(): void {
  formulaSelect.replaceChildren();
  formulas.forEach((formula, index) => {
    if (formula.target === target.value) {
      const label = formula.inputs.map(input => quantities[input].label).join(' + ');
      formulaSelect.add(new Option(label, String(index)));
    }
  });
  updateFields();
}
function readNumber(value: string): number {
  // Aceita vírgula ou ponto decimal, sem separadores de milhar.
  const normalized = value.trim().replace(',', '.');
  return /^\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : NaN;
}
target.addEventListener('change', updateFormulas);
formulaSelect.addEventListener('change', updateFields);
firstInput.addEventListener('input', clearResult);
secondInput.addEventListener('input', clearResult);
form.addEventListener('submit', event => {
  event.preventDefault();
  clearResult();
  try {
    const formula = formulas[Number(formulaSelect.value)];
    const value = calculate(formula, readNumber(firstInput.value), readNumber(secondInput.value));
    const formatted = new Intl.NumberFormat('pt-BR', { maximumSignificantDigits: 8 }).format(value);
    result.textContent = `${formatted} ${quantities[formula.target].unit}`;
  } catch (cause) {
    error.textContent = cause instanceof Error ? cause.message : 'Não foi possível calcular.';
  }
});
updateFormulas();
