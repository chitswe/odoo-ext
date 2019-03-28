import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ApolloProvider } from "react-apollo";
import { Provider } from "react-redux";
import { createClientStore } from "../createStore";
import createApolloClient from "./createApolloClient";
import CssBaseline from "@material-ui/core/CssBaseline";
import { IconContext } from "react-icons";
import {
  createGenerateClassName,
  createMuiTheme,
  MuiThemeProvider
} from "@material-ui/core/styles";
import { JssProvider } from "react-jss";
import { green } from "@material-ui/core/colors";
import ScreenInfoContext from "../common/ScreenInfoContext";
const init = async () => {
  const persistantStore = await createClientStore();
  const apolloClient = createApolloClient(persistantStore.store);
  const generateClassName = createGenerateClassName();
  const theme = createMuiTheme({
    typography: {
      useNextVariants: true
    },
    palette: {
      primary: green,
      type: "light"
    }
  });
  ReactDOM.hydrate(
    <JssProvider generateClassName={generateClassName}>
      <ApolloProvider client={apolloClient}>
        <MuiThemeProvider theme={theme}>
          <Provider store={persistantStore.store}>
            <IconContext.Provider value={{ size: "24px" }}>
              <CssBaseline />
              <Router>
                <ScreenInfoContext.Provider
                  value={{
                    width: window.innerWidth,
                    height: window.innerHeight
                  }}
                >
                  <Route path="/" component={App}/>
                </ScreenInfoContext.Provider>
              </Router>
            </IconContext.Provider>
          </Provider>
        </MuiThemeProvider>
      </ApolloProvider>
    </JssProvider>,
    document.getElementById("root"),
    () => {
      const ssStyles = document.getElementById("jss-server-side");
      ssStyles.parentNode.removeChild(ssStyles);
    }
  );
};
init();
