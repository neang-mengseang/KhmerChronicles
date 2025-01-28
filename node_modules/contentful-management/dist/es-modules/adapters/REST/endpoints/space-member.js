import * as raw from './raw';
export const get = (http, params) => raw.get(http, `/spaces/${params.spaceId}/space_members/${params.spaceMemberId}`);
export const getMany = (http, params) => raw.get(http, `/spaces/${params.spaceId}/space_members`, {
  params: params.query
});