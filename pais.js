var es_locale = {
  dateTime: '%A, %e de %B de %Y, %X',
  date: '%d/%m/%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: [
    'domingo',
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
  ],
  shortDays: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  months: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
  shortMonths: [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ],
};

var pt_locale = {
  dateTime: '%A, %e de %B de %Y. %X',
  date: '%d/%m/%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  shortDays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  months: [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ],
  shortMonths: [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ],
};

let setLocale = () => {
  const lang = d3.select('html').property('lang');
  if (lang == 'es-ES') {
    d3.timeFormatDefaultLocale(es_locale);
  }
  if (lang == 'pt-br') {
    d3.timeFormatDefaultLocale(pt_locale);
  }
};

const colorGroup = [
  '#4A72B8',
  '#ED7D30',
  '#A5A5A5',
  '#FDC010',
  '#5D9BD3',
  '#71AD46',
  '#264579',
  '#9E4B23',
  '#646464',
  '#98752B',
  '#255F92',
  '#446931',
  '#6C8EC9',
  '#F2975B',
  '#939697',
  '#FFCF34',
  '#7DAFDD',
  '#8DC268',
  '#3A5829',
  '#ED7D30',
  '#848484',
  '#CA9A2C',
  '#347EC1',
  '#C55C28',
  '#91ABD9',
  '#F3B183',
  '#8A8F90',
  '#FFDA68',
  '#9DC3E5',
  '#AAD18D',
  '#213964',
  '#4A72B8',
];


