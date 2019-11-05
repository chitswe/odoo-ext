import * as React from "react";
import TextField, { TextFieldProps } from "@material-ui/core/TextField";
import * as accounting from "accounting";
import {
  createStyles,
  WithStyles,
  withStyles,
  InputBase,
  Input
} from "@material-ui/core";
import { InputProps } from "@material-ui/core/Input";
import { InputBaseProps } from "@material-ui/core/InputBase";

const styles = createStyles({
  input: {
    textAlign: "right"
  }
});

type OwnProps = {
  validateOnBlur: boolean;
  validateOnEnterKeyPress: boolean;
  onValidating?: (value: number) => boolean;
  onValidated?: (value: number) => void;
  retainFocusOnError: boolean;
  restoreOldValueOnError: boolean;
  selectAllOnFocus: boolean;
  numberPrecision: number;
  value?: number;
  inputElementType: "InputBase" | "Input" | "TextField";
  onChanged?: (value: number) => void;
  inputReference?: (ref: React.Ref<any>) => void;
};

type Props = OwnProps &
  TextFieldProps & { staticContext?: any } & WithStyles<typeof styles>;

class NumberEditor extends React.Component<Props> {
  static defaultProps: OwnProps = {
    validateOnBlur: true,
    validateOnEnterKeyPress: true,
    retainFocusOnError: false,
    restoreOldValueOnError: false,
    numberPrecision: null,
    selectAllOnFocus: true,
    inputElementType: "TextField"
  };
  changed: boolean = false;
  text: string = "";
  old: number = null;
  textField: any = React.createRef<any>();
  bypassOnBlur: boolean = false;
  onFocus(e: any) {
    const { value, onFocus } = this.props;
    this.old = value;
    this.changed = true;
    this.text = value == null ? "" : value.toString();
    this.forceUpdate();
    if (this.props.selectAllOnFocus) {
      setTimeout(() => {
        this.textField.setSelectionRange(0, this.textField.value.length);
      }, 10);
    }
    if (onFocus) onFocus(e);
  }

  onBlur(e: any) {
    this.changed = false;
    const { validateOnBlur, onBlur } = this.props;
    if (validateOnBlur) {
      if (!this.bypassOnBlur) {
        this.commitEditor();
        if (!this.changed) this.forceUpdate();
      }
    }
    this.bypassOnBlur = false;
    if (onBlur) onBlur(e);
  }

  commitEditor() {
    let value = this.textField.value;
    if (isNaN(value)) return;
    if (value === "") value = undefined;
    else {
      value = Number.parseFloat(value);
    }
    if (this.props.onValidating) {
      if (this.props.onValidating(value)) {
        this.props.onValidated(value);
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
    } else if (this.props.onValidated) this.props.onValidated(value);
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
    const { onKeyPress } = this.props;
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

    if (onKeyPress) onKeyPress(e);
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
    if (this.props.onKeyDown) this.props.onKeyDown(e);
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
      inputReference,
      staticContext,
      onChanged,
      inputProps,
      classes,
      inputElementType,
      ...textFieldProps
    } = this.props;
    let text = "";
    let p =
      numberPrecision == null
        ? accounting.settings.number.precision
        : numberPrecision;
    if (!this.changed) {
      text = value == null ? "" : accounting.formatNumber(value, p);
    } else text = this.text;
    let InputComponent: any = TextField;
    switch (inputElementType) {
      case "Input":
        InputComponent = Input;
        break;
      case "InputBase":
        InputComponent = InputBase;
        break;
      case "TextField":
      default:
        break;
    }

    return (
      <InputComponent
        inputRef={(ref: any) => {
          this.textField = ref;
          if (inputReference) inputReference(ref);
        }}
        inputProps={{ className: classes.input, ...inputProps }}
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

export default withStyles(styles)(NumberEditor);
