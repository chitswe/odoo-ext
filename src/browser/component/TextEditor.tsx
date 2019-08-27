import * as React from "react";
import TextField, { TextFieldProps } from "@material-ui/core/TextField";
import * as accounting from "accounting";
import { createStyles, WithStyles, withStyles } from "@material-ui/core";

const styles = createStyles({
  input: {
    fontSize: 13,
    textAlign: "right"
  }
});

type OwnProps = {
  validateOnBlur: boolean;
  validateOnEnterKeyPress: boolean;
  onValidating?: (value: string, oldValue: string) => boolean;
  onValidated?: (value: string, oldValue: string) => void;
  retainFocusOnError: boolean;
  restoreOldValueOnError: boolean;
  selectAllOnFocus: boolean;
  value?: string;
  onChanged?: (value: string) => void;
};

type Props = OwnProps &
  TextFieldProps & { staticContext?: any } & WithStyles<typeof styles>;

class TextEditor extends React.Component<Props> {
  static defaultProps: OwnProps = {
    validateOnBlur: true,
    validateOnEnterKeyPress: true,
    retainFocusOnError: false,
    restoreOldValueOnError: false,
    selectAllOnFocus: true
  };
  changed: boolean = false;
  text: string = "";
  old: string = null;
  textField: any = React.createRef<any>();
  bypassOnBlur: boolean = false;
  onFocus(e: any) {
    const { value } = this.props;
    this.old = value;
    this.changed = true;
    this.text = value == null ? "" : value.toString();
    this.forceUpdate();
    if (this.props.selectAllOnFocus) {
      setTimeout(() => { this.textField.setSelectionRange(0, this.textField.value.length); }, 10);
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
    let value = this.textField.value;
    if (this.props.onValidating) {
      if (this.props.onValidating(value, this.old)) {
        this.props.onValidated(value, this.old);
        this.old = value;
      } else {
        if (this.props.retainFocusOnError) {
          setTimeout(() => { this.textField.focus();           }, 10);
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
    this.text = text;
    const getType = {};
    if (
      this.props.onChanged &&
      getType.toString.call(this.props.onChanged) === "[object Function]"
    )
      this.props.onChanged(text);
    else this.forceUpdate();
  }

  onKeyPress(e: any) {
    if (e.charCode === 13) {
      if (this.props.validateOnEnterKeyPress) {
        this.commitEditor();
        setTimeout(() => { this.textField.setSelectionRange(0, this.textField.value.length);        }, 10);
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

  onKeyDown(e: any) {
    switch (e.keyCode) {
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
      value,
      onFocus,
      onKeyPress,
      inputRef,
      staticContext,
      onChanged,
      classes,
      inputProps,
      ...textFieldProps
    } = this.props;
    let text = "";
    
    if (!this.changed) {
      text =
        value == null
          ? ""
          : value.toString();
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

export default withStyles(styles)(TextEditor);
