import { property } from "lodash";
enum MasterType {
  WAREHOUSE = "WAREHOUSE",
  PARTNER = "PARTNER",
  STOCK_OPERATION = "STOCK_OPERATION",
  PRODUCT = "PRODUCT",
  UOM = "UOM",
  SERIALNO = "SERIALNO",
  PO = "PO"
}
const schema = `
    type MasterName {
      id: String!
      name: String!
    }
`;

const resolver = {
  MasterName: {
    id: (obj: any) => {
      return `${obj.typename}_${obj.id}`;
    },
    name: property("name")
  }
};

const masterNameResolve = (values: any, typename: MasterType) => {
  const [id, name] = values;
  if (!name) return null;
  return { id, name, typename };
};

export { schema, resolver, masterNameResolve, MasterType };
