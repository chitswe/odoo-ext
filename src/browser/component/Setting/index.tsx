import * as React from "react";
import { RootState, RootAction } from "../../reducer";
import { bindActionCreators, Dispatch } from "redux";
import {
  labelPrintSettingActions,
  LabelPrintSettingState
} from "../../reducer/labelPrintSetting";
import { connect } from "react-redux";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
  TextField,
  FormControlLabel,
  Checkbox,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  AppBar,
  Toolbar,
  Typography,
  IconButton
} from "@material-ui/core";
import { Save } from "@material-ui/icons";
import { compose } from "react-apollo";
import { siteActions } from "../../reducer/site";
import OpenDrawerButton from "../AppBar/OpenDrawerButton";

const styles = (theme: Theme) =>
  createStyles({
    toolBar: {
      [theme.breakpoints.up("md")]: {
        minHeight: 48
      }
    },
    grow: { flexGrow: 1 },
    appBar: {
      color: "#fff"
    },
    root: {
      flex: 1,
      display: "flex",
      flexDirection: "column"
    },
    xyhw: {
      width: 100,
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit
    },
    urlTextField: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
      flex: 1
    },
    testButton: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit
    },
    row: {
      flexDirection: "row",
      flexWrap: "wrap",
      display: "flex",
      marginTop: theme.spacing.unit,
      marginBottom: theme.spacing.unit
    },
    checkbox: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
      width: 200
    },
    text: {
      width: 200 + theme.spacing.unit * 2,
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit
    },
    container: {
      display: "flex",
      flexDirection: "column",
      flex: 1,
      overflow: "scroll"
    }
  });

type Props = {
  loadPrintSetting: typeof labelPrintSettingActions.loadPrintSetting;
  setPrintSetting: typeof labelPrintSettingActions.setPrintSetting;
  labelPrintSetting: LabelPrintSettingState;
  setUrl: typeof labelPrintSettingActions.setUrl;
  openSnackbar: typeof siteActions.openSnackbar;
  saveSetting: typeof labelPrintSettingActions.savePrintSetting;
} & WithStyles<typeof styles>;

