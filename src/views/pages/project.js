// import external modules
import React, { Component, Fragment } from "react";
import { 
    Button, Row, Col, Card, CardBody, CardTitle, Input, Badge, Label
 } from "reactstrap"

import PulseLoader from "react-spinners/PulseLoader"
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import axios from 'axios'
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import {Divisions, FilterList, AdditionalFields, SubmittalType} from './division'
import * as Icon from "react-feather"


class SubmittalRegister extends Component {
    
    state = {
        filename: this.props.match.params.id,
        isLoading: true,
        // header list
        header: [],
        rows: [],
        
        //filter
        spec_sections: [],
        selected_spec: [],
        selected_division: [],
        selected_types: [],
        selected_subcontractor: [],
        filter_text: "",
        subcontractors: [],

        // Filter List
        showFilterList: true,
        hide_division: true,
        hide_specsection: true,
        hide_submittype: true,
        hide_subcontractor: true,

        //grid default def
        defaultColDef: {
            resizable: true,
            sortable: true,
            filter: "agTextColumnFilter",
            editable: true,
        },
        //gridAPI: null,
    }

    //Misc functions
    toKeyValue=(data) => {
        return data.toLowerCase().replace(/\s/g,'').replace(/\./g,'');
    }

    //Event Handlers
    onExport() {
        var params = {};
        var selected = this.gridAPI.getSelectedRows();
        if(selected.length > 0) {
            params.onlySelected = true;
        }
        this.gridAPI.exportDataAsCsv(params);
    }
    showHideFilterList() {
        this.setState({showFilterList: !this.state.showFilterList});
    }
    onAddRow() {
        var nodes = this.gridAPI.getSelectedNodes();
        var idx = -1;
        if( nodes.length > 0) {
            idx = nodes[0].rowIndex;
        }
        var newItem = {};
        var obj = { add: [newItem] };
        if( idx !== -1 ) {
            obj['addIndex'] = idx;
        }
        this.gridAPI.updateRowData(obj);
    }
    onDeleteRow() {
        if(window.confirm("Are you going to remove selected?")) {
            var selectedData = this.gridAPI.getSelectedRows();
            //console.log(selectedData);
            var res = this.gridAPI.updateRowData({ remove: selectedData });
        }
       
    }
    onGridReady = param => {
        this.gridAPI = param.api;
        // param.api.sizeColumnsToFit();
    }
    onFilterListChanged = selected => {

        var obj = {
            hide_division: true,
            hide_specsection: true,
            hide_submittype: true,
            hide_subcontractor: true,
        };
        selected.forEach( (val) => {
            obj[val.value] = false;
        });
        this.setState(obj);
    }
    onSubContractorChanged = selected => {
        selected.sort();
        this.setState({selected_subcontractor: selected});
        var subContractorComp = this.gridAPI.getFilterInstance("subcontractor");
        var filter_str = "";
        selected.forEach( (val) => {
            if( filter_str == "") {
                filter_str = val.label;
            }
            else {
                filter_str = filter_str + "_or_" + val.label;
            }
        })

        if(filter_str == "") {
            subContractorComp.setModel(null);
        }
        else {
            subContractorComp.setModel({
                type: "equals",
                filter: filter_str
            });
        }
        this.gridAPI.onFilterChanged();
    }
    onSubmittalTypeChanged = selected => {
        selected.sort();
        this.setState({selected_types: selected});
        var typeFilterComp = this.gridAPI.getFilterInstance("submittalType");
        var filter_str = "";
        selected.forEach( (val) => {
            if( filter_str == "") {
                filter_str = val.label;
            }
            else {
                filter_str = filter_str + "_or_" + val.label;
            }
        })

        if(filter_str == "") {
            typeFilterComp.setModel(null);
        }
        else {
            typeFilterComp.setModel({
                type: "contains",
                filter: filter_str
            });
        }
        this.gridAPI.onFilterChanged();
    }
    onSpecNameChanged = selected => {
        selected.sort();
        this.setState({selected_spec: selected});
        var specFilterComponent = this.gridAPI.getFilterInstance("specsection");
        var filter_str = "";
        selected.forEach( (val) => {
            if( filter_str == "") {
                filter_str = val.origin;
            }
            else {
                filter_str = filter_str + "_OR_" + val.origin;
            }
        })
        if(filter_str == "") {
            specFilterComponent.setModel(null);
        }
        else {
            specFilterComponent.setModel({
                type: "contains",
                filter: filter_str
            });
        }
        
        this.gridAPI.onFilterChanged();
    }
    onDivisionChanged = selected => {
        selected.sort();
        this.setState({selected_division: selected});
        var diviFilterComponent = this.gridAPI.getFilterInstance('division');

        var filter_str = "";
        selected.forEach( (val) => {
            if( filter_str == "") {
                filter_str = val.code;
            }
            else {
                filter_str = filter_str + "_OR_" + val.code;
            }
        })

        if(filter_str == "") {
            diviFilterComponent.setModel(null);
        }
        else {
            diviFilterComponent.setModel({
                type: "contains",
                filter: filter_str
            });
        }
        this.gridAPI.onFilterChanged();
    }
    onCellValueChanged = (event) => {
        if (event.column.colId == "subcontractor" ) {
            let newValue = event.newValue;
            if(newValue != "") {
                var exist = this.state.subcontractors.some( name => {
                    return name.label === newValue;
                })
                if(!exist) {
                    var arry = this.state.subcontractors;
                    var obj = {
                        value: this.toKeyValue(newValue),
                        label: newValue,
                    };
                    arry.push(obj);
                    this.setState({subcontractors: arry});
                }
            }
            
        }
    }
    componentDidMount() {
        
        // Get JSON Data from Java Backend
        axios.get("http://localhost:5000/get/" + this.state.filename)
        .then( res =>{
            this.setState({isLoading: false});
            if(res.status === 200 && res.data.result === "success") {

                var data = [];
                var data_arry = [];

                var headers_arry = [];
                var headers = [];

                var spec_section_idx = 0;
                var desc_idx = 0;
                var spec_sections = [];

                // CSV first row has the headers
                headers_arry = res.data.data[0];

                // make proper header arrays for various components
                headers_arry.forEach( (element, idx) => {

                    // make ag-grid header list
                    var obj = {
                        headerName: element,
                        field: this.toKeyValue(element),
                    }

                    if(obj["field"] =='sno') {
                        obj = {...obj, headerCheckboxSelection: true,
                            headerCheckboxSelectionFilteredOnly: true,
                            checkboxSelection: true};
                    }
                    //define filters
                    if(obj["field"] == "specsection") {
                        spec_section_idx = idx;
                        obj["filterParams"] = {
                            filterOptions: ["contains"],
                            textCustomComparator: function(filter, value, filterText) {
                                //console.log(this.appliedModel.filter);
                                var arry = filterText.split("_or_");
                                if(arry.includes(value)) return 1;
                                return 0;
                            }
                        };
                    }
                    if(obj["field"] == "division") {
                        obj["filterParams"] = {
                            filterOptions: ["contains"],
                            textCustomComparator: function(filter, value, filterText) {
                                var arry = filterText.split("_or_");
                                for (const code of arry) {
                                    if(value.startsWith(code)) return 1;
                                }
                                return 0;
                            }
                        };
                    }
                    if(obj["field"] == "submittaldescription") {
                        // add new custom submittal type column
                        var type_column = {
                            headerName: "Submittal Type",
                            field: "submittalType",
                        };
                        type_column["filterParams"] = {
                            filterOptions: ["contains"],
                            textCustomComparator: function(filter, value, filterText) {
                                var arry = filterText.split("_or_");
                                if(arry.includes(value)) return 1;
                                return 0;
                            }
                        };

                        desc_idx = idx;
                        headers.push(type_column);
                        obj["cellEditor"] = "agLargeTextCellEditor";
                    }
                    headers.push(obj);
                });
                
                data_arry = res.data.data
                // remove first element because it's a header
                data_arry.shift();

                data_arry.forEach( (row, idx) => {
                    var obj = {};

                    //Generate the ag-grid dataset
                    headers_arry.forEach( (element, i) => {
                        let key = element.toLowerCase().replace(/\s/g,'').replace(/\./g,'');
                        obj[key] = row[i];
                        if(spec_section_idx == i) {
                            var spec_obj = {
                                value: this.toKeyValue(row[i]),
                                label: row[i-1] + " - " + row[i],
                                origin: row[i],
                            };
                            var bExist = spec_sections.some( (spec) => {
                                return spec.label === spec_obj.label;
                            })
                            if(bExist == false) {
                                spec_sections.push(spec_obj);
                            }
                            
                        }
                        if(desc_idx == i) {  //if description column
                            obj['submittalType'] = SubmittalType[SubmittalType.length - 1].label;
                            for ( var val of SubmittalType) {
                            // SubmittalType.forEach( (val ) => {
                                // console.log(val);
                                var desc = row[i];
                                if(desc !== undefined) {
                                    var desc_lower = desc.toLowerCase();
                                    if(val.value == "mockup") {
                                        if(desc_lower.includes("mockup") ||
                                        desc_lower.includes("mock up"))
                                        {
                                            obj["submittalType"] = val.label;
                                            break;
                                        }
                                    }
                                    if(val.value == "testreport") {
                                        if(desc_lower.includes("test")) {
                                            obj["submittalType"] = val.label;
                                            break;
                                        }
                                    }
                                    if(desc_lower.includes(val.label.toLowerCase())) {
                                        obj["submittalType"] = val.label;
                                        break;
                                    }
                                }
                                
                            };
                        }
                    });

                    data.push(obj);
                    
                });

                //sort spec section list
                spec_sections.sort( (a, b) => {
                    var result = a.label > b.label;
                    return result == true ? 1 : -1;
                });

                // additional headers
                //headers.push(AdditionalFields);
                headers = headers.concat(AdditionalFields);

                // console.log(headers);
                this.setState({
                     header: headers,
                     rows: data,
                     spec_sections: spec_sections
                });

            }
        })
        .catch(reason => {
            this.setState({isLoading: false});
            console.log(reason);
        });

        this.onAddRow = this.onAddRow.bind(this);
        this.onDeleteRow = this.onDeleteRow.bind(this);
        this.showHideFilterList = this.showHideFilterList.bind(this);
        this.onExport = this.onExport.bind(this);
    }

