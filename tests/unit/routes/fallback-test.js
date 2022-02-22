import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | fallback', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:fallback');
    assert.ok(route);
  });
});
