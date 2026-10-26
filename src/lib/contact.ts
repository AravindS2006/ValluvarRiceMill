import { business, ui, type Locale } from '../data/site';
import { whatsappLink } from './enquiry';

export const salesWhatsapp = (locale: Locale) => whatsappLink(business.whatsapp, ui[locale].quickMessage);
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${business.map.latitude},${business.map.longitude}`)}`;
export const mapEmbedUrl = (locale: Locale) => `https://maps.google.com/maps?q=${business.map.latitude},${business.map.longitude}&z=16&hl=${locale}&output=embed`;
