import { describe, expect, it } from 'vitest';
import { business, ui } from '../data/site';
import { composeEnquiry, validateEnquiry, whatsappLink, type Enquiry } from './enquiry';
import { directionsUrl, mapEmbedUrl, salesWhatsapp } from './contact';

describe('confirmed contact and replacement product flow', () => {
  it('opens the supplied Indian sales number with localized text', () => {
    for (const locale of ['en', 'ta'] as const) {
      const url = new URL(salesWhatsapp(locale)!);
      expect(url.hostname).toBe('wa.me');
      expect(url.pathname).toBe('/917373566676');
      expect(url.searchParams.get('text')).toBe(ui[locale].quickMessage);
    }
    expect(business.telephone).toBe('+917373566676');
  });
  it('uses the exact supplied map pin for both directions and localized embed', () => {
    expect(new URL(directionsUrl).searchParams.get('destination')).toBe('10.726222,77.545359');
    const embed = new URL(mapEmbedUrl('ta'));
    expect(embed.hostname).toBe('maps.google.com');
    expect(embed.searchParams.get('q')).toBe('10.726222,77.545359');
    expect(embed.searchParams.get('hl')).toBe('ta');
  });
  it('carries the replacement 25 kg product into the actual WhatsApp handoff', () => {
    const data: Enquiry = { name: 'Test buyer', businessName: 'Test store', phone: '+91 90000 00000', product: 'rajabogam', quantity: '20', unit: 'bags', destination: 'Dharapuram', message: 'Please confirm availability & delivery.' };
    expect(validateEnquiry(data, 'en')).toEqual({});
    for (const locale of ['en', 'ta'] as const) {
      const message = composeEnquiry(data, locale);
      expect(message).toContain(locale === 'en' ? 'Rajabogam Rice · 25 kg' : 'ராஜபோகம் அரிசி · 25 கிலோ');
      const url = new URL(whatsappLink(business.whatsapp, message)!);
      expect(url.pathname).toBe('/917373566676');
      expect(url.searchParams.get('text')).toBe(message);
      expect(message).not.toContain('Broken Rice');
    }
  });
});
