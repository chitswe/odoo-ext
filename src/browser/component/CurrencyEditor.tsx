import * as React from "react";
import TextField, { TextFieldProps } from "@material-ui/core/TextField";
import * as accounting from "accounting";
import { createStyles, WithStyles, withStyles } from "@material-ui/core";

const styles = createStyles({
  input: {
    textAlign: "right"
  }
});

type OwnProps = {
  validateOnBlur: boolean;
  validateOnEnterKeyPress: boolean;
  onValidating?: (value: number, oldValue: number) => boolean;
  onValidated?: (value: number, oldValue: number) => void;
  retainFocusOnError: boolean;
  restoreOldValueOnError: boolean;
  selectAllOnFocus: boolean;
  numberPrecision: number;
  value?: number;
  onChanged?: (value: number) => void;
  currencySymbol?: string;
};

type Props = OwnProps &
  TextFieldProps & { staticContext?: any } & WithStyles<typeof styles>;

class CurrencyEditor extends React.Component<Props> {
  static defaultProps: OwnProps = {
    validateOnBlur: true,
    validateOnEnterKeyPress: true,
    retainFocusOnError: false,
    restoreOldValueOnError: false,
    numberPrecision: null,
    selectAllOnFocus: true,
    currencySymbol: ""
  };
  changed: boolean = false;
  text: string = "";
  old: number = null;
  textField: any = React.createRef<any>();
  bypassOnBlur: boolean = false;
  onFocus(e: any) {
    const { value } = this.props;
    this.old = value;
    this.changed = true;
    this.text = value == null ? "" : value.toString();
    this.forceUpdate();
    if (this.props.selectAllOnFocus) {
      setTimeout(() => {
        this.textField.setSelectionRange(0, this.textField.value.length);
      }, 10);
    }
  }

  onBlur(e: any) {
    this.changed = false;
    const { validateOnBlur } = this.props;
    if (validateOnBlur) {
      if (!this.bypassOnBlur) {
        this.commitEditor();
        if (!this.changed) this.forceUpdate();
      }
    }
    this.bypassOnBlur = false;
  }

  commitEditor() {
    let value = Number.parseFloat(this.textField.value);
    if (this.props.onValidating) {
      if (this.props.onValidating(value, this.old)) {
        this.props.onValidated(value, this.old);
        this.old = value;
      } else {
        if (this.props.retainFocusOnError) {
          setTimeout(() => {
            this.textField.focus();
          }, 10);
          this.changed = true; // still focus
        }
        if (this.props.restoreOldValueOnError) {
          this.handleOnChange(this.old.toString());
        }
      }
    } else if (this.props.onValidated) this.props.onValidated(value, this.old);
  }

  onChange(event: any) {
    this.handleOnChange(event.target.value);
  }
  handleOnChange(text: string) {
    this.changed = true;
    let num = Number.parseFloat(text);
    if (!num && num !== 0) {
      num = null;
    }
    this.text = text;
    const getType = {};
    if (
      this.props.onChanged &&
      getType.toString.call(this.props.onChanged) === "[object Function]"
    )
      this.props.onChanged(num);
    else this.forceUpdate();
  }

  onKeyPress(e: any) {
    if (e.charCode === 13) {
      if (this.props.validateOnEnterKeyPress) {
        this.commitEditor();
        setTimeout(() => {
          this.textField.setSelectionRange(0, this.textField.value.length);
        }, 10);
      }
    } else if (
      (e.charCode < 48 || e.charCode > 57) &&
      e.charCode !== 45 &&
      e.charCode !== 46
    ) {
      // digit and minus sign
      e.preventDefault();
    }
  }

  moveDecimal(n: number, l: number) {
    let v = l > 0 ? n * Math.pow(10, l) : n / Math.pow(10, l * -1);
    return v;
  }
  handleUpDownKey(isUp: boolean) {
    let text = this.textField.value;
    let num = Number.parseFloat(text);
    if (!num) num = 0;
    let dec = text.indexOf(".");
    let sign = isUp ? 1 : -1;
    if (dec > -1) {
      // right of decimal
      let digitsAfterPoint = num.toString().split(".")[1].length;
      let fnum = this.moveDecimal(num, digitsAfterPoint);
      fnum += sign;
      num = this.moveDecimal(fnum, digitsAfterPoint * -1);
    } else {
      // no decimal
      num += sign;
    }
    this.handleOnChange(num.toString());
  }
  onKeyDown(e: any) {
    switch (e.keyCode) {
      case 38: // up
        e.preventDefault();
        this.handleUpDownKey(true);
        break;
      case 40: // down
        e.preventDefault();
        this.handleUpDownKey(false);
        break;
      case 27: // escape key
        this.bypassOnBlur = true; // if escape key is press skip handling blur event
        this.textField.blur();
        this.props.onChanged(this.old);
        break;
      default:
        break;
    }
  }

  render() {
    const {
      validateOnBlur,
      validateOnEnterKeyPress,
      onValidating,
      onValidated,
      retainFocusOnError,
      restoreOldValueOnError,
      selectAllOnFocus,
      numberPrecision,
      value,
      onFocus,
      onKeyPress,
      inputRef,
      staticContext,
      onChanged,
      currencySymbol,
      classes,
      inputProps,
      ...textFieldProps
    } = this.props;
    let text = "";
    let p =
      numberPrecision == null
        ? accounting.settings.number.precision
        : numberPrecision;

    let s =
      currencySymbol == null
        ? accounting.settings.currency.symbol
        : currencySymbol;
    if (!this.changed) {
      text =
        value == null
          ? ""
          : accounting.formatMoney(value, {
              symbol: s,
              format: "%v %s",
              precision: p
            });
    } else text = this.text;
    return (
      <TextField
        inputRef={(ref: any) => {
          this.textField = ref;
        }}
        inputProps={{ ...inputProps, className: classes.input }}
        {...textFieldProps}
        value={text}
        onFocus={this.onFocus.bind(this)}
        onKeyPress={this.onKeyPress.bind(this)}
        onBlur={this.onBlur.bind(this)}
        onChange={this.onChange.bind(this)}
        onKeyDown={this.onKeyDown.bind(this)}
      />
    );
  }
}

export default withStyles(styles)(CurrencyEditor);
