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
const exampleButton = document.querySelector<HTMLButtonElement>('#use-example')!;
const exampleDescription = document.querySelector<HTMLParagraphElement>('#example-description')!;

// Um mesmo chuveiro fornece valores coerentes para as 12 fórmulas.
const showerExample = { power: 5500, voltage: 220, current: 25, resistance: 8.8 };

const tour = document.querySelector<HTMLElement>('#example-tour')!;
const tourMessage = document.querySelector<HTMLParagraphElement>('#tour-message')!;
const tourProgress = document.querySelector<HTMLParagraphElement>('#tour-progress')!;
const pauseButton = document.querySelector<HTMLButtonElement>('#tour-pause')!;
const nextButton = document.querySelector<HTMLButtonElement>('#tour-next')!;
const closeButton = document.querySelector<HTMLButtonElement>('#tour-close')!;
let tourStep = -1;
let paused = false;
let tourTimer: number | undefined;
let typingTimer: number | undefined;
let highlighted: HTMLElement | undefined;
let typingField: HTMLInputElement | undefined;
let typingValue = '';
let scrollFrame: number | undefined;
let messageAnimation: Animation | undefined;
let movementAnimation: Animation | undefined;
let tourPositioned = false;
// Um balão sobre a página não altera o tamanho dos campos ao se mover.
document.body.append(tour);

function positionTour(animate = false): void {
  if (tourStep < 0 || !highlighted) return;
  const previous = tour.getBoundingClientRect();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (animate) movementAnimation?.cancel();
  const field = highlighted.getBoundingClientRect();
  const width = Math.min(400, window.innerWidth - 32);
  const left = Math.max(16, Math.min(field.left + field.width / 2 - width / 2, window.innerWidth - width - 16));
  tour.style.width = `${width}px`;
  tour.style.left = `${left}px`;
  tour.style.top = `${field.bottom + 14}px`;
  tour.style.setProperty('--tour-arrow-left', `${Math.max(20, Math.min(width - 28, field.left + field.width / 2 - left))}px`);
  tour.style.visibility = field.bottom < 0 || field.top > window.innerHeight ? 'hidden' : 'visible';
  if (animate && tourPositioned && !reducedMotion) {
    // Anima a distância entre os campos. A posição-base continua seguindo
    // a rolagem, sem reiniciar uma transição a cada evento de scroll.
    movementAnimation = tour.animate([
      { transform: `translate(${previous.left - left}px, ${previous.top - field.bottom - 14}px)` },
      { transform: 'translate(0, 0)' },
    ], { duration: 560, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
  }
  tourPositioned = true;
}

function centerTourField(): void {
  if (tourStep < 0 || !highlighted) return;
  positionTour(true);
  const field = highlighted.getBoundingClientRect();
  const balloonHeight = tour.getBoundingClientRect().height;
  // Centraliza o campo; em telas baixas, abre espaço para a explicação abaixo.
  const center = Math.max(field.height / 2 + 24,
    Math.min(window.innerHeight / 2, window.innerHeight - balloonHeight - field.height / 2 - 30));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: Math.max(0, window.scrollY + field.top + field.height / 2 - center),
    behavior: reducedMotion ? 'instant' : 'smooth' });
}
window.addEventListener('scroll', () => positionTour(), { passive: true });
window.addEventListener('resize', centerTourField);

