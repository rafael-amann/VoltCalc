export const quantities = {
    current: { label: 'Corrente', unit: 'A' },
    voltage: { label: 'Tensão', unit: 'V' },
    resistance: { label: 'Resistência', unit: 'Ω' },
    power: { label: 'Potência', unit: 'W' },
};
// Cada entrada associa a fórmula matemática aos dois valores necessários.
export const formulas = [
    { target: 'current', inputs: ['power', 'voltage'], expression: 'I = P / V', solve: (p, v) => p / v },
    { target: 'current', inputs: ['voltage', 'resistance'], expression: 'I = V / R', solve: (v, r) => v / r },
    { target: 'current', inputs: ['power', 'resistance'], expression: 'I = √(P / R)', solve: (p, r) => Math.sqrt(p / r) },
    { target: 'voltage', inputs: ['current', 'resistance'], expression: 'V = I × R', solve: (i, r) => i * r },
    { target: 'voltage', inputs: ['power', 'current'], expression: 'V = P / I', solve: (p, i) => p / i },
    { target: 'voltage', inputs: ['power', 'resistance'], expression: 'V = √(P × R)', solve: (p, r) => Math.sqrt(p * r) },
    { target: 'resistance', inputs: ['voltage', 'current'], expression: 'R = V / I', solve: (v, i) => v / i },
    { target: 'resistance', inputs: ['voltage', 'power'], expression: 'R = V² / P', solve: (v, p) => v * v / p },
    { target: 'resistance', inputs: ['power', 'current'], expression: 'R = P / I²', solve: (p, i) => p / (i * i) },
    { target: 'power', inputs: ['voltage', 'current'], expression: 'P = V × I', solve: (v, i) => v * i },
    { target: 'power', inputs: ['resistance', 'current'], expression: 'P = R × I²', solve: (r, i) => r * i * i },
    { target: 'power', inputs: ['voltage', 'resistance'], expression: 'P = V² / R', solve: (v, r) => v * v / r },
];
export function calculate(formula, first, second) {
    if (![first, second].every(value => Number.isFinite(value) && value > 0)) {
        throw new Error('Preencha os dois campos com números maiores que zero.');
    }
    const result = formula.solve(first, second);
    if (!Number.isFinite(result) || result <= 0) {
        throw new Error('Esses valores ultrapassam o limite numérico. Use valores menores ou menos próximos de zero.');
    }
    return result;
}
