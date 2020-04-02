import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { DataTypeInteger, BelongsToCreateAssociationMixin , HasManyAddAssociationMixin, HasManyCreateAssociationMixin } from "sequelize";
import PriceChangeDetail from "./PriceChangeDetail";
@Table({ paranoid: true, timestamps: true })
class PriceChange extends Model<PriceChange> {
    @Column({
        type: DataType.DATEONLY,
        allowNull: false
    }) PriceChangeDate: Date;
    @Column(DataType.INTEGER) createdBy: DataTypeInteger;
    @Column(DataType.INTEGER) updatedBy: DataTypeInteger;
    @Column(DataType.STRING) Remark: String;
    @HasMany(() => PriceChangeDetail) detail: PriceChangeDetail[];

    public createPriceChangeDetail: BelongsToCreateAssociationMixin<PriceChangeDetail, PriceChangeDetail>;
    
}

export default PriceChange;