export default function fallbackRoute(router) {
  router.route('fallback', { path: '/*path' });
}
