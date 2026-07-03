import { appConfig } from "@bioconecta/config";

export const apiApp = {
  name: `${appConfig.productName} API`,
  prefix: appConfig.apiPrefix,
} as const;
