import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Button, Form } from "react-bootstrap";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });

  // Lấy tất cả posts khi trang load
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const handleAddPost = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/posts", newPost);
      setNewPost({ title: "", content: "" });
      fetchPosts(); // load lại danh sách sau khi thêm
    } catch (err) {
      console.error("Error adding post:", err);
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4 text-success">📰 My Blog</h1>

      {/* Form thêm bài viết */}
      <Form onSubmit={handleAddPost} className="mb-4">
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Content</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter content"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Add Post
        </Button>
      </Form>

      {/* Danh sách bài viết */}
      {posts.length === 0 ? (
        <p>No posts yet.</p>
        ) : (
        posts.map((p) => (
          <Card key={p._id} className="mt-3 shadow-sm">
            <Card.Body>
              <Card.Title>{p.title}</Card.Title>
              <Card.Text>{p.content}</Card.Text>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default Home;
