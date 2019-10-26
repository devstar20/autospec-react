// import external modules
import React, { Component } from "react";
import { NavLink, Redirect } from "react-router-dom";
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

class Login extends Component {
   state = {
      isChecked: true,
      infos: {
         userEmail: "",
         userPassword: "",
      },
      error: "",
      redirect: false,
   };
   handleChecked = e => {
      this.setState(prevState => ({
         isChecked: !prevState.isChecked
      }));
   };

   onChange = (event) => {
      if( event.target.value == "") return;
      let infos = this.state.infos;
      infos[event.target.name] = event.target.value;
      this.setState({infos: infos});
   }
   onLogin = () => {
      let infos = this.state.infos;
      if(infos.userEmail.length === 0) {
         this.setState({error: "Please input your email."});
         return;
      }
      if(infos.userPassword.length === 0) {
         this.setState({error: "Please type your password."});
         return;
      }

      axios.post(baseURL+"/login", infos)
      .then((res) => {
         if(res.status === 200) {
            if(res.data.result === "success")
               this.setState({redirect: true});
            else {
               this.setState({error: "Email or Password doesn't match."});
            } 
         }
      })
   }
   redirect = () => {
      if(this.state.redirect === true) {
         return <Redirect to="/projects"/>
      }
   }
   render() {
      return (
                  
         <div className="container">
            {this.redirect()}
            <Row className="full-height-vh">
               <Col xs="12" className="d-flex align-items-center justify-content-center">
                  <Card className="gradient-purple-bliss text-center width-400">
                     <CardBody>
                        <h2 className="white py-4">Vertical | NSC</h2>
                        <Form className="pt-2">
                           <div>
                              <Alert color="warning" hidden={this.state.error.length == 0}>{this.state.error}</Alert>
                           </div>

                           <FormGroup>
                              <Col md="12">
                                 <Input
                                    type="email"
                                    className="form-control"
                                    name="userEmail"
                                    id="userEmail"
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
                                    id="userPassword"
                                    placeholder="Password"
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
                                          unchecked={this.state.isChecked}
                                          onChange={this.handleChecked}
                                          id="rememberme"
                                       />
                                       <Label className="custom-control-label float-left orange" for="rememberme">
                                          Remember Me
                                       </Label>
                                    </div>
                                 </Col>
                              </Row>
                           </FormGroup>
                           <FormGroup>
                              <Col md="12">
                                 <Button type="button" color="primary" block className="gradient-blue-grey-blue-grey" onClick={this.onLogin}>
                                    Login
                                 </Button>
                                 <Button type="button" color="secondary" block className="gradient-blue-grey-blue-grey">
                                    Forgot Password
                                 </Button>
                              </Col>
                           </FormGroup>
                        </Form>
                     </CardBody>
                     <CardFooter>
                        <div className="float-left">
                           <NavLink to="/pages/forgot-password" className="text-white">
                              © 2019 Vertical v1.0
                           </NavLink>
                        </div>
                        <div className="float-right">
                           <NavLink to="/register" className="text-white">
                              Register
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

export default Login;