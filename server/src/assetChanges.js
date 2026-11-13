let revision = 0;
export const assetDataRevision = () => revision;
export const assetsChanged = () => { revision++; };
