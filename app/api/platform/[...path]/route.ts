import 'server-only';
import { proxy } from '../../../../lib/platform-proxy';
type Context = { params: Promise<{ path: string[] }> };
async function handle(request: Request, context: Context) {
  return proxy(request, (await context.params).path, 'users');
}
export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
};
