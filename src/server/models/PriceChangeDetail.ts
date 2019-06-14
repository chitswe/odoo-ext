import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";
import { DataTypeInteger, DataTypeFloat } from "sequelize";
import PriceChange from "./PriceChange";
@Table({ paranoid: true, timestamps: true })
class PriceChangeDetail extends Model<PriceChangeDetail> {
    @Column(DataType.INTEGER) ProductId: DataTypeInteger;
    @Column(DataType.INTEGER) PriceBookId: DataTypeInteger;
    @ForeignKey(() => PriceChange)
    @Column(DataType.INTEGER) PriceChangeId: DataTypeInteger;
    @Column(DataType.DECIMAL(14, 3)) OldPrice: DataTypeFloat;
    @Column(DataType.DECIMAL(14, 3)) NewPrice: DataTypeFloat;
    @Column(DataType.BOOLEAN) Approved: Boolean;
}

export default PriceChangeDetail;