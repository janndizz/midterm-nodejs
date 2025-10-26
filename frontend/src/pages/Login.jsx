import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Alert, InputGroup } from "react-bootstrap";
import { FaUser, FaLock } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/users/login", formData);
      localStorage.setItem("token", res.data.token);
      navigate("/"); // chuyển về trang chủ
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="bg-secondary vh-100">
      <Container className="pt-5">
        <h3 className="text-center text-light mb-4">User Login</h3>
        <Row className="justify-content-center">
          <Col md={10} lg={8} xl={5}>
            <div className="border p-4 rounded bg-light">
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaUser /></InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaLock /></InputGroup.Text>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Button type="submit" variant="success" className="px-5">Login</Button>
              </Form>

              <p className="mt-3">
                Don’t have an account?{" "}
                <a href="/register">Register now!</a>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
