import * as React from "react";
import {
  Link,
  Route,
  RouteComponentProps,
  Switch,
  Redirect
} from "react-router-dom";
import StockPickings from "./StockPicking";
import StockPicking from "./StockPicking/view";

interface Props extends RouteComponentProps {}
class Inventory extends React.PureComponent<Props> {
  render() {
    const { match } = this.props;
    return (
      <React.Fragment>
        <Switch>
          <Route path={`${match.url}/picking/:id`} component={StockPicking} />}
          />
          <Route
            exact
            path={`${match.url}/picking`}
            component={StockPickings}
          />
          <Redirect
            to={{
              pathname: "/inventory/picking"
            }}
          />
        </Switch>
      </React.Fragment>
    );
  }
}

export default Inventory;