function stopTimers(): void {
  window.clearTimeout(tourTimer);
  window.clearTimeout(typingTimer);
  if (scrollFrame !== undefined) window.cancelAnimationFrame(scrollFrame);
  messageAnimation?.cancel();
}
function closeTour(): void {
  stopTimers();
  tourStep = -1;
  tour.hidden = true;
  movementAnimation?.cancel();
  tourPositioned = false;
  document.body.classList.remove('tour-running');
  highlighted?.classList.remove('tour-highlight');
  typingField = undefined;
}
function scheduleNext(): void {
  if (!paused && tourStep < 4) tourTimer = window.setTimeout(() => showStep(tourStep + 1), 4500);
}
function typeNextDigit(): void {
  if (!typingField || paused) return;
  typingField.value = typingValue.slice(0, typingField.value.length + 1);
  if (typingField.value.length < typingValue.length) {
    typingTimer = window.setTimeout(typeNextDigit, 180);
  } else {
    typingField = undefined;
    scheduleNext();
  }
}
function showStep(step: number): void {
  stopTimers();
  // Ao avançar durante a digitação, completa o campo antes da próxima etapa.
  if (typingField) typingField.value = typingValue;
  typingField = undefined;
  highlighted?.classList.remove('tour-highlight');
  tourStep = step;
  const formula = formulas[Number(formulaSelect.value)];
  const [first, second] = formula.inputs;
  const format = (value: number) => String(value).replace('.', ',');
  const messages = [
    `Vamos descobrir ${quantities[formula.target].label.toLowerCase()} de um chuveiro resistivo. Neste exemplo, usamos os dois dados da opção que você escolheu. Você pode pausar ou avançar a qualquer momento.`,
    `Primeiro dado: ${quantities[first].label.toLowerCase()} de ${format(showerExample[first])} ${quantities[first].unit}. Vamos preencher esse valor no primeiro campo.`,
    `Segundo dado: ${quantities[second].label.toLowerCase()} de ${format(showerExample[second])} ${quantities[second].unit}. Agora temos os dois valores necessários.`,
    `Vamos aplicar ${formula.expression}. O botão Calcular usa os valores preenchidos para encontrar ${quantities[formula.target].label.toLowerCase()}.`,
    `Resultado: ${format(showerExample[formula.target])} ${quantities[formula.target].unit}. Esse é o valor de ${quantities[formula.target].label.toLowerCase()} do chuveiro neste modelo resistivo. Agora você pode alterar os valores e experimentar!`,
  ];
  const anchors = [exampleButton, firstInput, secondInput, expression, result];
  highlighted = anchors[step];
  highlighted.classList.add('tour-highlight');
  document.body.classList.add('tour-running');
  tour.hidden = false;
  tourProgress.textContent = `Exemplo guiado · ${step + 1} de 5`;
  tourMessage.textContent = messages[step];
  nextButton.hidden = step === 4;
  pauseButton.hidden = step === 4;
  closeButton.textContent = step === 4 ? 'Concluir' : 'Encerrar';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion) {
    messageAnimation = tourMessage.animate(
      [{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 260, easing: 'ease-out' },
    );
  }
  scrollFrame = window.requestAnimationFrame(() => {
    if (tourStep !== step) return;
    centerTourField();
  });
  if (step === 1 || step === 2) {
    typingField = step === 1 ? firstInput : secondInput;
    typingValue = format(showerExample[step === 1 ? first : second]);
    typingField.value = '';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      typingField.value = typingValue;
      typingField = undefined;
      scheduleNext();
    } else if (!paused) typingTimer = window.setTimeout(typeNextDigit, 650);
  } else {
    if (step === 4) form.requestSubmit();
    scheduleNext();
  }
}
function useExample(): void {
  closeTour();
  clearExample();
  clearResult();
  firstInput.value = '';
  secondInput.value = '';
  paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  pauseButton.textContent = paused ? 'Continuar' : 'Pausar';
  showStep(0);
}
pauseButton.addEventListener('click', () => {
  paused = !paused;
  pauseButton.textContent = paused ? 'Continuar' : 'Pausar';
  stopTimers();
  if (!paused) {
    if (typingField) typeNextDigit();
    else scheduleNext();
  }
});
nextButton.addEventListener('click', () => showStep(tourStep + 1));
closeButton.addEventListener('click', () => { closeTour(); exampleButton.focus({ preventScroll: true }); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && tourStep >= 0) { closeTour(); exampleButton.focus({ preventScroll: true }); }
});
form.querySelector<HTMLButtonElement>('button[type="submit"]')!.addEventListener('click', closeTour);

function clearExample(): void {
  closeTour();
  exampleDescription.textContent = '';
}

function clearResult(): void {
  result.textContent = '—';
  error.textContent = '';
}
function updateFields(): void {
  clearExample();
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
exampleButton.addEventListener('click', useExample);
firstInput.addEventListener('input', clearExample);
secondInput.addEventListener('input', clearExample);
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
