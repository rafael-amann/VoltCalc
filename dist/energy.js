export function calculateEnergy({ power, quantity, hours, days, tariff }) {
    if (![power, quantity, hours, days, tariff].every(Number.isFinite)) {
        throw new Error('Preencha todos os campos com números válidos.');
    }
    if (power <= 0)
        throw new Error('A potência deve ser maior que zero.');
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
        throw new Error('A quantidade deve ser um número inteiro maior ou igual a 1.');
    }
    if (hours < 0 || hours > 24)
        throw new Error('As horas por dia devem estar entre 0 e 24.');
    if (!Number.isInteger(days) || days < 0 || days > 31) {
        throw new Error('Os dias devem ser um número inteiro entre 0 e 31.');
    }
    if (tariff < 0)
        throw new Error('A tarifa não pode ser negativa.');
    // O consumo diário representa um dia em que os aparelhos são usados.
    const dailyConsumption = power / 1000 * hours * quantity;
    const monthlyConsumption = dailyConsumption * days;
    const dailyCost = dailyConsumption * tariff;
    const monthlyCost = monthlyConsumption * tariff;
    if (![dailyConsumption, monthlyConsumption, dailyCost, monthlyCost].every(Number.isFinite)) {
        throw new Error('Os valores são grandes demais para calcular. Reduza as entradas.');
    }
    return { dailyConsumption, monthlyConsumption, dailyCost, monthlyCost };
}
