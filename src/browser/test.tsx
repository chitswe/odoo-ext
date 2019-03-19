import * as React from "react";
import NumberEditor from "./component/NumberEditor";
import CurrencyEditor from "./component/CurrencyEditor";

export default class Test extends React.Component {
  state: { value: number } = {
    value: null
  };
  render() {
    const { value } = this.state;
    return (
      <CurrencyEditor
        currencySymbol="MMK"
        value={value}
        numberPrecision={2}
        onChanged={(v: number) => {
          this.setState({ value: v });
        }}
      />
    );
  }
}
