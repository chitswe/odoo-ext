import * as React from "react";
import TextField, { TextFieldProps } from "@material-ui/core/TextField";
import {
  createStyles,
  WithStyles,
  withStyles,
  Input,
  InputBase
} from "@material-ui/core";

const styles = createStyles({
  input: {
    textAlign: "left"
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
  inputElementType?: "InputBase" | "Input" | "TextField";
  inputReference?: (ref: React.Ref<any>) => void;
};

export type TextEditorProps = OwnProps &
  TextFieldProps & { staticContext?: any };

type Props = TextEditorProps & WithStyles<typeof styles>;

type State = {
  draftValue: string;
  previousValueProp: string;
};

class TextEditor extends React.Component<Props, State> {
  static defaultProps: OwnProps = {
    validateOnBlur: true,
    validateOnEnterKeyPress: true,
    retainFocusOnError: false,
    restoreOldValueOnError: false,
    selectAllOnFocus: true
  };
  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    const { previousValueProp } = prevState;
    let { value } = nextProps;
    if (!value) value = "";
    if (previousValueProp !== value) {
      return {
        draftValue: value,
        previousValueProp: value
      };
    } else return null;
  }
  state: State = {
    draftValue: "",
    previousValueProp: ""
  };
  textField: any = React.createRef<any>();
  bypassOnBlur: boolean = false;
  onFocus(e: any) {
    const { draftValue = "" } = this.state;
    const { onFocus } = this.props;
    if (this.props.selectAllOnFocus) {
      setTimeout(() => {
        this.textField.setSelectionRange(0, draftValue.length);
      }, 10);
    }
    if (onFocus) onFocus(e);
  }

  onBlur(e: any) {
    const { validateOnBlur, onBlur } = this.props;
    if (validateOnBlur) {
      if (!this.bypassOnBlur) {
        this.commitEditor();
      }
    }
    this.bypassOnBlur = false;
    if (onBlur) onBlur(e);
  }

  commitEditor() {
    const { draftValue, previousValueProp } = this.state;
    if (this.props.onValidating) {
      if (this.props.onValidating(draftValue, previousValueProp)) {
        this.props.onValidated(draftValue, previousValueProp);
      } else {
        if (this.props.retainFocusOnError) {
          setTimeout(() => {
            this.textField.focus();
          }, 10);
        }
        if (this.props.restoreOldValueOnError) {
          this.setState({ draftValue: previousValueProp });
        }
      }
    } else if (this.props.onValidated)
      this.props.onValidated(draftValue, previousValueProp);
  }

  onChange(event: any) {
    this.setState({ draftValue: event.target.value });
    const { onChange } = this.props;
    if (onChange) {
      onChange(event);
    }
  }

  onKeyPress(e: any) {
    const { onKeyPress } = this.props;
    const { draftValue } = this.state;
    if (e.charCode === 13) {
      if (this.props.validateOnEnterKeyPress) {
        this.commitEditor();
        setTimeout(() => {
          this.textField.setSelectionRange(0, draftValue.length);
        }, 10);
      }
    }
    if (onKeyPress) onKeyPress(e);
  }

  onKeyDown(e: any) {
    const { previousValueProp } = this.state;
    switch (e.keyCode) {
      case 27: // escape key
        this.bypassOnBlur = true; // if escape key is press skip handling blur event
        this.textField.blur();
        this.setState({ draftValue: previousValueProp });
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
      value,
      onFocus,
      onKeyPress,
      inputRef,
      staticContext,
      onChange,
      classes,
      inputProps,
      inputElementType,
      inputReference,
      ...textFieldProps
    } = this.props;
    const { draftValue } = this.state;
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
        inputProps={{ ...inputProps, className: classes.input }}
        {...textFieldProps}
        value={draftValue}
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
