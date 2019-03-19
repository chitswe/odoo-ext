import * as React from "react";
import { Query, compose, Mutation } from "react-apollo";
import {
  productPriceListQuery,
  getMasterPriceListQuery,
  changePriceMutation
} from "./graphql";
import { MasterPriceList, PriceValueType, ProductType } from "./resolvedTypes";
import {
  CircularProgress,
  TextField,
  Theme,
  createStyles,
  WithStyles,
  withStyles,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider
} from "@material-ui/core";
import { priceListActions } from "../reducer/priceList";
import update from "immutability-helper";
import { RootState, RootAction } from "../reducer";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import CurrencyEditor from "../component/CurrencyEditor";

const styles = (theme: Theme) =>
  createStyles({
    priceLabel: {
      display: "flex",
      alignItems: "center"
    },
    labelprogress: {
      marginRight: 8
    },
    price: {
      width: "100%"
    },
    row: {
      marginTop: theme.spacing.unit * 2,
      marginBottom: theme.spacing.unit * 3
    },
    root: {
      flexDirection: "column",
      flex: 1,
      display: "flex"
    },
    center: {
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
      position: "absolute",
      margin: "auto"
    },
    scroller: {
      flex: 1,
      overflowY: "auto",
      paddingLeft: theme.spacing.unit,
      paddingRight: theme.spacing.unit
    },
    loader: {
      flex: 1,
      position: "relative"
    }
  });

type Props = {
  productId: number;
  setEdit: typeof priceListActions.setEdit;
  edit: ProductType;
  loadEdit: typeof priceListActions.loadEdit;
  rootClassName?: string;
} & WithStyles<typeof styles>;

type State = {};

class PriceListDetail extends React.Component<Props, State> {
  product: ProductType = null;
  render() {
    const {
      productId,
      setEdit,
      edit,
      classes,
      loadEdit,
      rootClassName
    } = this.props;
    return (
      <div className={`${classes.root} ${rootClassName}`}>
        <Query query={getMasterPriceListQuery}>
          {masterPriceQueryResult => {
            if (
              masterPriceQueryResult.data &&
              masterPriceQueryResult.data.pricelists
            ) {
              const masterPriceList =
                masterPriceQueryResult.data.pricelists.edges;
              return (
                <Query
                  ssr={false}
                  query={productPriceListQuery}
                  variables={{
                    productId,
                    priceListIds: masterPriceList.map(
                      (p: MasterPriceList) => p.id
                    )
                  }}
                  onCompleted={data => {
                    if (data && data.product !== this.product) {
                      loadEdit(data.product);
                      this.product = data.product;
                    }
                  }}
                >
                  {({ data, loading }) => {
                    if (
                      data &&
                      data.product &&
                      edit &&
                      edit.id === data.product.id &&
                      !loading
                    ) {
                      const { priceLists } = edit;
                      return (
                          <div className={classes.scroller}>
                            <div>
                              {priceLists.map(
                                (p: PriceValueType, index: number) => (
                                  <Mutation
                                    mutation={changePriceMutation}
                                    key={p.priceList.id}
                                  >
                                    {(
                                      changePrice,
                                      { loading: saving, error: saveError }
                                    ) => (
                                      <div className={classes.row}>
                                        <CurrencyEditor
                                          onValidating={value => {
                                            return value >= 0;
                                          }}
                                          onValidated={(value, oldValue) => {
                                            if (value !== oldValue)
                                              changePrice({
                                                variables: {
                                                  productId: data.product.id,
                                                  priceListId: p.priceList.id,
                                                  price: value
                                                }
                                              });
                                          }}
                                          retainFocusOnError={true}
                                          error={!!saveError}
                                          helperText={
                                            saveError ? "Could not saved!" : ""
                                          }
                                          label={
                                            <span
                                              className={classes.priceLabel}
                                            >
                                              {saving ? (
                                                <CircularProgress
                                                  className={
                                                    classes.labelprogress
                                                  }
                                                  size={24}
                                                  color="secondary"
                                                />
                                              ) : null}
                                              <span>{p.priceList.name}</span>
                                            </span>
                                          }
                                          numberPrecision={0}
                                          value={p.price}
                                          className={classes.price}
                                          onChanged={value => {
                                            const newEdit = update(edit, {
                                              priceLists: {
                                                [index]: {
                                                  price: {
                                                    $set: value
                                                  }
                                                }
                                              }
                                            });
                                            setEdit(newEdit);
                                          }}
                                        />
                                      </div>
                                    )}
                                  </Mutation>
                                )
                              )}
                            </div>
                          </div>
                      );
                    } else {
                      return (
                        <div className={`${classes.loader} ${rootClassName}`}>
                          <CircularProgress
                            className={classes.center}
                            color="secondary"
                          />
                        </div>
                      );
                    }
                  }}
                </Query>
              );
            } else {
              return (
                <div className={`${classes.loader} ${rootClassName}`}>
                  <CircularProgress
                    className={classes.center}
                    color="secondary"
                  />
                </div>
              );
            }
          }}
        </Query>
      </div>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    (state: RootState) => ({
      edit: state.priceList.edit
    }),
    (dispatch: Dispatch<RootAction>) =>
      bindActionCreators(
        {
          setEdit: priceListActions.setEdit,
          loadEdit: priceListActions.loadEdit
        },
        dispatch
      )
  )
)(PriceListDetail);
