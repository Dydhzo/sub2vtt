// This map provides a fallback encoding for a given language when UTF-8 detection fails.
// It's based on the most common legacy (pre-Unicode) encoding for that language or language family.
const ENCODING_MAP = {
    // --- Western European ---
    'english': 'windows-1252',
    'french': 'windows-1252',
    'spanish': 'windows-1252',
    'german': 'windows-1252',
    'italian': 'windows-1252',
    'portuguese': 'windows-1252',
    'brazillian-portuguese': 'windows-1252',
    'dutch': 'windows-1252',
    'swedish': 'windows-1252',
    'norwegian': 'windows-1252',
    'danish': 'windows-1252',
    'finnish': 'windows-1252',
    'icelandic': 'windows-1252',
    'catalan': 'windows-1252',
    'basque': 'windows-1252',
    'dutch-english': 'windows-1252',
    'english-german': 'windows-1252',
    'esperanto': 'windows-1252',
    'tagalog': 'windows-1252',
    'indonesian': 'windows-1252',
    'malay': 'windows-1252',
    'swahili': 'windows-1252',
    'greenlandic': 'windows-1252',
    'kinyarwanda': 'windows-1252',
    'somali': 'windows-1252',
    'sundanese': 'windows-1252',
    'yoruba': 'windows-1252',

    // --- Central & Eastern European ---
    'czech': 'windows-1250',
    'hungarian': 'windows-1250',
    'polish': 'windows-1250',
    'romanian': 'windows-1250',
    'croatian': 'windows-1250',
    'slovak': 'windows-1250',
    'slovenian': 'windows-1250',
    'bosnian': 'windows-1250',
    'albanian': 'windows-1250',
    'hungarian-english': 'windows-1250',

    // --- Cyrillic ---
    'russian': 'windows-1251',
    'bulgarian': 'windows-1251',
    'serbian': 'windows-1251',
    'macedonian': 'windows-1251',
    'ukrainian': 'windows-1251',
    'belarusian': 'windows-1251',
    'mongolian': 'windows-1251',
    'bulgarian-english': 'windows-1251',

    // --- Specific Languages ---
    'greek': 'windows-1253',
    'turkish': 'windows-1254',
    'azerbaijani': 'windows-1254',
    'hebrew': 'windows-1255',
    'arabic': 'windows-1256',
    'farsi_persian': 'windows-1256',
    'kurdish': 'windows-1256',
    'pashto': 'windows-1256',
    'urdu': 'windows-1256',
    'vietnamese': 'windows-1258',
    'estonian': 'windows-1257',
    'latvian': 'windows-1257',
    'lithuanian': 'windows-1257',
    'thai': 'windows-874',
    'japanese': 'shift_jis',
    'korean': 'euc-kr',
    'chinese-bg-code': 'gb2312',
    'big_5_code': 'big5',
    'armenian': null, // No reliable legacy encoding, rely on detection
    'georgian': null, // No reliable legacy encoding, rely on detection
    'burmese': null, // No reliable legacy encoding, rely on detection
    'cambodian/khmer': null, // No reliable legacy encoding, rely on detection
    'hindi': null, // No reliable legacy encoding, rely on detection
    'kannada': null, // No reliable legacy encoding, rely on detection
    'malayalam': null, // No reliable legacy encoding, rely on detection
    'manipuri': null, // No reliable legacy encoding, rely on detection
    'nepali': null, // No reliable legacy encoding, rely on detection
    'punjabi': null, // No reliable legacy encoding, rely on detection
    'sinhala': null, // No reliable legacy encoding, rely on detection
    'tamil': null, // No reliable legacy encoding, rely on detection
    'telugu': null, // No reliable legacy encoding, rely on detection
    'bengali': null // No reliable legacy encoding, rely on detection
};

module.exports = ENCODING_MAP;
