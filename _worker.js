import { handleRequest } from './cloudflare/functions/entry';

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  }
};