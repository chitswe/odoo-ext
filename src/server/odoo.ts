import * as oOdoo from "odoo-xmlrpc";
type Odoo = {
  connectAsync: () => Promise<string>;
  execute_kwAsync: (
    model: string,
    method: string,
    filter: any,
    options?: any
  ) => Promise<any>;
};
const env = process.env.NODE_ENV ? process.env.NODE_ENV : "production";
const Odoo = (creditional: { username: string; password: string }) => {
  const url =
    env === "production" ? "http://127.0.0.1:8069" : "http://odoo.mt.com.mm";
  const oodoo = new oOdoo({
    url,
    db: env === "production" ? "Tri-Treasure" : "Tri-Treasure_Testing",
    // url: "http://localhost:8069",
    // db: "mt",
    // db: "Tri-Treasure",
    // db: "Test",
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
          let opt = [filter];
          switch (method) {
            case "search":
            case "search_read":
            case "search_count":
              opt = [Odoo.transformFilter(filter)];
              break;
            default:
              opt = [filter];
          }
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

Odoo.transformFilter = (graphqlFilter: any) => {
  if (!graphqlFilter) return graphqlFilter;
  const [filter] = graphqlFilter;
  if (!filter) return graphqlFilter;
  const newFilter = graphqlFilter[0].map((f: any) => {
    const [operator] = f;
    if (f.length && f.length === 1 && (operator === "|" || operator === "&")) {
      return operator;
    }
    return f;
  });
  return [newFilter];
};

export default Odoo;
