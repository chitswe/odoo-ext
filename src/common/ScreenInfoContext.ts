import * as React from "react";
export type DeviceType = "desktop" | "phone" | "tablet";
interface ScreenInfo {
  type?: DeviceType;
  width: number;
  height: number;
}

const getDimensionForDeviceType = (type: DeviceType) => {
  switch (type) {
    case "phone":
      return { width: 599, height: 600 };
      break;
    case "tablet":
      return { width: 959, height: 800 };
    case "desktop":
    default:
      return { width: 1279, height: 800 };
  }
};

export { getDimensionForDeviceType };

const ScreenInfoContext = React.createContext<ScreenInfo>({
  type: "desktop",
  width: 1024,
  height: 600
});

export default ScreenInfoContext;
