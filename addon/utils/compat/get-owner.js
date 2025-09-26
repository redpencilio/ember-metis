import {
  macroCondition,
  dependencySatisfies,
  importSync,
} from '@embroider/macros';

export const getOwner = macroCondition(
  dependencySatisfies('ember-source', '>= 4.11'),
)
  ? importSync('@ember/owner').getOwner
  : importSync('@ember/application').getOwner;
