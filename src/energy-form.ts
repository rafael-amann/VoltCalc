import { calculateEnergy } from './energy.js';

const form = document.querySelector<HTMLFormElement>('#energy-form')!;
const error = document.querySelector<HTMLParagraphElement>('#energy-error')!;
const results = document.querySelector<HTMLDivElement>('#energy-results')!;
const energyFormat = new Intl.NumberFormat('pt-BR', { maximumSignificantDigits: 8 });
const currencyFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function readField(name: string): number {
  const field = form.elements.namedItem(name) as HTMLInputElement;
  const value = field.value.trim().replace(',', '.');
  return /^\d+(\.\d+)?$/.test(value) ? Number(value) : NaN;
}
function clearResults(): void {
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
    results.querySelector('#daily-consumption')!.textContent = `${energyFormat.format(values.dailyConsumption)} kWh`;
    results.querySelector('#monthly-consumption')!.textContent = `${energyFormat.format(values.monthlyConsumption)} kWh`;
    results.querySelector('#daily-cost')!.textContent = currencyFormat.format(values.dailyCost);
    results.querySelector('#monthly-cost')!.textContent = currencyFormat.format(values.monthlyCost);
  } catch (cause) {
    error.textContent = cause instanceof Error ? cause.message : 'Não foi possível calcular.';
  }
});
