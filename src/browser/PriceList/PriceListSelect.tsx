import * as React from "react";
import {
  Select,
  MenuItem,
  Theme,
  createStyles,
  WithStyles,
  withStyles,
  Chip
} from "@material-ui/core";
import { MasterPriceList } from "./resolvedTypes";
import { compose } from "react-apollo";
import { connect } from "react-redux";
import { RootState, RootAction } from "../reducer";
import { bindActionCreators, Dispatch } from "redux";
import { priceListActions } from "../reducer/priceList";

const styles = (theme: Theme) =>
  createStyles({
    chips: {
      display: "flex",
      flexWrap: "wrap"
    },
    chip: {
      margin: theme.spacing.unit / 4
    }
  });

type Props = WithStyles<typeof styles> & {
  priceLists: MasterPriceList[];
  masterPriceList: { [id: number]: MasterPriceList };
  selectedPriceList: number[];
  setSelected: typeof priceListActions.setSelectedPriceList;
};

type State = {
  selected: number[];
  open: boolean;
};

class PriceListSelect extends React.Component<Props, State> {
  state: State = {
    selected: [],
    open: false
  };

  componentDidMount() {
    this.setState({ selected: this.props.selectedPriceList });
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.selectedPriceList !== this.props.selectedPriceList) {
      this.setState({ selected: newProps.selectedPriceList });
    }
  }

  render() {
    const { selected, open } = this.state;
    const { classes, masterPriceList, priceLists, setSelected } = this.props;
    return (
      <Select
        multiple
        value={selected}
        onChange={e => {
          const priceList: number[] = e.target.value as any;
          this.setState({ selected: priceList });
        }}
        onOpen={() => {
          this.setState({ open: true });
        }}
        open={open}
        renderValue={(s: number[]) => (
          <div className={classes.chips}>
            {s.map(id => (
              <Chip
                key={id}
                label={masterPriceList[id] ? masterPriceList[id].name : ""}
                className={classes.chip}
              />
            ))}
          </div>
        )}
        onClose={() => {
          setSelected(this.state.selected);
          this.setState({ open: false });
        }}
      >
        {priceLists
          ? priceLists.map((p: MasterPriceList) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))
          : null}
      </Select>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    (state: RootState) => {
      return {
        masterPriceList: state.priceList.master,
        selectedPriceList: state.priceList.selected
      };
    },
    (dispatch: Dispatch<RootAction>) =>
      bindActionCreators(
        {
          setSelected: priceListActions.setSelectedPriceList
        },
        dispatch
      )
  )
)(PriceListSelect);
