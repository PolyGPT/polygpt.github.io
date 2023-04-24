import setEvents from './events';
import { isDevelopment } from '../../utils/utils';

if (isDevelopment()) {
  console.log('This is the background page.');
  console.log('Put the background scripts here.');
}

setEvents();
