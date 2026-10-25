import { products, type Locale } from '../data/site';

export interface Enquiry {
  name: string; businessName: string; phone: string; product: string;
  quantity: string; unit: 'kg' | 'tonnes' | 'bags'; destination: string; message: string;
}
export type EnquiryErrors = Partial<Record<keyof Enquiry, string>>;
export function selectedProduct(value: string | null) {
  return products.some(product => product.id === value) ? value! : 'choose';
}
export function validateEnquiry(data: Enquiry, locale: Locale): EnquiryErrors {
  const errors: EnquiryErrors = {};
  const required = locale === 'ta' ? 'இந்த விவரத்தை நிரப்பவும்.' : 'Please complete this field.';
  for (const field of ['name', 'businessName', 'destination'] as const) {
    if (data[field].trim().length < 2) errors[field] = required;
    else if (data[field].length > 120) errors[field] = locale === 'ta' ? '120 எழுத்துகளுக்குள் எழுதவும்.' : 'Use 120 characters or fewer.';
  }
  if (!/^[+\d\s().-]{7,25}$/.test(data.phone) || data.phone.replace(/\D/g, '').length < 7 || data.phone.replace(/\D/g, '').length > 15) {
    errors.phone = locale === 'ta' ? 'சரியான தொலைபேசி எண்ணை உள்ளிடவும்.' : 'Enter a valid phone number, including country code if needed.';
  }
  if (!data.quantity.trim() || !Number.isFinite(Number(data.quantity)) || Number(data.quantity) <= 0 || Number(data.quantity) > 1000000 || (data.unit === 'bags' && !Number.isInteger(Number(data.quantity)))) {
    errors.quantity = locale === 'ta' ? 'சரியான நேர்மறை அளவை உள்ளிடவும். மூட்டைகள் முழு எண்ணாக இருக்க வேண்டும்.' : 'Enter a positive quantity up to 1,000,000. Bags must be a whole number.';
  }
  if (!['kg', 'tonnes', 'bags'].includes(data.unit)) errors.unit = required;
  if (data.product !== 'choose' && !products.some(p => p.id === data.product)) errors.product = required;
  if (data.message.length > 1000) errors.message = locale === 'ta' ? '1,000 எழுத்துகளுக்குள் எழுதவும்.' : 'Use 1,000 characters or fewer.';
  return errors;
}
export function composeEnquiry(data: Enquiry, locale: Locale) {
  const product = products.find(p => p.id === data.product)?.name[locale] ?? (locale === 'ta' ? 'தேர்வு செய்ய உதவுங்கள்' : 'Help me choose');
  const values = [data.name, data.businessName, data.phone, product, `${data.quantity} ${locale === 'ta' ? ({ kg: 'கிலோ', tonnes: 'டன்', bags: 'மூட்டைகள்' }[data.unit]) : data.unit}`, data.destination];
  const labels = locale === 'ta' ? ['பெயர்', 'வணிகம்', 'தொலைபேசி', 'அரிசி', 'அளவு', 'சேருமிடம்'] : ['Name', 'Business', 'Phone', 'Rice', 'Quantity', 'Delivery location'];
  const lines = values.map((value, index) => `${labels[index]}: ${value.trim()}`);
  if (data.message.trim()) lines.push(`${locale === 'ta' ? 'கூடுதல் விவரம்' : 'Message'}: ${data.message.trim()}`);
  return `${locale === 'ta' ? 'வள்ளுவர் — மொத்த விற்பனை விசாரணை' : 'Valluvar — Wholesale enquiry'}\n\n${lines.join('\n')}`;
}
export function whatsappLink(number: string, message: string): string | null {
  if (!/^[1-9]\d{6,14}$/.test(number)) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
