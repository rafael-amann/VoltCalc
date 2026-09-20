# VoltCalc

Projeto de portfólio para aprender TypeScript construindo ferramentas de cálculos elétricos, uma etapa por vez.

## Estado do projeto

v0.1 em desenvolvimento. Esta primeira etapa calcula a corrente de um exemplo fixo e mostra o resultado no terminal.

O exemplo usa I = P / V: 5500 W / 220 V = 25 A. Consideramos uma carga resistiva ideal. Em corrente alternada, cargas com fator de potência diferente de 1 e sistemas trifásicos exigem outras considerações; o exemplo não dimensiona uma instalação.

## Executar

Com Node.js e npm instalados, abra um terminal nesta pasta:

```sh
npm install
npm run check
npm run build
npm start
```

Saída esperada: `25` (corrente em amperes).

## Arquivos

- `src/main.ts`: código TypeScript do primeiro cálculo.
- `package.json`: nome, versão, comandos e dependências de desenvolvimento.
- `package-lock.json`: versões exatas das dependências instaladas; deve entrar no Git.
- `tsconfig.json`: regras de compilação; lê `src`, gera JavaScript em `dist` e ativa a verificação estrita de tipos.
- `.gitignore`: exclui dependências instaladas e arquivos gerados do histórico do Git.
- `README.md`: apresentação e instruções do projeto.

## Próximas etapas da v0.1

1. Entender as variáveis, os tipos e o resultado do exemplo.
2. Transformar o cálculo em uma função e validar entradas: potência finita e não negativa, tensão finita e maior que zero.
3. Criar uma página com campos de potência e tensão e resultado em amperes.
4. Verificar os casos válidos e inválidos e publicar no GitHub.

Cada etapa deve ser entendida e registrada em um commit próprio.

## Ideias futuras

Potência, consumo em kWh, custo, cadastro de equipamentos, circuitos, histórico e queda de tensão. React, Node.js como back-end e banco de dados ficam para etapas posteriores.