type State = {
  testing: boolean;
};
class Setting extends React.Component<Props, State> {
  state: State = { testing: false };
  componentWillMount() {
    const { loadPrintSetting } = this.props;
    loadPrintSetting();
    showLoading();
  }
  componentWillReceiveProps(newProps: Props) {
    if (
      newProps.labelPrintSetting.fetching !==
        this.props.labelPrintSetting.fetching &&
      newProps.labelPrintSetting.fetching
    ) {
      showLoading();
    } else if (
      newProps.labelPrintSetting.fetching !==
        this.props.labelPrintSetting.fetching &&
      !newProps.labelPrintSetting.fetching
    ) {
      hideLoading();
    }
  }
  testConnection() {
    const {
      labelPrintSetting: { url },
      openSnackbar
    } = this.props;
    this.setState({ testing: true });
    fetch(`${url}/api/test/ping`)
      .then(response => {
        if (response.status === 200) {
          this.setState({ testing: false });
          openSnackbar("Connection success!");
        } else {
          this.setState({ testing: false });
          openSnackbar(
            `Testing connection to print service failed! ${response.statusText}`
          );
        }
      })
      .catch(error => {
        this.setState({ testing: false });
        openSnackbar(`Testing connection to print service failed! ${error}`);
      });
  }
  render() {
    const { testing } = this.state;
    const {
      labelPrintSetting: {
        url,
        printSetting: {
          PrintPIDCode,
          PrintPIDCode_X,
          PrintPIDCode_Y,
          PrintPIDCode_W,
          PrintPIDCode_H,

          PrintPIDText,
          PIDText_X,
          PIDText_Y,
          PIDText_H,

          PrintStockCodeCode,
          StockCode_X,
          StockCode_Y,
          StockCode_W,
          StockCode_H,

          PrintStockCodeText,
          StockCodeText_X,
          StockCodeText_Y,
          StockCodeText_H,

          PrintSerialNoCode,
          SerialNoCode_X,
          SerialNoCode_Y,
          SerialNoCode_W,
          SerialNoCode_H,

          PrintSerialNoText,
          SerialNoText_X,
          SerialNoText_Y,
          SerialNoText_H,

          PrintStockNameText,
          StockNameText_X,
          StockNameText_Y,
          StockNameText_H,

          PrintPurchaseDateText,
          PurchaseDateText_X,
          PurchaseDateText_Y,
          PurchaseDateText_H,

          PrintVoucherNoText,
          VoucherNoText_X,
          VoucherNoText_Y,
          VoucherNoText_H,

          PrintSalePrice,
          SalePrice_X,
          SalePrice_Y,
          SalePrice_H,
          PriceBook,

          PrinterType,
          PrinterName,
          PrintSpeed,
          Darkness,
          CustomZPLCommand,
          EnableZPLCommand,

          LabelHeight,
          LabelWidth,
          LabelGapH,
          NoOfColumn,
          LabelGapV,
          ColumnWidth
        }
      },
      classes,
      setPrintSetting,
      setUrl,
      saveSetting
    } = this.props;
    return (
      <div className={classes.root}>
        <AppBar className={classes.appBar} position="static">
          <Toolbar className={classes.toolBar}>
            <OpenDrawerButton />
            <Typography variant="h6" color="inherit" noWrap>
              Setting
            </Typography>
            <div className={classes.grow} />
            <IconButton
              aria-label="Print barcode label"
              color="inherit"
              onClick={saveSetting}
            >
              <Save />
            </IconButton>
          </Toolbar>
        </AppBar>
        <div className={classes.container}>
          <div className={classes.row}>
            <TextField
              label="Print Service URL"
              value={url}
              className={classes.urlTextField}
              onChange={e => {
                setUrl(e.target.value);
              }}
            />
            <Button
              className={classes.testButton}
              variant="contained"
              color="primary"
              onClick={() => {
                if (!testing) this.testConnection();
              }}
            >
              {testing ? (
                <CircularProgress size={24} color="secondary" />
              ) : null}
              Test
            </Button>
          </div>
          <Divider />
          <div className={classes.row}>
            <FormControlLabel
              className={classes.checkbox}
              control={
                <Checkbox
                  color="primary"
                  checked={PrintPIDCode}
                  onChange={(e, checked) => {
                    setPrintSetting({ PrintPIDCode: checked });
                  }}
                />
              }
              label="Print PID Barcode"
            />
            <TextField
              label="X"
              type="Number"
              value={PrintPIDCode_X}
              className={classes.xyhw}
              onChange={e => {
                setPrintSetting({
                  PrintPIDCode_X: Number.parseInt(e.target.value, 10)
                });
              }}
            />
            <TextField
              label="Y"
              type="Number"
              value={PrintPIDCode_Y}
              className={classes.xyhw}
              onChange={e => {
                setPrintSetting({
                  PrintPIDCode_Y: Number.parseInt(e.target.value, 10)
                });
              }}
            />
            <TextField
              label="W"
              type="Number"
              value={PrintPIDCode_W}
              className={classes.xyhw}
              onChange={e => {
                setPrintSetting({
                  PrintPIDCode_W: Number.parseInt(e.target.value, 10)
                });
              }}
            />
            <TextField
              label="H"
              type="Number"
              value={PrintPIDCode_H}
              className={classes.xyhw}
              onChange={e => {
                setPrintSetting({
                  PrintPIDCode_H: Number.parseInt(e.target.value, 10)
                });
              }}
            />
          </div>
          <Divider />
          <div className={classes.row}>
            <FormControlLabel
              className={classes.checkbox}
              control={
                <Checkbox
                  color="primary"
                  checked={PrintPIDText}
                  onChange={(e, checked) => {
                    setPrintSetting({ PrintPIDText: checked });
                  }}
                />
              }
              label="Print PID Text"
            />
            <TextField
              label="X"
              type="Number"
              value={PIDText_X}
              onChange={e => {
                setPrintSetting({
                  PIDText_X: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="Y"
              type="Number"
              value={PIDText_Y}
              onChange={e => {
                setPrintSetting({
                  PIDText_Y: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="H"
              type="Number"
              value={PIDText_H}
              onChange={e => {
                setPrintSetting({
                  PIDText_H: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
          </div>
          <Divider />

          <div className={classes.row}>
            <FormControlLabel
              className={classes.checkbox}
              control={
                <Checkbox
                  color="primary"
                  checked={PrintStockCodeCode}
                  onChange={(e, checked) => {
                    setPrintSetting({ PrintStockCodeCode: checked });
                  }}
                />
              }
              label="Print Stock Code"
            />
            <TextField
              label="X"
              type="Number"
              value={StockCode_X}
              className={classes.xyhw}
              onChange={e => {
                setPrintSetting({
                  StockCode_X: Number.parseInt(e.target.value, 10)
                });
              }}
            />
            <TextField
              label="Y"
              type="Number"
              value={StockCode_Y}
              className={classes.xyhw}
              onChange={e => {
                setPrintSetting({
                  StockCode_Y: Number.parseInt(e.target.value, 10)
                });
              }}
            />
            <TextField
              label="W"
              type="Number"
              value={StockCode_W}
              className={classes.xyhw}
              onChange={e => {
                setPrintSetting({
                  StockCode_W: Number.parseInt(e.target.value, 10)
                });
              }}
            />
            <TextField
              label="H"
              type="Number"
              value={StockCode_H}
              className={classes.xyhw}
              onChange={e => {
                setPrintSetting({
                  StockCode_H: Number.parseInt(e.target.value, 10)
                });
              }}
            />
          </div>
          <Divider />
          <div className={classes.row}>
            <FormControlLabel
              className={classes.checkbox}
              control={
                <Checkbox
                  color="primary"
                  checked={PrintStockCodeText}
                  onChange={(e, checked) => {
                    setPrintSetting({ PrintStockCodeText: checked });
                  }}
                />
              }
              label="Print Stock Code Text"
            />
            <TextField
              label="X"
              type="Number"
              value={StockCodeText_X}
              onChange={e => {
                setPrintSetting({
                  StockCodeText_X: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="Y"
              type="Number"
              value={StockCodeText_Y}
              onChange={e => {
                setPrintSetting({
                  StockCodeText_Y: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="H"
              type="Number"
              value={StockCodeText_H}
              onChange={e => {
                setPrintSetting({
                  StockCodeText_H: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
          </div>
          <Divider />

          <div className={classes.row}>
            <FormControlLabel
              className={classes.checkbox}
              control={
                <Checkbox
                  color="primary"
                  checked={PrintSerialNoCode}
                  onChange={(e, checked) => {
                    setPrintSetting({ PrintSerialNoCode: checked });
                  }}
                />
              }
              label="Print Serial No Code"
            />
            <TextField
              label="X"
              type="Number"
              value={SerialNoCode_X}
              className={classes.xyhw}
              onChange={e => {
                setPrintSetting({
                  SerialNoCode_X: Number.parseInt(e.target.value, 10)
                });
              }}
            />
            <TextField
              label="Y"
              type="Number"
              value={SerialNoCode_Y}
              className={classes.xyhw}
              onChange={e => {
                setPrintSetting({
                  SerialNoCode_Y: Number.parseInt(e.target.value, 10)
                });
              }}
            />
            <TextField
              label="W"
              type="Number"
              value={SerialNoCode_W}
              className={classes.xyhw}
              onChange={e => {
                setPrintSetting({
                  SerialNoCode_W: Number.parseInt(e.target.value, 10)
                });
              }}
            />
            <TextField
              label="H"
              type="Number"
              value={SerialNoCode_H}
              className={classes.xyhw}
              onChange={e => {
                setPrintSetting({
                  SerialNoCode_H: Number.parseInt(e.target.value, 10)
                });
              }}
            />
          </div>
          <Divider />
          <div className={classes.row}>
            <FormControlLabel
              className={classes.checkbox}
              control={
                <Checkbox
                  color="primary"
                  checked={PrintSerialNoText}
                  onChange={(e, checked) => {
                    setPrintSetting({ PrintSerialNoText: checked });
                  }}
                />
              }
              label="Print Serial No"
            />
            <TextField
              label="X"
              type="Number"
              value={SerialNoText_X}
              onChange={e => {
                setPrintSetting({
                  SerialNoText_X: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="Y"
              type="Number"
              value={SerialNoText_Y}
              onChange={e => {
                setPrintSetting({
                  SerialNoText_Y: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="H"
              type="Number"
              value={SerialNoText_H}
              onChange={e => {
                setPrintSetting({
                  SerialNoText_H: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
          </div>
          <Divider />

          <div className={classes.row}>
            <FormControlLabel
              className={classes.checkbox}
              control={
                <Checkbox
                  color="primary"
                  checked={PrintStockNameText}
                  onChange={(e, checked) => {
                    setPrintSetting({ PrintStockNameText: checked });
                  }}
                />
              }
              label="Print Stock Name"
            />
            <TextField
              label="X"
              type="Number"
              value={StockNameText_X}
              onChange={e => {
                setPrintSetting({
                  StockNameText_X: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="Y"
              type="Number"
              value={StockNameText_Y}
              onChange={e => {
                setPrintSetting({
                  StockNameText_Y: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="H"
              type="Number"
              value={StockNameText_H}
              onChange={e => {
                setPrintSetting({
                  StockNameText_H: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
          </div>
          <Divider />

          <div className={classes.row}>
            <FormControlLabel
              className={classes.checkbox}
              control={
                <Checkbox
                  color="primary"
                  checked={PrintPurchaseDateText}
                  onChange={(e, checked) => {
                    setPrintSetting({ PrintPurchaseDateText: checked });
                  }}
                />
              }
              label="Print Purchase Date"
            />
            <TextField
              label="X"
              type="Number"
              value={PurchaseDateText_X}
              onChange={e => {
                setPrintSetting({
                  PurchaseDateText_X: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="Y"
              type="Number"
              value={PurchaseDateText_Y}
              onChange={e => {
                setPrintSetting({
                  PurchaseDateText_Y: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="H"
              type="Number"
              value={PurchaseDateText_H}
              onChange={e => {
                setPrintSetting({
                  PurchaseDateText_H: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
          </div>
          <Divider />

          <div className={classes.row}>
            <FormControlLabel
              className={classes.checkbox}
              control={
                <Checkbox
                  color="primary"
                  checked={PrintVoucherNoText}
                  onChange={(e, checked) => {
                    setPrintSetting({ PrintVoucherNoText: checked });
                  }}
                />
              }
              label="Print Voucher No"
            />
            <TextField
              label="X"
              type="Number"
              value={VoucherNoText_X}
              onChange={e => {
                setPrintSetting({
                  VoucherNoText_X: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="Y"
              type="Number"
              value={VoucherNoText_Y}
              onChange={e => {
                setPrintSetting({
                  VoucherNoText_Y: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="H"
              type="Number"
              value={VoucherNoText_H}
              onChange={e => {
                setPrintSetting({
                  VoucherNoText_H: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
          </div>
          <Divider />

          <div className={classes.row}>
            <FormControlLabel
              className={classes.checkbox}
              control={
                <Checkbox
                  color="primary"
                  checked={PrintSalePrice}
                  onChange={(e, checked) => {
                    setPrintSetting({ PrintSalePrice: checked });
                  }}
                />
              }
              label="Print Sale Price"
            />
            <TextField
              label="X"
              type="Number"
              value={SalePrice_X}
              onChange={e => {
                setPrintSetting({
                  SalePrice_X: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="Y"
              type="Number"
              value={SalePrice_Y}
              onChange={e => {
                setPrintSetting({
                  SalePrice_Y: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="H"
              type="Number"
              value={SalePrice_H}
              onChange={e => {
                setPrintSetting({
                  SalePrice_H: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="Price List"
              value={PriceBook}
              onChange={e => {
                setPrintSetting({
                  PriceBook: e.target.value
                });
              }}
              className={classes.xyhw}
            />
          </div>
          <Divider />

          <div className={classes.row}>
            <FormControl className={classes.checkbox}>
              <InputLabel htmlFor="printer_type">Printer Type</InputLabel>
              <Select
                inputProps={{ name: "printer_type" }}
                value={PrinterType}
                onChange={e => {
                  setPrintSetting({ PrinterType: e.target.value });
                }}
              >
                <MenuItem value="0">POSTEK</MenuItem>
                <MenuItem value="1">GODEX</MenuItem>
                <MenuItem value="2">TSC</MenuItem>
                <MenuItem value="3">PosteKTXR</MenuItem>
                <MenuItem value="4">ZEBRA</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Printer Name"
              value={PrinterName}
              onChange={e => {
                setPrintSetting({
                  PrinterName: e.target.value
                });
              }}
              className={classes.text}
            />
            <TextField
              label="Print Speed"
              value={PrintSpeed}
              type="Number"
              onChange={e => {
                setPrintSetting({
                  PrintSpeed: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />

            <TextField
              label="Darkness"
              value={Darkness}
              type="Number"
              onChange={e => {
                setPrintSetting({
                  Darkness: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
          </div>
          <Divider />
          <div className={classes.row}>
            <FormControlLabel
              className={classes.checkbox}
              control={
                <Checkbox
                  color="primary"
                  checked={EnableZPLCommand}
                  onChange={(e, checked) => {
                    setPrintSetting({ EnableZPLCommand: checked });
                  }}
                />
              }
              label="Enable ZPL Command"
            />
            <TextField
              label="Custom ZPL Command"
              value={CustomZPLCommand}
              onChange={e => {
                setPrintSetting({
                  CustomZPLCommand: e.target.value
                });
              }}
              className={classes.text}
            />
          </div>
          <Divider />
          <div className="row">
            <TextField
              label="Width"
              value={LabelWidth}
              type="Number"
              onChange={e => {
                setPrintSetting({
                  LabelWidth: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="Height"
              value={LabelHeight}
              type="Number"
              onChange={e => {
                setPrintSetting({
                  LabelHeight: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="No Of Col"
              value={NoOfColumn}
              type="Number"
              onChange={e => {
                setPrintSetting({
                  NoOfColumn: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="Col Width"
              value={ColumnWidth}
              type="Number"
              onChange={e => {
                setPrintSetting({
                  ColumnWidth: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />

            <TextField
              label="H Gap"
              value={LabelGapH}
              type="Number"
              onChange={e => {
                setPrintSetting({
                  LabelGapH: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
            <TextField
              label="V Gap"
              value={LabelGapV}
              type="Number"
              onChange={e => {
                setPrintSetting({
                  LabelGapV: Number.parseInt(e.target.value, 10)
                });
              }}
              className={classes.xyhw}
            />
          </div>
          <Divider />
        </div>
      </div>
    );
  }
}

export default compose(
  connect(
    (state: RootState) => ({
      labelPrintSetting: state.labelPrintSetting
    }),
    (dispatch: Dispatch<RootAction>) =>
      bindActionCreators(
        {
          loadPrintSetting: labelPrintSettingActions.loadPrintSetting,
          setPrintSetting: labelPrintSettingActions.setPrintSetting,
          setUrl: labelPrintSettingActions.setUrl,
          openSnackbar: siteActions.openSnackbar,
          saveSetting: labelPrintSettingActions.savePrintSetting
        },
        dispatch
      )
  ),
  withStyles(styles)
)(Setting);
