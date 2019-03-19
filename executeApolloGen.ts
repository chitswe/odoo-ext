import * as execa from "execa";

execa.sync("apollo-codegen", [
  "introspect-schema",
  "http://localhost:3030/graphql",
  "--output",
  "schema.json",
   "--header",
  // "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.IkFkbWluIg.DPF_EsQdaaemlHhNYU_2vWcnZDsjFV2A36dUD9SuH2Y" 
]);

const files = [
  [
    "src/browser/Inventory/StockPicking/graphql.ts",
    "src/browser/Inventory/StockPicking/types.ts"
  ],
  [
    "src/browser/PriceList/graphql.ts",
    "src/browser/PriceList/types.ts"
  ]
];

const promises = files.map(f => {
  const [source, output] = f;
  return execa("apollo-codegen", [
    "generate",
    source,
    "--schema",
    "schema.json",
    "--target",
    "typescript",
    "--tag-name",
    "gql",
    "--output",
    output,
    "--add-typename"
  ]);
});

Promise.all(promises).then(() => {
  console.log("Types has been generated");
});
