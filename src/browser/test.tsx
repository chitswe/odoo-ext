import * as React from "react";
import { List } from "react-virtualized";

export default class Test extends React.Component {
  render() {
    return (
      <List
        rowCount={100}
        width={200}
        height={500}
        rowHeight={56}
        rowRenderer={({ index, style }) => (
          <div style={style} key={index}>
            {index}
          </div>
        )}
      />
    );
  }
}
