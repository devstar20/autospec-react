// Definition for Division 50 of CSI
// Reference : https://en.wikipedia.org/wiki/50_Divisions

export const Divisions = [

    //General Requirements
    { value: "general", label: "01 - General Requirements", code: "01"},

    //Facility Construction
    { value: "conditions", label: "02 — Existing Conditions", code: "02"},
    { value: "concrete", label: "03 — Concrete", code: "03"},
    { value: "masonry", label: "04 — Masonry", code: "04"},
    { value: "metals", label: "05 - Metals", code: "05"},
    { value: "composites", label: "06 — Wood, Plastics, and Composites", code: "06"},
    { value: "thermal", label: "07 — Thermal and Moisture Protection", code: "07"},
    { value: "openings", label: "08 — Openings", code: "08"},
    { value: "finishes", label: "09 — Finishes", code: "09"},
    { value: "specialties", label: "10 — Specialties", code: "10"},
    { value: "equipment", label: "11 — Equipment", code: "11"},
    { value: "furnishings", label: "12 — Furnishings", code: "12"},
    { value: "special", label: "13 — Special Construction", code: "13"},
    { value: "conveying", label: "14 — Conveying Equipment", code: "14"},
    
    //Facility Services
    { value: "mechanical", label: "20 — Mechanical Support", code: "20"},
    { value: "fire", label: "21 — Fire Suppression", code: "21"},
    { value: "plumbing", label: "22 — Plumbing", code: "22"},
    { value: "heating", label: "23 — Heating Ventilating and Air Conditioning", code: "23"},
    { value: "automation", label: "25 — Integrated Automation", code: "25"},
    { value: "electrical", label: "26 — Electrical", code: "26"},
    { value: "communication", label: "27 — Communications", code: "27"},
    { value: "security", label: "28 — Electronic Safety and Security", code: "28"},
    
    //Site and Infrastructure
    { value: "earthwork", label: "31 — Earthwork", code: "31"},
    { value: "exterior", label: "32 — Exterior Improvements", code: "32"},
    { value: "utilities", label: "33 — Utilities", code: "33"},
    { value: "transportation", label: "34 — Transportation", code: "34"},
    { value: "waterways", label: "35 — Waterways and Marine Construction", code: "35"},
    
    //Process Equipment
    { value: "process", label: "40 — Process Interconnections", code: "40"},
    { value: "material", label: "41 — Material Processing and Handling Equipment", code: "41"},
    { value: "heating_equip", label: "42 — Process Heating, Cooling, and Drying Equipment", code: "42"},
    { value: "gas_water", label: "43 — Process Gas and Liquid Handling, Purification and Storage Equipment", code: "43"},
    { value: "pollution", label: "44 — Pollution Control Equipment", code: "44"},
    { value: "industry", label: "45 — Industry-Specific Manufacturing Equipment", code: "45"},
    { value: "water", label: "46 — Water and Wastewater Equipment", code: "46"},
    { value: "electric", label: "48 — Electrical Power Generation", code: "48"},
 ];

 export const SubmittalType = [
    { value: "product", label: "Product Data"},
    { value: "maintenance", label: "Maintenance Data"},
    { value: "shopdrawing", label: "Shop Drawings"},
    { value: "testreport", label: "Test Reports"},
    { value: "report", label: "Reports"},
    { value: "infomation", label: "Information"},
    { value: "mockup", label: "Mockups"},
    { value: "sample", label: "Samples"},
    { value: "qualification", label: "Qualification"},
    { value: "assurance", label: "Quality Assurance"},
    { value: "warranty", label: "Warranty"},
    { value: "general", label: "General"},
 ];

 export const FilterList = [
     { value: "hide_division", label: "Division"},
     { value: "hide_specsection", label: "Spec Section"},
     { value: "hide_submittype", label: "Submittal Type"},
     { value: "hide_subcontractor", label: "Subcontractor"},
 ];

 export const AdditionalFields = [
    {
        headerName: "Subcontractor",
        field: "subcontractor",
        filterParams : {
            filterOptions: ["equals"],
            textCustomComparator: function(filter, value, filterText) {
                //console.log(this.appliedModel.filter);
                console.log(value + "--" + filterText);
                var arry = filterText.split("_or_");
                if(arry.includes(value)) return 1;
                return 0;
            }
        }
    },
    {
        headerName: "Submitted",
        field: "submitted",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
            values: ["Yes", "No"]
        }
    },
    {
        headerName: "Received",
        field: "received",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
            values: ["Yes", "No"]
        }
    },
    {
        headerName: "Requested on Job",
        field: "reqonjob",
        cellEditor: "datePicker"
    },
    {
        headerName: "Fab Lead Time",
        field: "fabtime",
        onCellValueChanged: fieldParser,
    },
    {
        headerName: "Requested from Architect",
        field: "reqarchi",
        editable: false,
    },
    {
        headerName: "Requested from Sub",
        field: "reqsub",
        editable: false,
    },
    {
        headerName: "Recevied from Sub",
        field: "recvsub",
        cellEditor: "datePicker"
    },
    {
        headerName: "Sent to Architect",
        field: "sentarchi",
        cellEditor: "datePicker",
        onCellValueChanged: fieldParser
    },
    {
        headerName: "Due from Architect",
        field: "duearchi",
        editable: false,
    },
    {
        headerName: "Received from Architect",
        field: "rcvarchi",
        cellEditor: "datePicker"
    },
    {
        headerName: "Status",
        field: "status",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
            values: ["Approved", "Approved As Noted", "Revise And Submit", "Reviewed", "For Information Only", "Resubmitted"]
        }
    }
 ];

 function getFormattedDate(date) {
    var year = date.getFullYear();
  
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
  
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    
    return year + '-' + month + '-' + day ;
  }
 function fieldParser (params) {

    var api = params.api;
    var row = params.node;
    console.log(params);
    if( params.colDef.field === "fabtime") {
        var ret = api.getValue("reqonjob", row);

        if (ret !== undefined && ret != null && ret !== "") {
            var data = params.data;

            var reqarchi = new Date(Date.parse(ret));
            reqarchi.setDate(reqarchi.getDate() - params.newValue);
            data['reqarchi'] = getFormattedDate(reqarchi);

            var reqsub = new Date(Date.parse(reqarchi.toDateString()));
            reqsub.setDate(reqsub.getDate() - 14);
            data['reqsub'] = getFormattedDate(reqsub);
            row.setData(data);
        }
    }
    if( params.colDef.field === "sentarchi") {
        if(params.newValue != null && params.newValue != "") {
            var duearchi = new Date(Date.parse(params.newValue));
            var data = params.data;
            duearchi.setDate(duearchi.getDate() + 14 );
            data['duearchi'] = getFormattedDate(duearchi);
            row.setData(data);
        }
    }
    return Number(params.newValue);
}