    //For filters 
    DropdownLabelFunc = (props) => {
        if( props.value == null || props.value.length == 0)
            return props.placeholderButtonLabel;
        return (
            <div>
                {props.placeholderButtonLabel} <Badge color="success" className="right-align">{props.value.length}</Badge>
            </div>);
    }

    styleFunc = (provided, state) => {
        return {...provided, 
                borderWidth: "1px",
                borderRadius: "5px",
                boxShadow: "0",
                padding: "3px",
                marginBottom: "5px",
                marginRight: "3px"
            }
    }

    FilterLabelFunc = (prop) => {
        return <div style={{paddingTop: "3px"}}> <Icon.Filter size="16"></Icon.Filter><b> Add Filters</b></div>
    }
    render() {
        return(
        <Fragment>
            {/* <ContentHeader>Project</ContentHeader>
            <ContentSubHeader>Project Detail</ContentSubHeader> */}
            <Row className="row-eq-height">
                <Col hidden= {!this.state.isLoading}>
                    <div style={{textAlign: "center", paddingTop: "30px"} }>
                        <PulseLoader 
                            className="clip-loader"
                            sizeUnit={"px"}
                            size={24}
                            color={'#009DA0'}
                            loading={this.state.isLoading}
                        />
                    </div>
                </Col>
            </Row>
            
            <Card hidden= {this.state.isLoading}>
                <CardBody>
                    <Row>
                        <Col md="2">
                            <b>Applied Filters</b>
                            <div hidden={!this.state.showFilterList} style={{display: "inline-block"}}>
                                <Icon.ChevronUp size="20" onClick={this.showHideFilterList}></Icon.ChevronUp>
                            </div>
                            <div hidden={this.state.showFilterList}style={{display: "inline-block"}}>
                                <Icon.ChevronDown size="20"  onClick={this.showHideFilterList} ></Icon.ChevronDown>
                            </div>
                        </Col>
                        
                        <Col md="10" hidden={!this.state.showFilterList}>
                            {
                                this.state.selected_division.map( (val, idx) => {
                                    return <Badge color="Grey" key={val.code} pill>{val.label}</Badge>
                                })
                            }
                            {
                                this.state.selected_spec.map( (val, idx) => {
                                    return <Badge color="info" key={idx} pill>{val.label}</Badge>
                                })
                            }
                            {
                                this.state.selected_types.map( (val, idx) => {
                                    return <Badge key={idx} pill style={{ "backgroundColor": "#06AC61" }}>{val.label}</Badge>
                                })
                            }
                            {
                                this.state.selected_subcontractor.map( (val, idx) => {
                                    return <Badge key={idx} pill style={{ "backgroundColor": "#5C6BC0" }}>{val.label}</Badge>
                                })
                            }
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col md="2">
                            <ReactMultiSelectCheckboxes
                            options={FilterList}
                            placeholderButtonLabel='Add Filter'
                            getDropdownButtonLabel={this.FilterLabelFunc}
                            styles={{dropdownButton: this.styleFunc}}
                            components={{Control: props => { return <div></div>}}}
                            onChange={this.onFilterListChanged}
                            />
                        </Col>
                        <div hidden={this.state.hide_division}>
                            <ReactMultiSelectCheckboxes
                                name="division_filter"
                                getDropdownButtonLabel={this.DropdownLabelFunc}
                                options={Divisions}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                placeholderButtonLabel='Divisions'
                                onChange={this.onDivisionChanged}
                                styles={{dropdownButton: this.styleFunc, 
                                    menu: (provid) => ({...provid,fontSize: "12px"})}}
                            />
                        </div>
                        <div hidden={this.state.hide_specsection}>
                            <ReactMultiSelectCheckboxes
                                // defaultValue={[colourOptions[2], colourOptions[3]]}
                                getDropdownButtonLabel={this.DropdownLabelFunc}
                                name="specname_filter"
                                options={this.state.spec_sections}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                placeholderButtonLabel='Spec Section'
                                styles={{dropdownButton: this.styleFunc
                                    , control: (prv)=> ({...prv, width: 400}), menu: (provid) => ({...provid,fontSize: "12px"})}}
                                onChange={this.onSpecNameChanged}
                            />
                        </div>
                        <div hidden={this.state.hide_submittype}>
                            <ReactMultiSelectCheckboxes
                                getDropdownButtonLabel={this.DropdownLabelFunc}
                                name="submittype_filter"
                                options={SubmittalType}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                placeholderButtonLabel='Submittal Types'
                                styles={{dropdownButton: this.styleFunc
                                    , control: (prv)=> ({...prv, width: 400}), menu: (provid) => ({...provid,fontSize: "12px"})}}
                                onChange={this.onSubmittalTypeChanged}
                            />
                        </div>
                        <div hidden={this.state.hide_subcontractor}>
                            <ReactMultiSelectCheckboxes
                                getDropdownButtonLabel={this.DropdownLabelFunc}
                                name="subcontractor_filter"
                                options={this.state.subcontractors}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                placeholderButtonLabel='Subcontractors'
                                styles={{dropdownButton: this.styleFunc
                                    , control: (prv)=> ({...prv, width: 400}), menu: (provid) => ({...provid,fontSize: "12px"})}}
                                // styles= { {control: (provided, state) => {
                                //     return {...provided,}
                                // }}}
                                onChange={this.onSubContractorChanged}
                            />
                        </div>
                    </Row>
                    <Row>
                        <Col md="2">
                            <Input 
                                placeholder={"Search..."}
                                bsSize="sm"
                                style={{marginBottom: "5px"}}
                                onChange={ (event) => {
                                    this.setState({filter_text: event.target.value});
                                }}
                                >
                            </Input>
                        </Col>
                        <Col>
                            <Button color="info" size="sm" className="text-center gradient-light-blue-cyan mr-2 white "
                             onClick={this.onAddRow}
                            >
                                <Icon.PlusCircle size="20"/>  Add
                            </Button>
                            <Button color="info" size="sm" className="text-center gradient-light-blue-cyan mr-2 white "
                             onClick={this.onDeleteRow}
                            >
                                <Icon.MinusCircle size="20"/>  Delete
                            </Button>

                            <Button color="info" size="sm" className="text-center gradient-light-blue-cyan mr-2 white "
                            onClick={this.onExport}>
                                <Icon.Download size="20"/>  Export
                            </Button>
                        </Col>
                    </Row>
                    
                    <div className="ag-theme-balham"
                         style={{ 
                         height: 'calc(70vh)', 
                         width: '100%' }}>
                    
                        <AgGridReact
                        columnDefs={this.state.header}
                        rowData={this.state.rows}
                        pagination={true}
                        paginationPageSize={100}
                        floatingFilter={false}
                        defaultColDef={this.state.defaultColDef}
                        quickFilterText ={this.state.filter_text}
                        onGridReady={this.onGridReady}
                        rowSelection="multiple"
                        components={{datePicker: getDatePicker()}}
                        singleClickEdit={true}
                        onCellValueChanged={this.onCellValueChanged}
                        >
                        </AgGridReact>
                    </div>
                </CardBody>
            </Card>            
        </Fragment>)
    }
}
function getDatePicker() {
    function Datepicker() {}
    Datepicker.prototype.init = function(params) {
      this.eInput = document.createElement("input");
      this.eInput.value = params.value;
      //$(this.eInput).datepicker({ dateFormat: "dd/mm/yy" });
      this.eInput.type="date";
    };
    Datepicker.prototype.getGui = function() {
      return this.eInput;
    };
    Datepicker.prototype.afterGuiAttached = function() {
      this.eInput.focus();
      this.eInput.select();
    };
    Datepicker.prototype.getValue = function() {
      return this.eInput.value;
    };
    Datepicker.prototype.destroy = function() {};
    Datepicker.prototype.isPopup = function() {
      return false;
    };
    return Datepicker;
  }

export default SubmittalRegister;