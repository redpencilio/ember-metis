import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { classRoute, metisFallbackRoute } from 'ember-metis';
import classRouteFromPath from 'ember-metis/utils/class-route';
import metisFallbackRouteFromPath from 'ember-metis/utils/fallback-route';

module('imports', function (hooks) {
  setupTest(hooks);

  test('index imports work', function (assert) {
    assert.ok(classRoute, 'classRoute import works');
    assert.ok(metisFallbackRoute, 'metisFallbackRoute import works');
  });

  test('path imports work', function (assert) {
    assert.ok(classRouteFromPath, 'classRoute import works');
    assert.ok(metisFallbackRouteFromPath, 'metisFallbackRoute import works');
  });
});
