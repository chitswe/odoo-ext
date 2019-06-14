import { PaymentQuery } from "./types";

type PaymentsType = PaymentQuery["payment"]["edges"];
type PaymentType = PaymentsType[number];

export {
    PaymentsType,
    PaymentType
};