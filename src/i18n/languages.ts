// Languages Google Translate supports. Codes are Google's (Chinese is shown as one language here).
export const GOOGLE_LANGUAGES: { code: string; name: string }[] = [
  ["af", "Afrikaans"], ["sq", "Albanian"], ["am", "Amharic"], ["ar", "Arabic"], ["hy", "Armenian"], ["az", "Azerbaijani"],
  ["eu", "Basque"], ["be", "Belarusian"], ["bn", "Bengali"], ["bs", "Bosnian"], ["bg", "Bulgarian"], ["ca", "Catalan"],
  ["ceb", "Cebuano"], ["ny", "Chichewa"], ["zh", "Chinese"], ["co", "Corsican"], ["hr", "Croatian"], ["cs", "Czech"],
  ["da", "Danish"], ["nl", "Dutch"], ["en", "English"], ["eo", "Esperanto"], ["et", "Estonian"], ["tl", "Filipino"],
  ["fi", "Finnish"], ["fr", "French"], ["fy", "Frisian"], ["gl", "Galician"], ["ka", "Georgian"], ["de", "German"],
  ["el", "Greek"], ["gu", "Gujarati"], ["ht", "Haitian Creole"], ["ha", "Hausa"], ["haw", "Hawaiian"], ["iw", "Hebrew"],
  ["hi", "Hindi"], ["hmn", "Hmong"], ["hu", "Hungarian"], ["is", "Icelandic"], ["ig", "Igbo"], ["id", "Indonesian"],
  ["ga", "Irish"], ["it", "Italian"], ["ja", "Japanese"], ["jw", "Javanese"], ["kn", "Kannada"], ["kk", "Kazakh"],
  ["km", "Khmer"], ["rw", "Kinyarwanda"], ["ko", "Korean"], ["ku", "Kurdish"], ["ky", "Kyrgyz"], ["lo", "Lao"],
  ["la", "Latin"], ["lv", "Latvian"], ["lt", "Lithuanian"], ["lb", "Luxembourgish"], ["mk", "Macedonian"], ["mg", "Malagasy"],
  ["ms", "Malay"], ["ml", "Malayalam"], ["mt", "Maltese"], ["mi", "Maori"], ["mr", "Marathi"], ["mn", "Mongolian"],
  ["my", "Myanmar (Burmese)"], ["ne", "Nepali"], ["no", "Norwegian"], ["or", "Odia"], ["ps", "Pashto"], ["fa", "Persian"],
  ["pl", "Polish"], ["pt", "Portuguese"], ["pa", "Punjabi"], ["ro", "Romanian"], ["ru", "Russian"], ["sm", "Samoan"],
  ["gd", "Scots Gaelic"], ["sr", "Serbian"], ["st", "Sesotho"], ["sn", "Shona"], ["sd", "Sindhi"], ["si", "Sinhala"],
  ["sk", "Slovak"], ["sl", "Slovenian"], ["so", "Somali"], ["es", "Spanish"], ["su", "Sundanese"], ["sw", "Swahili"],
  ["sv", "Swedish"], ["tg", "Tajik"], ["ta", "Tamil"], ["tt", "Tatar"], ["te", "Telugu"], ["th", "Thai"],
  ["tr", "Turkish"], ["tk", "Turkmen"], ["uk", "Ukrainian"], ["ur", "Urdu"], ["ug", "Uyghur"], ["uz", "Uzbek"],
  ["vi", "Vietnamese"], ["cy", "Welsh"], ["xh", "Xhosa"], ["yi", "Yiddish"], ["yo", "Yoruba"], ["zu", "Zulu"],
].map(([code, name]) => ({ code, name }));

const NAMES: Record<string, string> = Object.fromEntries(GOOGLE_LANGUAGES.map((l) => [l.code, l.name]));

export const langName = (code: string) => NAMES[code] ?? code;

/** The browser's language if Google supports it, else English. Used as a signup default. */
export function browserLangCode(): string {
  const base = (typeof navigator !== "undefined" ? navigator.language : "en").toLowerCase().split("-")[0];
  return NAMES[base] ? base : "en";
}

/** Code Google's translation API expects. */
export const apiCode = (code: string) => (code === "zh" ? "zh-CN" : code);
