// import external modules
import React, { Component, Fragment } from "react";
import { 
    Button, Row, Col, Table, Card, CardBody,
    Modal, ModalBody, ModalHeader, ModalFooter,
    Form, FormGroup, Label, Input, FormText, Badge, Alert,
 } from "reactstrap"
import DropZone from "react-dropzone"
import * as Icon from "react-feather"
import DotLoader from "react-spinners/DotLoader"

import ContentHeader from "../../components/contentHead/contentHeader";
import axios from 'axios'
import { NavLink } from "react-router-dom";
import { selectSubmittal } from "../../redux/actions/submittals/submittalAction";
import { connect } from 'react-redux'

var baseURL = "http://localhost:5000";

class SubmittalMaterials extends Component {

    validationTextWait = "Scanning PDF";
    validationTextSuccess = "There are no validation errors.";
    validationTextFailed = "Validation error.";

    state = {
        modal: false,
        current_step: 1,
        files: [],
        validation: true,
        isValid: false,
        validationText: this.validationTextWait,

        modal_title: [
            "Project Information",
            "Upload Files",
            "Validation",
            "Submittals"
        ],
        infos:  {
            dropZoneRef: null,
    
            projectName: "",
            projectNo: "",
            projectVer: "",
            projectDesc: "",
        },
        error_str: "",
        projects: [],
        list_label: {
            name: "Project",
            number: "Job Number",
            version: "Version",
            createDate: "Created Date",
            description: "Description"
        }
    }
    loadProjectList () {
        axios.get(baseURL + "/submittals")
        .then( res =>{
            if(res.status === 200 && res.data.length > 0 ){
                this.setState({"projects": res.data});
            }
            
        })
        .catch(reason => {
            //this.setState({isLoading: false});
            console.log(reason);
        });
    }
    componentDidMount() {
        this.props.selectSubmittal("", "");
        // Get JSON Data from Java Backend
        this.loadProjectList();
    }
    toggle = () => {
        if(this.state.isValid) {
            // var prj = {
            //     projectName: this.state.infos.projectName,
            //     projectNo: this.state.infos.projectNo,
            //     projectVer: this.state.infos.projectVer,
            //     projectDesc: this.state.infos.projectDesc,
            //     filename: this.state.files[0].name.replace(/\.(.)*$/g, ""),
            // }
            // this.setState({projects: [...this.state.projects, prj] });
        }
        this.setState({
            modal: !this.state.modal,
            current_step: 1,
            validation: true,
            files: [],
            isValid: false,
            validationText: this.validationTextWait,
            error_str: "",
        })
    }

