export const isPublished = data => !!data.sys.publishedVersion;
export const isUpdated = data => {
  // The act of publishing an entity increases its version by 1, so any entry which has
  // 2 versions higher or more than the publishedVersion has unpublished changes.
  return !!(data.sys.publishedVersion && data.sys.version > data.sys.publishedVersion + 1);
};
export const isDraft = data => !data.sys.publishedVersion;
export const isArchived = data => !!data.sys.archivedVersion;