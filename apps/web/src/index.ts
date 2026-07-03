import { appConfig } from "@bioconecta/config";
import { designSystemName } from "@bioconecta/ui";

export const webApp = {
  name: appConfig.productName,
  designSystem: designSystemName,
} as const;