    checkValidation = () => {
        let step = this.state.current_step;
        let isOK = true;
        switch (step) {
            case 1:
                if(this.state.infos.projectName.length == 0) {
                    isOK = false;
                    this.setState({error_str: "Project name is required"});
                    break
                }
                if(this.state.infos.projectNo.length == 0) {
                    isOK = false;
                    this.setState({error_str: "Job number is required."});
                    break;
                }
                if(this.state.infos.projectVer.length == 0) {
                    isOK = false;
                    this.setState({error_str: "Specificaitons version is required."});
                    break;
                }
                if(this.state.infos.projectDesc.length == 0) {
                    isOK = false;
                    this.setState({error_str: "Please input the Project Description."});
                }
                break;
            case 2:
                if(this.state.files.length == 0) {
                    isOK = false;
                }
                break;
            case 3:
                break;
            case 4:
                break;
            default:
                break;
        }

        return isOK;
    }
    onNext = () => {
        let ret = this.checkValidation();
        if(ret == false) {
            return;
        }
        if(this.state.current_step == 2) { //checking for validation
            const data = new FormData();
            data.append('file', this.state.files[0]);
            data.set('name',this.state.infos.projectName);
            data.set('version', this.state.infos.projectVer);
            data.set('number', this.state.infos.projectNo);
            data.set('description', this.state.infos.projectDesc);
            //data.append('projectName', this.state.refs.projectName.current.value);
            
            axios.post(baseURL + '/upload', data, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }})
            .then((res) => {
                if(res.status == 200) {
                    this.setState({
                        validation: false,
                        validationText: this.validationTextSuccess,
                        isValid: true,
                    });
                    this.loadProjectList();
                }
                else {
                    this.setState({
                        validation: false,
                        validationText: this.validationTextFailed
                    });
                }
            })
            .catch((reason) => {
                this.setState({
                    validation: false,
                    validationText: this.validationTextFailed
                });
            });
        }
        if(this.state.current_step == 4) { //final step, we should new add project on the project list
            
        }
        this.setState({
            current_step: this.state.current_step == 4 ? 1 :this.state.current_step + 1
        });
        
    }

    onDrop = files => {
        this.setState({
           files
        });
     };
    onChange = event => {
        //console.log(this.state.infos);
        let infos = this.state.infos;
        infos[event.target.name] = event.target.value;
        this.setState({infos: infos});
    }

    onClickLink = event => {
        var idx = event.target.rel;
        var prj = this.state.projects[idx];
        this.props.selectSubmittal(prj.name, prj.number);
    }
    convertToDate = timestamp => {
        var obj = new Date(timestamp);
        return obj.toLocaleString();
    }
    render() {
      return (
         <Fragment>
            <ContentHeader>
                <div className="title">Projects</div>
                <div className="add-project">
                    <Button size="sm" className="text-center gradient-crystal-clear mr-2 white " onClick={this.toggle} size="sm">
                        <i className="fa fa-plus" /> Add Project
                    </Button>
                </div>
                
            </ContentHeader>
            {/* <ContentSubHeader>Manage Projects</ContentSubHeader> */}
            
            <Modal isOpen={this.state.modal} toggle={this.toggle} backdrop="static" size="lg">
                <ModalHeader>Step {this.state.current_step} - {this.state.modal_title[this.state.current_step -1]}</ModalHeader>
                <ModalBody>
                    <Form className="form-horizontal">
                        <div className="step1" hidden={this.state.current_step != 1}>
                            <Alert color="warning" hidden={this.state.error_str.length == 0}>{this.state.error_str}</Alert>
                            <FormGroup row>
                                <Label sm="3">Project Name *</Label>
                                <Col sm="9">
                                    <Input name="projectName" placeholder="Project Name" required={true}
                                    onChange={this.onChange}></Input>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label sm="3">Project Number *</Label>
                                <Col sm="9">
                                    <Input name="projectNo" placeholder="Project Number" required={true}
                                    onChange={this.onChange}></Input>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label sm="3">Version *</Label>
                                <Col sm="9">
                                    <Input name="projectVer" placeholder="Version Number" required={true}
                                    onChange={this.onChange}></Input>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label sm="3">Description *</Label>
                                <Col sm="9">
                                    <Input sm="9" name="projectDesc" type="textarea" 
                                    placeholder="Description" required={true}
                                    onChange={this.onChange}></Input>
                                </Col>
                            </FormGroup>
                        </div>
                        <div className="step2" size="sm" hidden={this.state.current_step != 2}>
                            <FormText>Upload project specs.</FormText>
                            <Row>
                                <Col sm={6}>
                                    <FormGroup>
                                        <DropZone
                                        multiple={false} 
                                        onDrop={this.onDrop} 
                                        onBlur={this.onLoad}
                                        required={true}
                                        ref={node => {this.state.infos.dropZoneRef = node}}
                                        >
                                            <FormText style={{marginTop: "80px", textAlign: "center"}}> 
                                            Drag & Drop<br/>
                                                <Icon.UploadCloud ></Icon.UploadCloud>
                                            </FormText>
                                            
                                        </DropZone>
                                        <br/>
                                        <Button color="primary" size="sm" style={{textAlign: "center"}}
                                        onClick={()=>{this.state.infos.dropZoneRef.open()}}
                                        >Browse...</Button>
                                    </FormGroup>
                                </Col>
                                <Col sm={6}>
                                    { this.state.files.map( (f, i) => {
                                    return <p key={i}> {f.name} - {(f.size - (f.size % 1024))/1024}KB </p>})
                                    }
                                </Col>
                            </Row>
                            
                            
                        </div>
                        <div className="step3" hidden={this.state.current_step != 3}>
                            <Row style={{textAlign: "center"}}>
                                <Col>
                                    <FormText style={{paddingTop: "20px", marginBottom: "125px"}}>
                                        {this.state.validationText}
                                    </FormText>
                                    <br/>
                                    
                                    <div className='sweet-loading'>
                                        <DotLoader
                                            className="clip-loader"
                                            sizeUnit={"px"}
                                            size={80}
                                            color={'#009DA0'}
                                            loading={this.state.validation}
                                        />
                                    </div> 
                                </Col>
                                
                            </Row> 
                        </div>
                        <div className="step4" hidden={this.state.current_step != 4}>
                            <FormText className="font-medium-3">
                                <Icon.Info className="info" size={32}></Icon.Info>Completed.
                            </FormText>
                        </div>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.onNext} className="text-center gradient-crystal-clear mr-2 white" id="next_btn"
                    
                    hidden={this.state.current_step == 4}
                    >
                        <Icon.ArrowRightCircle size={24}/>  Next
                    </Button>
                    <Button onClick={this.toggle} className="text-center gradient-crystal-clear mr-2 white">
                    Close  <Icon.XCircle/>
                    </Button>
                </ModalFooter>
            </Modal>
            
            <Card >
                <CardBody>
                <Table striped responsive>
                <thead>
                    <tr>
                        <td>{this.state.list_label.name}</td>
                        <td>{this.state.list_label.number}</td>
                        <td>{this.state.list_label.version}</td>
                        <td>{this.state.list_label.createDate}</td>
                        <td>{this.state.list_label.description}</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                
                {this.state.projects.map((prj, i) => {
                    return (
                        <tr key={i}>
                            <td>
                                <NavLink to={"/project/" + prj.submittalId} rel={i} onClick={this.onClickLink}>
                                    {prj.name}
                                </NavLink>
                            </td>
                            <td>
                                {prj.number}
                            </td>
                            <td>
                                <Badge color="info" size="sm" className="text-center gradient-crystal-clear mr-2 white " pill={true}>
                                    {prj.version}
                                </Badge>
                            </td>
                            <td>
                                {this.convertToDate(prj.createDate)}
                            </td>
                            <td>
                                {prj.description}
                            </td>
                        </tr>
                    )
                })}
                </tbody>
                </Table>
                </CardBody>
            </Card>
         </Fragment>
         
      );
   }
}


const mapStateToProps = state => ({
    
})
  
const mapDispatchToProps = dispatch => ({
    selectSubmittal: (name, number) => dispatch(selectSubmittal(name, number)),
})
  
export default connect(
    null,
    mapDispatchToProps
)(SubmittalMaterials)
// export default SubmittalMaterials;
