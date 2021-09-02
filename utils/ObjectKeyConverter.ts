import camelCase from 'lodash/camelCase';
import isPlainObject from 'lodash/isPlainObject';
import mapKeys from 'lodash/mapKeys';
import mapValues from 'lodash/mapValues';
import snakeCase from 'lodash/snakeCase';

// Reference: https://stackoverflow.com/a/35056190
const deeply = (map) => (obj, fn) =>
  map(
    mapValues(obj, (v) => (isPlainObject(v) ? deeply(map)(v, fn) : v)),
    fn,
  );

type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;

type CamelToSnakeCaseNested<T> = T extends object
  ? {
      [K in keyof T as CamelToSnakeCase<K & string>]: CamelToSnakeCaseNested<T[K]>;
    }
  : T;

/**
 * Convert all object keys including nested ones from camelCase to snake_keys.
 *
 * Note that type inferences can be wrong when keys include acronyms or all-caps words like ID, HTML. In that case you
 * need to specify `OutputType` manually.
 */
export function snakeCaseKeys<InputType extends object, OutputType = CamelToSnakeCaseNested<InputType>>(
  object: InputType,
): OutputType {
  return deeply(mapKeys)(object, (_, key) => snakeCase(key));
}

type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${Lowercase<T>}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

type SnakeToCamelCaseNested<T> = T extends object
  ? {
      [K in keyof T as SnakeToCamelCase<K & string>]: SnakeToCamelCaseNested<T[K]>;
    }
  : T;

export function camelCaseKeys<InputType extends object, OutputType = SnakeToCamelCaseNested<InputType>>(
  object: InputType,
): OutputType {
  return deeply(mapKeys)(object, (_, key) => camelCase(key));
}
