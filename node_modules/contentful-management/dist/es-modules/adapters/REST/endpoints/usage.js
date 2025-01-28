import * as raw from './raw';
export const getManyForSpace = (http, params) => {
  return raw.get(http, `/organizations/${params.organizationId}/space_periodic_usages`, {
    params: params.query
  });
};
export const getManyForOrganization = (http, params) => {
  return raw.get(http, `/organizations/${params.organizationId}/organization_periodic_usages`, {
    params: params.query
  });
};