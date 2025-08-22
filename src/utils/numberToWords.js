// More comprehensive number to words converter.
// Supports decimals and larger numbers.
// Handles English and French.

const ones = {
    en: ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
    fr: ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
};
const tens = {
    en: ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
    fr: ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix']
};
const scales = {
    en: ['', 'thousand', 'million', 'billion', 'trillion'],
    fr: ['', 'mille', 'million', 'milliard', 'billion']
};
const currency = {
    en: { major: 'francs', minor: 'cents' },
    fr: { major: 'francs', minor: 'cents' }
};

function convertThreeDigits(num, lang) {
    let result = '';
    const numStr = num.toString();

    if (num >= 100) {
        const hundred = Math.floor(num / 100);
        if (lang === 'fr') {
            if (hundred > 1) {
                result += ones[lang][hundred] + ' cent';
            } else {
                result += 'cent';
            }
            if (num % 100 !== 0) {
                result += ' ';
            } else if (numStr.endsWith('00')) {
                // Plural for 'cents' if it's an even hundred, e.g., 200, 300
                if (hundred > 1) result += 's';
            }
        } else { // English
            result += ones[lang][hundred] + ' hundred';
            if (num % 100 !== 0) {
                result += ' ';
            }
        }
        num %= 100;
    }

    if (num > 0) {
        if (num < 20) {
            result += ones[lang][num];
        } else {
            const ten = Math.floor(num / 10);
            const one = num % 10;
            if (lang === 'fr') {
                if (ten === 7 || ten === 9) {
                    result += tens[lang][ten - 1];
                    const remainder = 10 + one;
                    result += (remainder > 10 ? '-' + ones[lang][remainder] : '');
                } else {
                    result += tens[lang][ten];
                    if (one > 0) {
                        if (ten === 8 && one === 0) { // quatre-vingts
                           result += 's';
                        } else {
                           result += (one === 1 && ten < 8 ? ' et ' : '-') + ones[lang][one];
                        }
                    }
                }
                 if (ten === 8 && one === 0) { // quatre-vingts
                    result += 's';
                }
            } else { // English
                result += tens[lang][ten];
                if (one > 0) {
                    result += '-' + ones[lang][one];
                }
            }
        }
    }
    return result;
}

export function toWords(number, lang = 'en', options = {}) {
    const { currency: useCurrency = false } = options;

    if (typeof number !== 'number') {
        return 'Invalid number';
    }
    if (number === 0) return lang === 'en' ? 'zero' : 'zéro';

    const integerPart = Math.floor(number);
    const decimalPart = Math.round((number - integerPart) * 100);

    let integerWords = '';
    if (integerPart === 0) {
        integerWords = lang === 'en' ? 'zero' : 'zéro';
    } else {
        let tempNum = integerPart;
        let scaleIndex = 0;
        let parts = [];

        while (tempNum > 0) {
            const chunk = tempNum % 1000;
            if (chunk > 0) {
                let chunkWords = convertThreeDigits(chunk, lang);
                if (scaleIndex > 0) {
                    if (lang === 'fr' && chunk === 1 && scaleIndex === 1) { // Special case for 'mille' not 'un mille'
                        chunkWords = '';
                    }
                    chunkWords += ' ' + scales[lang][scaleIndex];
                    if (lang === 'fr' && chunk > 1 && scaleIndex > 1) { // millions, milliards
                        chunkWords += 's';
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
        const majorCurrency = currency[lang].major;
        const minorCurrency = currency[lang].minor;
        result += ` ${majorCurrency}`;
        if (decimalPart > 0) {
            const decimalWords = toWords(decimalPart, lang, { currency: false });
            result += ` and ${decimalWords} ${minorCurrency}`;
        }
    } else if (decimalPart > 0) {
        const decimalWords = toWords(decimalPart, lang, { currency: false });
        result += (lang === 'en' ? ' point ' : ' virgule ') + decimalWords;
    }

    return result.replace(/\s+/g, ' ').trim();
}