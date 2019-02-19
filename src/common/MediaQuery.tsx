import * as React from "react";
import { default as Query, MediaQueryProps } from "react-responsive";
import ScreenInfoContext from "./ScreenInfoContext";

const MediaQuery: React.SFC<MediaQueryProps> = props => {
  const { values, children, ...p } = props;
  return (
    <ScreenInfoContext.Consumer>
      {({ width, height }) => {
        return (
          <Query
            {...p}
            values={
              typeof window !== "undefined"
                ? {}
                : { deviceWidth: width, deviceHeight: height }
            }
          >
            {children}
          </Query>
        );
      }}
    </ScreenInfoContext.Consumer>
  );
};

export default MediaQuery;
