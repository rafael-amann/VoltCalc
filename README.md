# VoltCalc

Projeto de portfólio para aprender TypeScript construindo ferramentas de cálculos elétricos, uma etapa por vez.

## v0.1 — Calculadora elétrica

Calcule corrente (A), tensão (V), resistência (Ω) e potência (W). Cada grandeza tem três fórmulas, selecionadas pelos dois valores conhecidos. A página mostra a fórmula e a unidade do resultado.

Esta versão aceita magnitudes positivas, vírgula ou ponto decimal e rejeita campos vazios, zero, negativos e valores fora dos limites numéricos. Não use separadores de milhar. Os resultados são apresentados com até oito algarismos significativos.

As relações são para circuitos resistivos em corrente contínua ou cargas resistivas ideais em corrente alternada, com valores eficazes e fator de potência 1. Não dimensionam instalações nem representam diretamente motores ou sistemas trifásicos.

## Executar

Com Node.js e npm instalados, abra um terminal nesta pasta:

```sh
npm install
npm start
```

Abra http://localhost:5173. Para parar, pressione Ctrl+C no terminal. Depois de alterar TypeScript, rode `npm run build` em outro terminal e atualize a página.

## Arquivos e ordem sugerida de estudo

A página `fundamentals.html`, acessível pelo link **Fundamentos**, apresenta tensão, corrente, resistência, potência, Lei de Ohm e consumo em kWh. Cada card inclui explicação, fórmula, exemplo e diagrama SVG. Ela compartilha `styles.css` e o padrão de cabeçalho das demais páginas, sem dependências adicionais.

1. `src/calculations.ts`: tipos, unidades, fórmulas e validação dos números.
2. `calculator.html`: seletores, campos, botão e resultado.
3. `src/main.ts`: conecta o formulário às fórmulas e atualiza a tela.
4. `styles.css`: aparência compartilhada pelas páginas.
5. `index.html`: apresentação e acesso à calculadora.
6. `tests/calculations.test.mjs`: testes das 12 fórmulas e casos inválidos.
7. `server.cjs`: servidor local; entrega as páginas e o JavaScript gerado.
8. `tsconfig.json`: regras para converter TypeScript de `src` em JavaScript em `dist`.
9. `package.json` e `package-lock.json`: comandos, dependências e versões instaladas.
10. `.gitignore`: exclui dependências e arquivos gerados do histórico.

O servidor usa JavaScript executado pelo Node.js, apenas como ferramenta de desenvolvimento. Toda a lógica da calculadora está em TypeScript. Ainda não há back-end de aplicação nem banco de dados.

## Verificação

A página de Calculadoras também inclui **Consumo de Energia**: potência por aparelho, quantidade, horas por dia, dias no mês e tarifa manual em R$/kWh. `src/energy.ts` calcula e valida; `src/energy-form.ts` conecta o formulário. Não há tarifa predefinida. Resultados diários correspondem a um dia de uso; resultados mensais multiplicam pelos dias informados. O custo é estimado e não representa necessariamente o total da conta.

```sh
npm run check
npm test
```

Exemplos: 5500 W / 220 V = 25 A; 12 V / 2 A = 6 Ω; 12 V × 2,5 A = 30 W.

## Próximos passos

Estudar a implementação por partes e publicar no GitHub. Cada mudança deve ser registrada em um commit significativo.

Ideias futuras: consumo em kWh, custo, equipamentos, circuitos, histórico, queda de tensão e, posteriormente, React, back-end em Node.js e banco de dados.
