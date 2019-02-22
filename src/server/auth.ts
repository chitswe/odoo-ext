import * as passport from "passport";
import { Strategy as CustomStrategy } from "passport-custom";
import * as jwt from "jwt-simple";
import secret from "../secret";
import Odoo from "./odoo";

export type AuthResult = {
  odoo?: Odoo;
  username?: string;
  authenticated: boolean;
  error?: string;
  access_token?: string;
};

export async function login(username: string, password: string) {
  const result: AuthResult = await checkOdoo(username, password);
  if (result.authenticated) {
    result.access_token = jwt.encode(
      { username, password },
      secret.auth_secret
    );
  }
  return result;
}

function checkOdoo(username: string, password: string) {
  const odoo = Odoo({ username, password });
  return odoo
    .connectAsync()
    .then(() => {
      return {
        odoo,
        username: username,
        authenticated: true
      };
    })
    .catch(e => {
      return { authenticated: false, error: e.message ? e.message : e };
    });
}

async function verifySession(token: string) {
  let decoded: any = null;
  try {
    decoded = jwt.decode(token, secret.auth_secret);
  } catch (e) {
    /** */
  }
  let result: AuthResult = null;
  if (!decoded) result = { error: "Invalid Token!", authenticated: false };
  else {
    result = await checkOdoo(decoded.username, decoded.password);
    if (result.authenticated) result.access_token = token;
  }
  return result;
}

passport.use(
  "bearer-graphql",
  new CustomStrategy(
    async (req: Request, done: (error: string, user: any) => void) => {
      const authorization = (req.headers as any).authorization;
      let token = authorization ? authorization.replace("Bearer ", "") : "";
      token = token ? token : (req as any).cookies.access_token;
      try {
        const sessionData = await verifySession(token);
        done(null, sessionData);
      } catch (e) {
        done(null, {
          authenticated: false,
          error: e
        });
      }
    }
  )
);

passport.use(
  "cookie",
  new CustomStrategy(
    async (req: Request, done: (error: string, user: any) => void) => {
      const token = (req as any).cookies.access_token;
      try {
        const sessionData = await verifySession(token);
        done(null, sessionData);
      } catch (e) {
        done(null, {
          authenticated: false,
          error: e
        });
      }
    }
  )
);
