import * as React from "react";
import * as ReactDOM from "react-dom";
import TextField, { TextFieldProps } from "@material-ui/core/TextField";
import { Popover, Menu, MenuItem } from "@material-ui/core";
import * as accounting from "accounting";
import { createStyles, WithStyles, withStyles } from "@material-ui/core";
import { PopoverPosition, PopoverOrigin, PopoverProps } from "@material-ui/core/Popover";
import { MenuProps } from "@material-ui/core/Menu";
import { Query } from "react-apollo";
import update from "immutability-helper";

const styles = createStyles({
  root: {
    display: "inline-block",
    position: "relative"
  },
  input: {
    textAlign: "right"
  },
  popover: {}
});

export interface ApolloListResult<T> {
  aggegrate: {
    count: number;
  };
  edges: T[];
}

type OwnProps<T> = {
  open?: boolean;
  searchText?: string;
  openonfocus: boolean;
  onClose?: () => void;
  targetOrigin?: PopoverPosition;
  anchorOrigin?: PopoverOrigin;
  popoverProps?: {
  };
  graphqlQuery: any;
  pageSize: number;
  listPropsName?: string;  
  variables: any;
};

type Props<T> = {
  onUpdateInput?: (value: T) => void;
  onNewChange?: (value: string) => void;
  updateQuery?: (previousResult: any, list: ApolloListResult<T>) => any;
  parseListFromQueryResult?: (queryResult: any) => ApolloListResult<T>;
} & OwnProps<T> &
  TextFieldProps & { staticContext?: any } & WithStyles<typeof styles>;

// type State = {
//     anchorEl: any;
//     open: boolean;
//     changed: boolean;
//     searchText: string;    
//     searchTextField: any;
// };

class AutoComplete<T> extends React.Component<Props<T>> {
  static defaultProps: any = {
    openonfocus: false,
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left"
    },
    targetOrigin: {
      top: 0,
      left: 0
    },
    graphqlQuery: null,
    pageSize: 10,    
  };

  anchorEl: any = null;
  open: boolean = false;
  changed: boolean = false;
  searchText: string = "";    
  searchTextField: any = React.createRef<any>();
  // state: State = {
  //   anchorEl: null,
  //   open: false,
  //   changed: false,
  //   searchText: "",    
  //   searchTextField: React.createRef<any>()
  // };
  
  componentWillMount() {
    //this.setState({open: this.props.open, searchText: this.props.searchText});
    this.open = this.props.open; 
    this.searchText = this.props.searchText;
  }

  componentWillReceiveProps(nextProps: Props<T>) {
    if (this.props.searchText !== nextProps.searchText) {
        //this.setState({searchText: nextProps.searchText});
        this.searchText = nextProps.searchText;
    }
  }
  
  handleFocus = (event: any) => {
    if (!this.open && this.props.openonfocus) {
        //this.setState({open: true, anchorEl: ReactDOM.findDOMNode(this.state.searchTextField)});
        this.open = true,
        this.anchorEl = ReactDOM.findDOMNode(this.searchTextField);
      }
  }

  handleChange = (event: any) => {
    const searchText = event.target.value;

    if (searchText === this.searchText) {
        return;
    }

    //this.setState({open: true, searchText: searchText, anchorEl: ReactDOM.findDOMNode(this.state.searchTextField)});
    this.open = true;
    this.searchText = searchText;
    this.anchorEl = ReactDOM.findDOMNode(this.searchTextField);
    this.props.onNewChange(searchText);

  }

  handleItemTouchTap = (event: any, child: any) => {
    this.close();
  }

  close() {
    // this.setState({
    //     open: false,
    //     anchorEl: null,
    // });
    this.open = false;
    this.anchorEl = null;

    if (this.props.onClose) {
        this.props.onClose();
    }
  }

  blur() {
    this.searchTextField.blur();
  }

  focus() {
    this.searchTextField.focus();
  }

  render() {
    const {
      classes,
      anchorOrigin,
      targetOrigin,
      graphqlQuery,
      pageSize,
      parseListFromQueryResult,
      listPropsName,
      variables
    } = this.props;

    return (             
          <Query
              query={graphqlQuery}
              notifyOnNetworkStatusChange={true}              
              variables={{ ...variables, pageSize }}
          >
            {({ networkStatus, fetchMore, data }) => {
              const parseList = parseListFromQueryResult
              ? parseListFromQueryResult
              : (queryResult: any) => {
                  if (queryResult[listPropsName]) {
                    return queryResult[listPropsName];
                  } else {
                    return {
                      edges: [],
                      aggregate: {
                        count: 0
                      }
                    };
                  }
                };
              let parsedList = parseList(data);
              return (
                    <div className={classes.root} > 
                      <TextField
                        inputRef={(ref: any) => {
                          this.searchTextField = ref;
                        }}
                        value={this.searchText}
                        onChange={this.handleChange}
                      /> 
                      {
                        parsedList && parsedList.edges.length > 0 ?
                        <Popover
                            open={this.open}
                            anchorOrigin={anchorOrigin}
                            anchorPosition={targetOrigin}
                            anchorEl={this.anchorEl}
                        >
                          {
                            parsedList.edges.map((p: any) => (<MenuItem key={p.id} onClick={() => { this.open = false; this.props.onUpdateInput(p); }}>{p.name}</MenuItem>))
                          }
                        </Popover> : null
                      }
                    </div>
                  );
              }
            }
          </Query>
    );
  }
}

export default withStyles(styles)(AutoComplete);