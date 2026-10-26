import { describe, expect, it } from 'vitest';
import { composeEnquiry, selectedProduct, validateEnquiry, whatsappLink, type Enquiry } from './enquiry';

const valid: Enquiry = { name: 'A. Kumar', businessName: 'Kumar Stores', phone: '+91 98765 43210', product: 'boiled', quantity: '25', unit: 'bags', destination: 'Coimbatore', message: 'Please confirm availability & delivery.' };
describe('wholesale enquiry', () => {
  it('accepts a complete enquiry with an international phone number', () => expect(validateEnquiry(valid, 'en')).toEqual({}));
  it('rejects missing details, invalid phone numbers and fractional bags', () => {
    const errors = validateEnquiry({ ...valid, name: ' ', businessName: '', phone: 'hello', quantity: '1.5', destination: '' }, 'en');
    expect(Object.keys(errors)).toEqual(expect.arrayContaining(['name', 'businessName', 'phone', 'quantity', 'destination']));
  });
  it.each(['0', '-1', 'Infinity', 'NaN', '1000001', ''])('rejects invalid quantities: %s', quantity => expect(validateEnquiry({ ...valid, quantity }, 'en')).toHaveProperty('quantity'));
  it('allows fractional kilograms and validates all enum values', () => {
    expect(validateEnquiry({ ...valid, quantity: '.5', unit: 'kg' }, 'en')).toEqual({});
    expect(validateEnquiry({ ...valid, product: 'unverified-product' }, 'en')).toHaveProperty('product');
    expect(validateEnquiry({ ...valid, unit: 'litres' as Enquiry['unit'] }, 'en')).toHaveProperty('unit');
  });
  it('caps free text and returns Tamil validation messages', () => {
    expect(validateEnquiry({ ...valid, message: 'a'.repeat(1001) }, 'en')).toHaveProperty('message');
    expect(validateEnquiry({ ...valid, phone: '' }, 'ta').phone).toContain('தொலைபேசி');
  });
  it('composes English and Tamil messages without dropping buyer details', () => {
    const english = composeEnquiry(valid, 'en'); const tamil = composeEnquiry(valid, 'ta');
    expect(english).toContain('Rice: Special Amark Rajabogam'); expect(english).toContain('Quantity: 25 bags');
    expect(tamil).toContain('ஸ்பெஷல் அக்மார்க் ராஜபோகம்'); expect(tamil).toContain('25 மூட்டைகள்');
    expect(english).toContain(valid.message); expect(tamil).toContain(valid.destination);
  });
  it('handles help-me-choose and omits an empty optional message', () => {
    const message = composeEnquiry({ ...valid, product: 'choose', message: '' }, 'en');
    expect(message).toContain('Help me choose'); expect(message).not.toContain('Message:');
  });
  it('never provides a WhatsApp destination without a valid configured number', () => {
    expect(whatsappLink('', 'Enquiry')).toBeNull(); expect(whatsappLink('+91-123', 'Enquiry')).toBeNull();
  });
  it('round trips multilingual text and reserved characters through WhatsApp encoding', () => {
    const message = composeEnquiry(valid, 'ta'); const link = whatsappLink('919876543210', message)!;
    expect(new URL(link).searchParams.get('text')).toBe(message); expect(new URL(link).pathname).toBe('/919876543210');
  });
  it('only preselects known product identifiers from query strings', () => {
    expect(selectedProduct('boiled')).toBe('boiled'); expect(selectedProduct('rajabogam')).toBe('rajabogam');
    expect(selectedProduct('broken')).toBe('choose');
    expect(selectedProduct('rnr')).toBe('choose');
    expect(selectedProduct(null)).toBe('choose'); expect(selectedProduct('<script>')).toBe('choose');
  });
});
