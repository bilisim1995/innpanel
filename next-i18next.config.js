const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'tr'],
    localePath: path.join(process.cwd(), 'public/locales'),
  },
};
