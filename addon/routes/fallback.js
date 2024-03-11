import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import fetch, { Headers } from 'fetch';
import buildUrl from 'build-url';
import RSVP from 'rsvp';
import { findRoute } from '../utils/class-route';

export default class FallbackRoute extends Route {
  queryParams = {
    directedPageNumber: {
      refreshModel: true,
    },
    directedPageSize: {
      refreshModel: true,
    },
    inversePageNumber: {
      refreshModel: true,
    },
    inversePageSize: {
      refreshModel: true,
    },
    resourceUrl: {
      refreshModel: true,
    },
  };

  @service fastboot;
  @service intl;

  constructor() {
    super(...arguments);
    this.env = getOwner(this).resolveRegistration('config:environment');

    this.templateName = this.env.metis.fallbackTemplate || 'fallback';

    // Simply accessing the service works around this issue: https://github.com/ember-intl/ember-intl/issues/1826
    // We do it in the addon code, so apps aren't forced to do it when they might not even be using ember-intl.
    // TODO: remove this once the issue is fixed upstream
    this.intl;
  }

  async model({
    path,
    directedPageNumber,
    directedPageSize,
    inversePageNumber,
    inversePageSize,
  }) {
    const prefix = this.env.metis.baseUrl;
    const subject = `${prefix}${path}`;
    const backend = this.fastboot.isFastBoot ? window.BACKEND_URL : '/';

    const requestDirectedLinksUrl = buildUrl(backend, {
      path: 'uri-info/direct',
      queryParams: {
        subject: subject,
        pageNumber: directedPageNumber,
        pageSize: directedPageSize,
      },
    });

    const requestInverseLinksUrl = buildUrl(backend, {
      path: 'uri-info/inverse',
      queryParams: {
        subject: subject,
        pageNumber: inversePageNumber,
        pageSize: inversePageSize,
      },
    });

    const response = await RSVP.hash({
      directed: (
        await fetch(requestDirectedLinksUrl, {
          headers: new Headers({ accept: 'application/vnd.api+json' }),
        })
      ).json(),
      inverse: (
        await fetch(requestInverseLinksUrl, {
          headers: new Headers({ accept: 'application/vnd.api+json' }),
        })
      ).json(),
    });

    return {
      directed: {
        triples: response.directed.triples,
        subject: subject,
        count: response.directed.count,
      },
      inverse: {
        triples: response.inverse.triples,
        subject: subject,
        count: response.inverse.count,
      },
    };
  }

  afterModel(model) {
    // TODO it would be better to detect whether a redirection to a custom route/template is required
    // in the beforeModel hook.
    // If uri-info service provides an endpoint to get the rdf:Class of a given resource,
    // that request could be executed in the beforeModel-hook and a transition (if needed) can be triggered
    // before the model is loaded
    const rdfTypes = model.directed.triples
      .filter(
        ({ predicate }) =>
          predicate == 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
      )
      .map(({ object: { value } }) => value);

    for (let type of rdfTypes) {
      const customRoute = findRoute(type);
      if (customRoute) {
        this.replaceWith(customRoute, {
          queryParams: { resource: model.directed.subject },
        });
        return;
      }
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.isLoadingDirected = false;
    controller.isLoadingInverse = false;
  }
}
