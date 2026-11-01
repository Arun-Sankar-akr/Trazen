// Replace these before publishing. Use an Indian number with country code, digits only.
export const BUSINESS = {
  name: 'MonoForge Studio',
  whatsapp: '9047638853',
  email: 'arunsankarramakr@gmail.com',
  location: 'Serving businesses across India',
};

export const whatsappLink = (message = 'Hi MonoForge Studio, I would like to discuss a website for my business.') =>
  `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;
