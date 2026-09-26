import { prepareGraphics } from './src/boot/graphics';

prepareGraphics()
  .then(() => {
    require('expo-router/entry');
  })
  .catch((error) => {
    console.error(error);
  });
