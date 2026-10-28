import SubjectController, { paginationQueryParams } from './-subject';
import { tracked } from '@glimmer/tracking';

export default class ExternalController extends SubjectController {
  queryParams = [
    {
      ...paginationQueryParams,
      resource: {
        type: 'string',
      },
    },
  ];

  @tracked resource = '';
}
