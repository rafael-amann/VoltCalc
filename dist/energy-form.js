import { calculateEnergy } from './energy.js';
const form = document.querySelector('#energy-form');
const error = document.querySelector('#energy-error');
const results = document.querySelector('#energy-results');
const energyFormat = new Intl.NumberFormat('pt-BR', { maximumSignificantDigits: 8 });
const currencyFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
function readField(name) {
    const field = form.elements.namedItem(name);
    const value = field.value.trim().replace(',', '.');
    return /^\d+(\.\d+)?$/.test(value) ? Number(value) : NaN;
}
function clearResults() {
    error.textContent = '';
    results.querySelectorAll('output').forEach(output => { output.textContent = '—'; });
}
form.addEventListener('input', clearResults);
form.addEventListener('submit', event => {
    event.preventDefault();
    clearResults();
    try {
        const values = calculateEnergy({
            power: readField('power'),
            quantity: readField('quantity'),
            hours: readField('hours'),
            days: readField('days'),
            tariff: readField('tariff'),
        });
        results.querySelector('#daily-consumption').textContent = `${energyFormat.format(values.dailyConsumption)} kWh`;
        results.querySelector('#monthly-consumption').textContent = `${energyFormat.format(values.monthlyConsumption)} kWh`;
        results.querySelector('#daily-cost').textContent = currencyFormat.format(values.dailyCost);
        results.querySelector('#monthly-cost').textContent = currencyFormat.format(values.monthlyCost);
    }
    catch (cause) {
        error.textContent = cause instanceof Error ? cause.message : 'Não foi possível calcular.';
    }
});
// Exemplo guiado: aquecedor residencial com tarifa fictícia, não predefinida.
const exampleButton = document.querySelector('#use-example');
const calculateButton = form.querySelector('button[type="submit"]');
const exampleFields = ['power', 'quantity', 'hours', 'days', 'tariff'].map(name => form.elements.namedItem(name));
const exampleValues = ['1000', '1', '2', '30', '0,95'];
const tour = document.querySelector('#example-tour');
const tourMessage = document.querySelector('#tour-message');
const tourProgress = document.querySelector('#tour-progress');
const pauseButton = document.querySelector('#tour-pause');
const nextButton = document.querySelector('#tour-next');
const closeButton = document.querySelector('#tour-close');
let tourStep = -1;
let paused = false;
let tourTimer;
let typingTimer;
let highlighted;
let typingField;
let typingValue = '';
let scrollFrame;
let messageAnimation;
let movementAnimation;
let tourPositioned = false;
// Um balão sobre a página não altera o tamanho dos campos ao se mover.
document.body.append(tour);
function positionTour(animate = false) {
    if (tourStep < 0 || !highlighted)
        return;
    const previous = tour.getBoundingClientRect();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (animate)
        movementAnimation?.cancel();
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
function centerTourField() {
    if (tourStep < 0 || !highlighted)
        return;
    positionTour(true);
    const field = highlighted.getBoundingClientRect();
    const balloonHeight = tour.getBoundingClientRect().height;
    // Centraliza o campo; em telas baixas, abre espaço para a explicação abaixo.
    const center = Math.max(field.height / 2 + 24, Math.min(window.innerHeight / 2, window.innerHeight - balloonHeight - field.height / 2 - 30));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: Math.max(0, window.scrollY + field.top + field.height / 2 - center),
        behavior: reducedMotion ? 'instant' : 'smooth' });
}
window.addEventListener('scroll', () => positionTour(), { passive: true });
window.addEventListener('resize', centerTourField);
function stopTimers() {
    window.clearTimeout(tourTimer);
    window.clearTimeout(typingTimer);
    if (scrollFrame !== undefined)
        window.cancelAnimationFrame(scrollFrame);
    messageAnimation?.cancel();
}
function closeTour() {
    stopTimers();
    tourStep = -1;
    tour.hidden = true;
    movementAnimation?.cancel();
    tourPositioned = false;
    document.body.classList.remove('tour-running');
    highlighted?.classList.remove('tour-highlight');
    typingField = undefined;
}
function scheduleNext() {
    if (!paused && tourStep < 7)
        tourTimer = window.setTimeout(() => showStep(tourStep + 1), 4500);
}
function typeNextDigit() {
    if (!typingField || paused)
        return;
    typingField.value = typingValue.slice(0, typingField.value.length + 1);
    if (typingField.value.length < typingValue.length) {
        typingTimer = window.setTimeout(typeNextDigit, 180);
    }
    else {
        typingField = undefined;
        scheduleNext();
    }
}
function showStep(step) {
    stopTimers();
    // Ao avançar durante a digitação, completa o campo antes da próxima etapa.
    if (typingField)
        typingField.value = typingValue;
    typingField = undefined;
    highlighted?.classList.remove('tour-highlight');
    tourStep = step;
    const messages = [
        'Vamos estimar o uso de um aquecedor de 1000 W. Preencheremos os dados em etapas. A tarifa é fictícia, apenas para aprender; no seu cálculo, informe a tarifa da sua conta.',
        'Potência: 1000 W. É a potência elétrica do aquecedor enquanto está aquecendo. Para este exemplo, vamos considerar que ela se mantém durante o uso.',
        'Quantidade: 1 aparelho. Se fossem dois aquecedores iguais, usados pelo mesmo tempo, o consumo seria o dobro.',
        'Tempo diário: 2 horas. Estamos considerando duas horas de aquecimento por dia. Você também pode usar decimais, como 1,5 para uma hora e meia.',
        'Dias no mês: 30. Vamos repetir esse uso por trinta dias. Informe apenas os dias em que o aparelho realmente será utilizado.',
        'Tarifa de exemplo: R$ 0,95/kWh. Esse valor é fictício e não vale para todas as regiões. No seu cálculo, substitua pela tarifa da sua conta ou distribuidora.',
        'Agora vamos calcular: 1000 ÷ 1000 × 2 × 1 = 2 kWh por dia. Em 30 dias: 2 × 30 = 60 kWh. O custo é o consumo multiplicado pela tarifa.',
        'Resultado: 2 kWh e R$ 1,90 por dia; 60 kWh e R$ 57,00 no mês. São estimativas do aparelho. A conta pode incluir outros componentes. Experimente seus próprios valores e sua tarifa!',
    ];
    const anchors = [exampleButton, ...exampleFields, calculateButton, results];
    highlighted = anchors[step];
    highlighted.classList.add('tour-highlight');
    document.body.classList.add('tour-running');
    tour.hidden = false;
    tourProgress.textContent = `Exemplo guiado · ${step + 1} de 8`;
    tourMessage.textContent = messages[step];
    nextButton.hidden = step === 7;
    pauseButton.hidden = step === 7;
    closeButton.textContent = step === 7 ? 'Concluir' : 'Encerrar';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion) {
        messageAnimation = tourMessage.animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 260, easing: 'ease-out' });
    }
    scrollFrame = window.requestAnimationFrame(() => {
        if (tourStep !== step)
            return;
        centerTourField();
    });
    if (step >= 1 && step <= 5) {
        typingField = exampleFields[step - 1];
        typingValue = exampleValues[step - 1];
        typingField.value = '';
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            typingField.value = typingValue;
            typingField = undefined;
            scheduleNext();
        }
        else if (!paused)
            typingTimer = window.setTimeout(typeNextDigit, 650);
    }
    else {
        if (step === 7)
            form.requestSubmit();
        scheduleNext();
    }
}
function useExample() {
    closeTour();
    clearResults();
    exampleFields.forEach(field => { field.value = ''; });
    paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    pauseButton.textContent = paused ? 'Continuar' : 'Pausar';
    showStep(0);
}
pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.textContent = paused ? 'Continuar' : 'Pausar';
    stopTimers();
    if (!paused) {
        if (typingField)
            typeNextDigit();
        else
            scheduleNext();
    }
});
nextButton.addEventListener('click', () => showStep(tourStep + 1));
closeButton.addEventListener('click', () => { closeTour(); exampleButton.focus({ preventScroll: true }); });
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && tourStep >= 0) {
        closeTour();
        exampleButton.focus({ preventScroll: true });
    }
});
form.querySelector('button[type="submit"]').addEventListener('click', closeTour);
exampleButton.addEventListener('click', useExample);
form.addEventListener('input', closeTour);
