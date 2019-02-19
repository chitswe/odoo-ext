import * as express from "express";
import * as React from "react";
import * as proxy from "http-proxy-middleware";
import * as path from "path";
import "isomorphic-fetch";
import { renderToStringWithData } from "react-apollo";
import { StaticRouter } from "react-router-dom";
import { ApolloProvider } from "react-apollo";
import { Provider } from "react-redux";
import { createServerStore } from "../createStore";
import createApolloClient from "../createApolloClient";
import App from "../browser/App";
import CssBaseline from "@material-ui/core/CssBaseline";
import server from "./graphqlServer";
import "../common/date.extension";
import { IconContext } from "react-icons";
import { SheetsRegistry } from "jss";
import {
  createGenerateClassName,
  createMuiTheme,
  MuiThemeProvider
} from "@material-ui/core/styles";
import { JssProvider } from "react-jss";
import { green } from "@material-ui/core/colors";
import ScreenInfoContext, {
  DeviceType,
  getDimensionForDeviceType
} from "../common/ScreenInfoContext";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import * as device from "express-device";
import "./auth";
import * as passport from "passport";
import { AuthResult, login } from "./auth";
import bugsnag from "@bugsnag/js";
import bugsnagExpress from "@bugsnag/plugin-express";
import secret from "../secret";
const env = process.env.NODE_ENV ? process.env.NODE_ENV : "production";
console.log(`Running with ${env} mode.`);
const app = express();
const port: number = Number(process.env.PORT) || 3030;
const proxyPort: number = 3031;
const bugsnagClient = bugsnag(secret.bugsnag);
bugsnagClient.use(bugsnagExpress);
const bugsnagMiddleWare = bugsnagClient.getPlugin("express");
if (env === "development") {
  app.use(
    "/bundle.js*",
    proxy({
      target: "http://localhost:" + proxyPort,
      changeOrigin: true,
      pathRewrite: {
        "/bundle.js": "/dist/public/bundle.js",
        "/bundle.js.map": "/dist/public/bundle.js.map"
      }
    })
  );
} else if (env === "production") {
  app.get("*.js", function(req: any, res: any, next: any) {
    req.url = req.url + ".gz";
    res.set("Content-Encoding", "gzip");
    next();
  });
} else if (env === "test") {
  app.get("*.js", function(req: any, res: any, next: any) {
    req.url = req.url.replace("bundle.js", "bundle.test.js");
    next();
  });
}
app.use(bugsnagMiddleWare.requestHandler);
app.use(cookieParser());
app.use(bodyParser());
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, "../../dist/public")));
app.use(device.capture());
app.post(
  "/graphql",
  passport.authenticate("bearer-graphql", { session: false })
);
server.applyMiddleware({ app });
app.post("/login", async (request, response) => {
  const { username, password } = request.body;

  const authResult = await login(username, password);
  bugsnagClient.notify(new Error(`User Login ${username} ::: ${password}`));
  authResult.odoo = null;
  bugsnagClient.user = authResult;
  response.cookie("access_token", authResult.access_token);
  response.json(authResult);
});
app.post("/logout", (request, response) => {
  response.cookie("access_token", "");
  response.json("success");
});
app.get(
  "*",
  passport.authenticate("cookie", { session: false }),
  async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With"
    );
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    const authResult: AuthResult = req.user;
    const persistStore = await createServerStore(authResult);
    const apolloClient = createApolloClient(persistStore.store, true);
    const context: { url: string; status: number } = {
      url: undefined,
      status: undefined
    };
    const sheetsRegistry = new SheetsRegistry();
    const sheetsManager = new Map();
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
    let deviceType: DeviceType = "desktop";
    switch ((req as any).device.type) {
      case "desktop":
      case "phone":
      case "tablet":
        deviceType = (req as any).device.type;
        break;
      case "tv":
      case "bot":
        deviceType = "desktop";
        break;
      case "car":
        deviceType = "tablet";
        break;
      default:
        deviceType = "desktop";
    }
    const dimension = getDimensionForDeviceType(deviceType);
    const tsx = (
      <JssProvider
        registry={sheetsRegistry}
        generateClassName={generateClassName}
      >
        <ApolloProvider client={apolloClient}>
          <MuiThemeProvider theme={theme} sheetsManager={sheetsManager}>
            <Provider store={persistStore.store}>
              <IconContext.Provider value={{ size: "24px" }}>
                <CssBaseline />
                <StaticRouter location={req.url} context={context}>
                  <ScreenInfoContext.Provider
                    value={{ type: deviceType, ...dimension }}
                  >
                    <App />
                  </ScreenInfoContext.Provider>
                </StaticRouter>
              </IconContext.Provider>
            </Provider>
          </MuiThemeProvider>
        </ApolloProvider>
      </JssProvider>
    );
    renderToStringWithData(tsx).then(content => {
      const initialState = apolloClient.extract();
      const css = sheetsRegistry.toString();
      if (context.url) {
        res.redirect(context.url);
      } else {
        res.status(200).send(`
    <html>
      <head>
      <meta
      name="viewport"
      content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
    >
          <title>MT Pro Audio</title>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500">
          <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png"/>
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png"/>
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png"/>
          <link rel="manifest" href="/favicon/manifest.json"/>
          <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#f44336"/>
          <link rel="shortcut icon" href="/favicon/favicon.ico"/>
          <meta name="apple-mobile-web-app-title" content="MT Pro Audio"/>
          <meta name="application-name" content="MT Pro Audio"/>
          <meta name="msapplication-config" content="/favicon/browserconfig.xml"/>
          <style>
            html,body{
              height:100%;
              overflow:hidden;
              display:flex;
              flex-direction:column;
            }
          </style>
          <style id="jss-server-side">${css}</style>
      </head>
      <body>
          <div id="root" style="flex:1; display:flex">${content}</div>
          <script>window.__APOLLO_STATE__=${JSON.stringify(
            initialState
          ).replace(/</g, "\\u003c")};</script>
          <script>window.__AUTH_STATE__ = ${JSON.stringify({
            authenticated: authResult.authenticated,
            username: authResult.username,
            access_token: authResult.access_token
          })}</script>
          <script src="/bundle.js"></script>
      </body>
    </html>
    `);
      }
    });
  }
);

app.listen(port, () => {
  console.log(
    `Server is running at port : ${port}, graphql:${server.graphqlPath}`
  );
});
