/** Creator contact links, used in the navbar, mobile menu and learning panel. */
export const PROFILE_URL = 'https://balavenkatesh3322.github.io/bala_venkatesh_profile/';

/** WhatsApp number in international format, digits only (+91 90038 12808). */
export const WHATSAPP_NUMBER = '919003812808';

/** Opens a WhatsApp chat with a friendly message already typed in. */
export const whatsappUrl = (topic?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Bala! I'm learning on NeuralDecode 3D${topic ? ` (${topic})` : ''} and would like to learn more.`,
  )}`;
