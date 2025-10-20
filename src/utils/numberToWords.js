// Multilingual number-to-words converter
// Supports: en, fr, es, it, ja, ewe

const languages = {
  en: {
    zero: "zero",
    ones: ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
    tens: ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
    scales: ['', 'thousand', 'million', 'billion'],
    currency: { major: 'francs', minor: 'cents' },
    joinWord: '-', hundred: "hundred", andWord: "and", pointWord: "point"
  },

  fr: {
    zero: "zéro",
    ones: ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'],
    tens: ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'],
    scales: ['', 'mille', 'million', 'milliard'],
    currency: { major: 'francs', minor: 'centimes' },
    joinWord: '-', hundred: "cent", andWord: "et", pointWord: "virgule"
  },

  es: {
    zero: "cero",
    ones: ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'],
    tens: ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'],
    scales: ['', 'mil', 'millón', 'mil millones'],
    currency: { major: 'francos', minor: 'céntimos' },
    joinWord: ' y ', hundred: "cien", andWord: "y", pointWord: "coma"
  },

  it: {
    zero: "zero",
    ones: ['', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove'],
    tens: ['', 'dieci', 'venti', 'trenta', 'quaranta', 'cinquanta', 'sessanta', 'settanta', 'ottanta', 'novanta'],
    scales: ['', 'mille', 'milione', 'miliardo'],
    currency: { major: 'franchi', minor: 'centesimi' },
    joinWord: '', hundred: "cento", andWord: "e", pointWord: "virgola"
  },

  ja: {
    zero: "零",
    ones: ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九'],
    tens: ['', '十', '二十', '三十', '四十', '五十', '六十', '七十', '八十', '九十'],
    scales: ['', '千', '万', '億', '兆'],
    currency: { major: 'フラン', minor: '銭' },
    joinWord: '', hundred: "百", andWord: "", pointWord: "点"
  },

  ee: {
    zero: "ŋkeke",
    ones: ['', 'ɖeka', 'eve', 'etɔ̃', 'ene', 'atɔ̃', 'adrekɔ', 'adrɔ̃', 'enye', 'wo', 'ewo'],
    tens: ['', 'blukɔ', 'adekɛ', 'etokɛ', 'enekɛ', 'atɔ̃kɛ', 'adrekɔkɛ', 'adrɔ̃kɛ', 'enyekɛ', 'woe'],
    scales: ['', 'alafíá', 'ɖekakpla', 'atɔ̃kpla'],
    currency: { major: 'franc', minor: 'pesewa' },
    joinWord: ' kple ', hundred: "alafa", andWord: "kple", pointWord: "kpɔ"
  }
};

function convertThreeDigits(num, lang) {
  const L = languages[lang];
  let result = '';

  if (num >= 100) {
    const hundred = Math.floor(num / 100);
    result += (hundred > 0 ? L.ones[hundred] + ' ' : '') + L.hundred;
    if (num % 100 !== 0) result += ' ';
    num %= 100;
  }

  if (num > 0) {
    if (num < 20) {
      result += L.ones[num];
    } else {
      const ten = Math.floor(num / 10);
      const one = num % 10;
      result += L.tens[ten];
      if (one > 0) {
        if (lang === 'es') {
          result += L.joinWord + L.ones[one];
        } else if (lang === 'fr' && one === 1 && (ten === 2 || ten === 3 || ten === 4 || ten === 5 || ten === 6)) {
          result += ' ' + L.andWord + ' ' + L.ones[one]; // ex: vingt et un
        } else {
          result += L.joinWord + L.ones[one];
        }
      }
    }
  }

  return result.trim();
}

export function toWords(number, lang = 'en', options = {}) {
  const { currency: useCurrency = false } = options;
  const L = languages[lang];
  if (!L) return "Unsupported language";

  if (typeof number !== 'number') return 'Invalid number';
  if (number === 0) return L.zero;

  const integerPart = Math.floor(number);
  const decimalPart = Math.round((number - integerPart) * 100);

  let integerWords = '';
  if (integerPart === 0) {
    integerWords = L.zero;
  } else {
    let tempNum = integerPart;
    let scaleIndex = 0;
    let parts = [];

    while (tempNum > 0) {
      const chunk = tempNum % 1000;
      if (chunk > 0) {
        let chunkWords = convertThreeDigits(chunk, lang);
        if (scaleIndex > 0) {
          chunkWords += ' ' + L.scales[scaleIndex];
          if (lang === 'fr' && chunk > 1 && scaleIndex > 1) {
            chunkWords += 's'; // pluriel millions/milliards
          }
          if (lang === 'es' && scaleIndex === 2 && chunk > 1) {
            chunkWords = chunkWords.replace("millón", "millones");
          }
        }
        parts.push(chunkWords);
      }
      tempNum = Math.floor(tempNum / 1000);
      scaleIndex++;
    }
    integerWords = parts.reverse().join(' ').trim();
  }

  let result = integerWords;

  if (useCurrency) {
    result += ` ${L.currency.major}`;
    if (decimalPart > 0) {
      const decimalWords = toWords(decimalPart, lang, { currency: false });
      if (lang === 'es') {
        result += ` con ${decimalWords} ${L.currency.minor}`;
      } else if (lang === 'ja') {
        result += ` ${decimalWords}${L.currency.minor}`;
      } else {
        result += ` ${L.andWord ? L.andWord + ' ' : ''}${decimalWords} ${L.currency.minor}`;
      }
    }
  } else if (decimalPart > 0) {
    const decimalWords = toWords(decimalPart, lang, { currency: false });
    result += ` ${L.pointWord} ${decimalWords}`;
  }

  return result.replace(/\s+/g, ' ').trim();
}

// --- Examples ---
// console.log(toWords(1234.56, "en", { currency: true }));
// console.log(toWords(1234.56, "fr", { currency: true }));
// console.log(toWords(1234.56, "es", { currency: true }));
// console.log(toWords(1234.56, "it", { currency: true }));
// console.log(toWords(1234.56, "ja", { currency: true }));
// console.log(toWords(1234.56, "ewe", { currency: true }));
