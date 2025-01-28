import * as raw from './raw';
export const get = (http, params) => {
  return raw.get(http, `/organizations/${params.organizationId}/app_definitions/${params.appDefinitionId}/signing_secret`);
};
export const upsert = (http, params, data) => {
  return raw.put(http, `/organizations/${params.organizationId}/app_definitions/${params.appDefinitionId}/signing_secret`, data);
};
export const del = (http, params) => {
  return raw.del(http, `/organizations/${params.organizationId}/app_definitions/${params.appDefinitionId}/signing_secret`);
};