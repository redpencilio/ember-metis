import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { classRoute, fallbackRoute } from 'ember-metis';
import classRouteFromPath from 'ember-metis/utils/class-route';
import fallbackRouteFromPath from 'ember-metis/utils/fallback-route';

module('imports', function (hooks) {
  setupTest(hooks);

  test('index imports work', function (assert) {
    assert.ok(classRoute, 'classRoute import works');
    assert.ok(fallbackRoute, 'fallbackRoute import works');
  });

  test('path imports work', function (assert) {
    assert.ok(classRouteFromPath, 'classRoute import works');
    assert.ok(fallbackRouteFromPath, 'fallbackRoute import works');
  });
});
