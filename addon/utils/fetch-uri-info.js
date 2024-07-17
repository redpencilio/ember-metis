import fetch, { Headers } from 'fetch';
import buildUrl from 'build-url';

export default async function fetchUriInfo(
  baseUrl,
  subject,
  number,
  size,
  direction = 'direct'
) {
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
      headers: new Headers({ accept: 'application/vnd.api+json' }),
    })
  ).json();

  return {
    subject: subject,
    triples: response.triples,
    count: response.count,
  };
}
