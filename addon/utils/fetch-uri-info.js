import fetch, { Headers } from 'fetch';
import buildUrl from 'build-url';

export default async function fetchUriInfo(
  fastboot,
  subject,
  number,
  size,
  direction = 'direct',
) {
  const baseUrl = fastboot?.isFastBoot ? window.BACKEND_URL : '/';

  const url = buildUrl(baseUrl, {
    path: `uri-info/${direction}`,
    queryParams: {
      subject,
      pageNumber: number,
      pageSize: size,
    },
  });

  const response = await (
    await fetch(url, {
      headers: new Headers({
        accept: 'application/vnd.api+json',
        ...(fastboot?.isFastBoot
          ? {
              Cookie: fastboot.request?.headers.get('Cookie'),
            }
          : {}),
      }),
    })
  ).json();

  return {
    subject: subject,
    triples: response.triples,
    count: response.count,
  };
}
