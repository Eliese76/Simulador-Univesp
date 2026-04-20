import { Question } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    subject: "Matemática",
    text: "Em uma livraria, no setor responsável por preparar presentes, havia 63 livros. Após embalar parte deles, a razão do número de exemplares prontos para o número de exemplares não prontos era 4/5. O número de livros que ainda deveriam ser embalados era",
    options: ["25", "28", "30", "32", "35"],
    correctAnswer: 4,
    explanation: "Seja x a parte pronta e y a não pronta. x + y = 63 e x/y = 4/5. Então 4y = 5x => x = 4y/5. 4y/5 + y = 63 => 9y/5 = 63 => 9y = 315 => y = 35.",
    points: 10
  },
  {
    id: 2,
    subject: "Matemática",
    text: "Uma empresa fabricou, em um mesmo dia, o total de 900 peças, sendo algumas do tipo P e outras do tipo Q, de modo que o número de peças fabricadas do tipo Q foi igual a 80% do número de peças fabricadas do tipo P. Sabendo que 5% das peças do tipo P e 8% das peças do tipo Q apresentaram defeitos, o número total de peças defeituosas foi",
    options: ["57", "65", "78", "86", "93"],
    correctAnswer: 0,
    explanation: "P + Q = 900 e Q = 0,8P. P + 0,8P = 900 => 1,8P = 900 => P = 500, Q = 400. Defeitos P = 0,05 * 500 = 25. Defeitos Q = 0,08 * 400 = 32. Total = 25 + 32 = 57.",
    points: 10
  },
  {
    id: 5,
    subject: "Matemática",
    text: "Uma pessoa comprou 4 livros de ficção e 3 livros técnicos, todos distintos entre si, e irá separar 2 livros de ficção e 1 livro técnico para ler nas férias. O número de maneiras distintas de ela escolher os 3 livros é",
    options: ["2", "6", "9", "15", "18"],
    correctAnswer: 4,
    explanation: "C(4,2) * C(3,1) = [4! / (2! * 2!)] * 3 = 6 * 3 = 18.",
    points: 10
  },
  {
    id: 11,
    subject: "Português",
    text: "No cartum de André Dahmer, a frase 'SUA LIGAÇÃO É MUITO IMPORTANTE PARA NÓS' é dita enquanto o homem aguarda. O título é 'O HOMEM QUE ACREDITAVA EM PROPAGANDAS'. Depreende-se que as propagandas são:",
    options: ["empáticas", "comedidas", "manipuladoras", "fidedignas", "detalhistas"],
    correctAnswer: 2,
    explanation: "O cartum critica a falsidade das mensagens publicitárias que fingem se importar com o cliente enquanto o fazem esperar.",
    points: 10
  },
  {
    id: 13,
    subject: "Português",
    text: "No microconto de Lygia Fagundes Telles: '— Fui me confessar ao mar. — O que ele disse? — Nada.'. Para obter humor, o texto explora a polissemia de 'Nada', que pode ser interpretado como pronome ou como:",
    options: ["verbo", "adjetivo", "conjunção", "advérbio", "substantivo"],
    correctAnswer: 0,
    explanation: "'Nada' pode ser o pronome (coisa nenhuma) ou o verbo 'nadar' no presente do indicativo.",
    points: 10
  },
  {
    id: 21,
    subject: "Inglês",
    text: "According to the text about Brazil nuts (castanha do Brasil), the main purpose of the text is to:",
    options: [
      "alert readers to the possible dangers of consuming too many nuts.",
      "suggest ways for readers to incorporate nuts into a healthy diet.",
      "highlight the numerous health benefits of consuming Brazil nuts.",
      "compare the nutritional value of Brazil nuts with other types.",
      "discuss the environmental impact of harvesting the nuts."
    ],
    correctAnswer: 2,
    explanation: "O texto foca nos diversos benefícios à saúde (selênio, pele, cérebro, etc.).",
    points: 10
  },
  {
    id: 25,
    subject: "Inglês",
    text: "De acordo com o texto, um nutriente presente na castanha do Brasil essencial para a formação e manutenção dos ossos é o:",
    options: ["zinco", "ácido elágico", "selênio", "magnésio", "ômega 3"],
    correctAnswer: 3,
    explanation: "O texto menciona explicitamente que o magnésio 'supports bone health'.",
    points: 10
  },
  {
    id: 31,
    subject: "História",
    text: "Os trechos da Constituição de 1824 indicam que o Poder Legislativo é delegado à Assembleia Geral e que o Senado é vitalício. Isso indica que, no século XIX, o Brasil tinha uma monarquia:",
    options: [
      "constitucional, com divisão de poderes políticos.",
      "absolutista, sob o controle do imperador.",
      "parlamentarista, com exclusão do poder executivo.",
      "representativa, com governo exercido pelo Parlamento.",
      "dual, sob o comando de deputados e senadores."
    ],
    correctAnswer: 0,
    explanation: "A Constituição de 1824 instituía uma monarquia constitucional com quatro poderes (Executivo, Legislativo, Judiciário e Moderador).",
    points: 10
  },
  {
    id: 42,
    subject: "Química",
    text: "A purina é um composto orgânico nitrogenado presente nos ácidos nucleicos. Qual é a fórmula molecular da purina?",
    options: ["C4HN4", "C5HN4", "C5H4N4", "C6H4N4", "C6H5N4"],
    correctAnswer: 2,
    explanation: "A purina consiste em um anel pirimidina fundido a um anel imidazol, resultando em C5H4N4.",
    points: 10
  },
  {
    id: 53,
    subject: "Física",
    text: "A energia proveniente do Sol e que é coletada na superfície da Terra propaga-se até a Terra por meio de:",
    options: [
      "do vento solar.",
      "de partículas subatômicas.",
      "de ondas mecânicas.",
      "de ondas eletromagnéticas.",
      "de ondas gravitacionais."
    ],
    correctAnswer: 3,
    explanation: "O calor e a luz do Sol viajam pelo vácuo do espaço na forma de radiação eletromagnética.",
    points: 10
  }
];
