declare module "*.png" {
  const content: import("react-native").ImageSourcePropType;
  export default content;
}

declare module "*.svg" {
  import * as React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}