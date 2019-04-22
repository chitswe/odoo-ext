import Odoo from "./odoo";
const ids = [
    77754,
77796,
77881,
78190,
78301,
78774,
79201,
79204,
79364,
79830,
79988,
80686,
80776,
80867,
81549,
81558,
81782,
82298,
82738,
83709,
84138,
84711,
84938,
];

const odoo = Odoo({ username: "chitswe@mt.com.mm", password: "123456" });
function init() {
  odoo
    .connectAsync()
    .then(() => {
      odoo
        .execute_kwAsync("stock.inventory.line", "unlink", [
          ids
        ])
        .then(result => {
          console.log(result);
        })
        .catch(error => {
          console.log(error);
        });
    })
    .catch(e => {
      console.log(e);
    });
}

init();
