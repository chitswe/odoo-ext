import * as oOdoo from "odoo-xmlrpc";
type Odoo = {
  connectAsync: () => Promise<string>;
  execute_kwAsync: (
    model: string,
    method: string,
    filter: [[[any]]] | [any],
    options?: any
  ) => Promise<any>;
};
const env = process.env.NODE_ENV ? process.env.NODE_ENV : "production";
const Odoo = (creditional: { username: string; password: string }) => {
  const oodoo = new oOdoo({
    url: env === "production" ? "http://127.0.0.1:8069" : "http://odoo.mt.com.mm",
    db: "Tri-Treasure",
    username: creditional.username,
    password: creditional.password
  });

  const odoo: Odoo = {
    connectAsync: () => {
      return new Promise((resolve, reject) => {
        oodoo.connect((error: string) => {
          if (error) reject(error);
          else resolve("connected");
        });
      });
    },
    execute_kwAsync: (
      model: string,
      method: string,
      filter: [[[any]]],
      options: any
    ) => {
      return odoo.connectAsync().then(() => {
        return new Promise((resolve, reject) => {
          const opt = [filter];
          if (options) opt.push(options);
          oodoo.execute_kw(model, method, opt, (error: string, value: any) => {
            if (error) reject(error);
            else resolve(value);
          });
        });
      });
    }
  };
  return odoo;
};

export default Odoo;
