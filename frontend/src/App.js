import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Button } from "react-bootstrap";

function App() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/posts").then(res => setPosts(res.data));
  }, []);

  return (
    <Container className="mt-4">
      <h1>📰 My Blog</h1>
      {posts.map(p => (
        <Card key={p._id} className="mt-3">
          <Card.Body>
            <Card.Title>{p.title}</Card.Title>
            <Card.Text>{p.content}</Card.Text>
          </Card.Body>
        </Card>
      ))}
      <Button
        onClick={() =>
          axios
            .post("http://localhost:5000/api/posts", {
              title: "New Post",
              content: "This is a sample post.",
            })
            .then(() => window.location.reload())
        }
      >
        Add Post
      </Button>
    </Container>
  );
}

export default App;
