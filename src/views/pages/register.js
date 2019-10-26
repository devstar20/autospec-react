// import external modules
import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import {
   Row,
   Col,
   Input,
   Form,
   FormGroup,
   Button,
   Label,
   Card,   
   CardBody,
   CardFooter,
   Alert,
} from "reactstrap";
import axios from 'axios'
var baseURL = "http://localhost:5000";

class Register extends Component {
   state = {
      isChecked: true,
      infos: {
         userName: "",
         userEmail: "",
         userPassword: "",
         userPasswordConfirm: "",
      },
      error: "",
   };
   handleChecked = e => {
      this.setState(prevState => ({
         isChecked: !prevState.isChecked
      }));
   }
   onChange = event => {
      //console.log(this.state.infos);
      if( event.target.value == "") return;
      let infos = this.state.infos;
      infos[event.target.name] = event.target.value;
      this.setState({infos: infos});
   }
   checkValidation = async (infos) => {
      
      if(infos.userName == "") {
         this.setState({error: "Please input Your Name."});
         return false;
      }
      if(infos.userEmail == "") {
         this.setState({error: "Please input Your Email."});
         return false;
      }
      if(infos.userPassword == "") {
         this.setState({error: "Please input Your Password."});
         return false;
      }
      if(infos.userPassword != infos.userPasswordConfirm) {
         this.setState({error: "Password doesn't match."});
         return false;
      }
      if(infos.userPassword.length < 8) {
         this.setState({error: "Password length should be at least 8 characters."});
         return false;
      }
      if(this.state.isChecked === false) {
         this.setState({error: "Please accept the Terms and Conditions."});
         return false;
      }
      let ret = false;
      await axios.get(baseURL + "/idCheck", {
         params: {
            id: infos.userEmail,
         }
      }).then((res) => {
         if(res.status === 200) {
            if(res.data.result == "success") {
               ret = true;
            }
            else {
               this.setState({error: "This Email exists already."});
            }
         }
      });
      return ret;
   }
   onSubmit = async (e) => {
      e.preventDefault();
      let infos = this.state.infos;
      let valid = await this.checkValidation(infos);

      if( valid == false) {
         return;
      }
      axios.post( baseURL + "/register",
         infos
      ).then((res) => {
         if(res.status === 200) {
            if(res.data.result =="success") {
               alert("Register success");
            }
         }
      });
   }

   render() {
      return (
         <div className="container">
            <Row className="full-height-vh">
               <Col xs="12" className="d-flex align-items-center justify-content-center">
                  <Card className="gradient-purple-bliss text-center width-400">
                     <CardBody>
                        <h2 className="white py-4">REGISTER</h2>
                        <Form className="pt-2" >
                           <div>
                              <Alert color="warning" hidden={this.state.error.length == 0}>{this.state.error}</Alert>
                           </div>
                           
                           
                           <FormGroup>
                              <Col md="12">
                                 <Input
                                    type="text"
                                    className="form-control"
                                    name="userName"
                                    id="inputName"
                                    placeholder="Name"
                                    required
                                    onChange={this.onChange}
                                 />
                              </Col>
                           </FormGroup>
                           <FormGroup>
                              <Col md="12">
                                 <Input
                                    type="email"
                                    className="form-control"
                                    name="userEmail"
                                    id="inputEmail"
                                    placeholder="Email"
                                    required
                                    onChange={this.onChange}
                                 />
                              </Col>
                           </FormGroup>

                           <FormGroup>
                              <Col md="12">
                                 <Input
                                    type="password"
                                    className="form-control"
                                    name="userPassword"
                                    id="inputPass"
                                    placeholder="Password"
                                    required
                                    onChange={this.onChange}
                                 />
                              </Col>
                           </FormGroup>
                           <FormGroup>
                              <Col md="12">
                                 <Input
                                    type="password"
                                    className="form-control"
                                    name="userPasswordConfirm"
                                    id="inputPass"
                                    placeholder="Confirm Password"
                                    required
                                    onChange={this.onChange}
                                 />
                              </Col>
                           </FormGroup>

                           <FormGroup>
                              <Row>
                                 <Col md="12">
                                    <div className="custom-control custom-checkbox mb-2 mr-sm-2 mb-sm-0 ml-3">
                                       <Input
                                          type="checkbox"
                                          className="custom-control-input"
                                          checked={this.state.isChecked}
                                          onChange={this.handleChecked}
                                          id="rememberme"
                                       />
                                       <Label className="custom-control-label float-left orange" for="rememberme">
                                          I agree terms and conditions.
                                       </Label>
                                    </div>
                                 </Col>
                              </Row>
                           </FormGroup>
                           <FormGroup>
                              <Col md="12">
                                 <Button type="button" color="primary" block className="gradient-blue-grey-blue-grey" onClick={this.onSubmit}>
                                    Submit
                                 </Button>
                                 <Button type="button" color="primary" block className="gradient-blue-grey-blue-grey">
                                    Cancel
                                 </Button>
                              </Col>
                           </FormGroup>
                        </Form>
                     </CardBody>
                     <CardFooter>
                        <div className="float-left">
                           <NavLink to="/pages/forgot-password" className="text-white">
                              Forgot Password?
                           </NavLink>
                        </div>
                        <div className="float-right">
                           <NavLink to="/" className="text-white">
                              Login
                           </NavLink>
                        </div>
                     </CardFooter>
                  </Card>
               </Col>
            </Row>
         </div>
      );
   }
}

export default Register;
