import * as React from "react";
import { TextAlignProperty } from "csstype";
import * as _ from "lodash";
import {
  Theme,
  createStyles,
  WithStyles,
  TableSortLabel,
  TableCell,
  withStyles
} from "@material-ui/core";
import {
  AutoSizer,
  Table,
  Index,
  Column,
  TableHeaderProps,
  SortDirectionType,
  TableCellProps,
  TableCellDataGetterParams
} from "react-virtualized";
import classNames from "classnames";

export enum SearchMode {
  in = 1,
  contain = 2,
  startWith = 3
}

export interface GridColumn<T> {
  label: string;
  key: string;
  width: number;
  flexGrow?: number;
  sortable?: boolean;
  searchMode?: SearchMode;
  sortDirection?: SortDirectionType;
  labelAlign?: "right" | "left" | "center";
  textAlign?: "right" | "left" | "center";
  format?: (key: string, rowData: T) => string;
  hideAt?: number;
}

export interface VirtualizedGridProps<T> {
  columns: ReadonlyArray<GridColumn<T>>;
  rowGetter: (index: Index) => T;
  initialLoading: boolean;
  rowCount: number;
  rowClassName?: string;
  onRowClick?: (rowData: T) => void;
}

const styles = (theme: Theme) =>
  createStyles({
    table: {
      fontFamily: theme.typography.fontFamily
    },
    flexContainer: {
      display: "flex",
      alignItems: "center",
      boxSizing: "border-box"
    },
    tableRow: {
      cursor: "pointer"
    },
    tableRowHover: {
      "&:hover": {
        backgroundColor: theme.palette.grey[200]
      }
    },
    tableCell: {
      flex: 1
    },
    noClick: {
      cursor: "initial"
    }
  });

class VritualizedGrid<T> extends React.PureComponent<
  VirtualizedGridProps<T> & WithStyles<typeof styles>
> {
  getRowClassName({ index }: Index) {
    const { classes, rowClassName, onRowClick } = this.props;

    return classNames(classes.tableRow, classes.flexContainer, rowClassName, {
      [classes.tableRowHover]: index !== -1 && onRowClick != null
    });
  }

  headerRenderer({
    label,
    columnData: { sortable, labelAlign, sortDirection }
  }: TableHeaderProps) {
    const { classes } = this.props;
    const headerHeight = 56;

    const inner =
      sortable && sortDirection ? (
        <TableSortLabel direction={sortDirection === "ASC" ? "asc" : "desc"}>
          {label}
        </TableSortLabel>
      ) : (
        label
      );

    return (
      <TableCell
        component="div"
        className={classNames(
          classes.tableCell,
          classes.flexContainer,
          classes.noClick
        )}
        variant="head"
        style={{ height: 56 }}
        align={labelAlign}
      >
        {inner}
      </TableCell>
    );
  }

  cellRenderer({ cellData, columnData }: TableCellProps) {
    const { classes, onRowClick } = this.props;
    return (
      <TableCell
        component="div"
        className={classNames(classes.tableCell, classes.flexContainer, {
          [classes.noClick]: onRowClick == null
        })}
        variant="body"
        style={{ height: 56 }}
        align={columnData.numeric || false ? "right" : "left"}
      >
        {cellData}
      </TableCell>
    );
  }

  render() {
    const { rowGetter, rowCount: rowCount, classes, columns } = this.props;
    return (
      <AutoSizer defaultHeight={500}>
        {({ height, width }) => (
          <Table
            rowGetter={rowGetter}
            className={classes.table}
            height={height}
            width={width}
            rowHeight={56}
            headerHeight={56}
            rowCount={rowCount}
            rowClassName={this.getRowClassName.bind(this)}
          >
            {_.filter(
              columns,
              (column: GridColumn<T>) => !column.hideAt || column.hideAt < width
            ).map((column: GridColumn<T>) => {
              const cellDataGetter = column.format
                ? (params: TableCellDataGetterParams) => {
                    return column.format(params.dataKey, params.rowData);
                  }
                : (params: TableCellDataGetterParams) =>
                    params.rowData[params.dataKey].toString();
              return (
                <Column
                  key={column.key}
                  columnData={column}
                  dataKey={column.key}
                  label={column.label}
                  width={column.width}
                  className={classNames(classes.flexContainer, column.key)}
                  headerRenderer={this.headerRenderer.bind(this)}
                  cellRenderer={this.cellRenderer.bind(this)}
                  disableSort={!column.sortable}
                  cellDataGetter={cellDataGetter}
                  flexGrow={column.flexGrow}
                />
              );
            })}
          </Table>
        )}
      </AutoSizer>
    );
  }
}

export default withStyles(styles)(VritualizedGrid);
