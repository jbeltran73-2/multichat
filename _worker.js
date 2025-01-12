import functions from './functions/index';

export default {
  async fetch(request, env) {
    return functions.fetch(request, env);
  }
};