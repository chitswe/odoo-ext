import Odoo from "./odoo";
import data from "./psd";
const odoo = Odoo({ username: "chitswe@mt.com.mm", password: "123456" });
const count = data.length;
const pageSize = 10;
function runImport() {
  createRecord(0);
}

function createRecord(index: number) {
  const record: any[] = data[index];
  const [
    inventory_id,
    product_id,
    product_qty,
    prod_lot_id,
    product_uom_id,
    location_id
  ] = record;
  const input = {
    inventory_id,
    product_id,
    product_qty,
    prod_lot_id,
    product_uom_id,
    location_id
  };
  console.log(`........${index}........`);
  odoo
    .execute_kwAsync("stock.inventory.line", "create", [input])
    .then(result => {
      console.log(result);
      if (index < count - 1) {
        createRecord(++index);
      }
    })
    .catch(e => {
      console.log(".........failed .......");
      console.log(e);
    });
}

function runBatch(start: number = 0, end: number) {
  console.log(`${start},${end}`);
  odoo
    .execute_kwAsync("stock.inventory.line", "load", [
      [
        "inventory_id",
        "product_id",
        "product_qty",
        "prod_lot_id",
        "product_uom_id",
        "location_id"
      ],
      data.slice(start, end + 1)
    ])
    .then(result => {
      if (start + pageSize < count) {
        start += pageSize;
        runBatch(start, Math.min(start + pageSize - 1, count - 1));
      }
    })
    .catch(e => {
      console.log(".........failed .......");
      console.log(e);
    });
}

function init() {
  odoo
    .connectAsync()
    .then(() => {
      runImport();
    })
    .catch(e => {
      console.log(e);
    });
}

init();
