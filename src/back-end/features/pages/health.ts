import { injectableSingleton } from '@/back-end/core/lib/lib-tsyringe';
import { PageToken, type Page } from '@/back-end/core/server/page';

@injectableSingleton(PageToken)
export class Health implements Page<'/health'> {
  get route(): '/health' {
    return '/health';
  }
  get handler(): Bun.RouterTypes.RouteValue<'/health'> {
    return (_) => new Response('OK', { status: 200 });
  }
}
