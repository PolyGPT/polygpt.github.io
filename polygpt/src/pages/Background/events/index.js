import { CommonEventExecutor } from './commonEvents';
import { ChatGPTAPIEventExecutor } from './chatGPTAPIEvents';
import { ChatGPTCoreEventExecutor } from './chatGPTCoreEvents';

const EventExecutor = {
  ...CommonEventExecutor,
  ...ChatGPTAPIEventExecutor,
  ...ChatGPTCoreEventExecutor,
};

export default EventExecutor;
