import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import fetch from 'fetch';
import BuildUrl from 'build-url';
import RSVP from 'rsvp';

export default class FallbackRoute extends Route {
  queryParams = {
    directedPageNumber: {
      refreshModel: true
    },
    directedPageSize: {
      refreshModel: true
    },
    inversePageNumber: {
      refreshModel: true
    },
    inversePageSize: {
      refreshModel: true
    },
  };

  @service fastboot;
  @service config;

  constructor() {
    super(...arguments);
    this.env = getOwner(this).resolveRegistration('config:environment');
  }

  async model({ path, directedPageNumber, directedPageSize, inversePageNumber, inversePageSize }) {
    const prefix = this.env.metis.baseUrl;
    const subject = `${prefix}${path}`;
    const backend = this.fastboot.isFastBoot ? window.BACKEND_URL : "/";

    const requestDirectedLinksUrl = BuildUrl(backend, {
      path: 'uri-info/direct',
      queryParams: {
        subject: subject,
        pageNumber: directedPageNumber,
        pageSize: directedPageSize
      }
    });

    const requestInverseLinksUrl = BuildUrl(backend, {
      path: 'uri-info/inverse',
      queryParams: {
        subject: subject,
        pageNumber: inversePageNumber,
        pageSize: inversePageSize
      }
    });

    const response = await RSVP.hash({
      directed: (await fetch(requestDirectedLinksUrl)).json(),
      inverse: (await fetch(requestInverseLinksUrl)).json()
    });

    return {
      directed: {
        triples: response.directed.triples,
        subject: subject,
        count: response.directed.count
      },
      inverse: {
        triples: response.inverse.triples,
        subject: subject,
        count: response.inverse.count
      }
    };
  }

  afterModel(model) {
    const types = this.findTypes(model);

    for (let type of types) {
      if (this.env.metis.routes[type]) {
        this.replaceWith(this.env.metis.routes[type], { queryParams: { resource: model.subject } });
        return;
      }
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.isLoadingDirected = false;
    controller.isLoadingInverse = false;
  }

  findTypes(model) {
    return model
      .directed
      .triples
      .filter(({ predicate }) => predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
      .map(({ object: { value } }) => value);
  }
}
