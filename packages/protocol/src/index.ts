/**
 * `@ineractive/protocol` — placeholder package boundary.
 *
 * P00 deliberately ships no protocol contracts. Provider-neutral identity and
 * revision primitives, run/event/evidence/finding schemas, ModelTask,
 * DecisionTask, and CapabilityRequest/Grant contracts are dependency-ordered
 * work owned by IN-P01-S02-T01 and IN-P01-S02-T02.
 *
 * Until that Grain exists this module must keep an empty runtime export surface:
 * inventing contracts here would create unreviewed public API that later Grains
 * would have to remove or preserve by accident.
 */
export {};
