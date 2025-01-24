import * as raw from './raw';
export const getForSpace = (http, params) => {
  return raw.get(http, `/spaces/${params.spaceId}/users/${params.userId}`);
};
export const getCurrent = (http, params) => raw.get(http, `/users/me`, {
  params: params === null || params === void 0 ? void 0 : params.query
});
export const getManyForSpace = (http, params) => {
  return raw.get(http, `/spaces/${params.spaceId}/users`, {
    params: params.query
  });
};
export const getForOrganization = (http, params) => {
  return raw.get(http, `/organizations/${params.organizationId}/users/${params.userId}`);
};
export const getManyForOrganization = (http, params) => {
  return raw.get(http, `/organizations/${params.organizationId}/users`, {
    params: params.query
  });
};