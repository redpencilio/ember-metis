import fetch, { Headers } from 'fetch';
import { createUrlParams } from './url-params';
export default async function fetchUriInfo(
  fastboot,
  subject,
  number,
  size,
  direction = 'direct',
  serviceBaseUrl = '/',
  // serviceBaseUrl is only useful when the service is running somewhere separate from the frontend
  // it can also be useful if the frontend and services are running on another path than '/'
) {
  let baseUrl = fastboot?.isFastBoot
    ? typeof window !== 'undefined'
      ? window.BACKEND_URL
      : serviceBaseUrl
    : serviceBaseUrl;
  baseUrl =
    baseUrl && baseUrl.endsWith('/')
      ? baseUrl.slice(0, -1)
      : `${baseUrl || serviceBaseUrl}`;

  const params = createUrlParams({
    subject,
    pagenumber: number,
    pagesize: size,
  });

  const url = `${baseUrl}/uri-info/${direction}?${params}`;
  const response = await fetch(url, {
    headers: new Headers({
      accept: 'application/vnd.api+json',
      ...(fastboot?.isFastBoot
        ? {
            Cookie: fastboot.request?.headers.get('Cookie'),
          }
        : {}),
    }),
  });
  const body = await response.json();

  return {
    subject: subject,
    triples: body.triples,
    count: body.count,
  };
}
