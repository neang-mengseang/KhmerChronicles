import * as raw from './raw';
export const get = (http, params) => {
  return raw.get(http, `/spaces/${params.spaceId}/preview_api_keys/${params.previewApiKeyId}`);
};
export const getMany = (http, params) => {
  return raw.get(http, `/spaces/${params.spaceId}/preview_api_keys`, {
    params: params.query
  });
};