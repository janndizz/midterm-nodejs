import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Tabs,
  Tab,
  Card,
  Spinner,
  Button,
  Row,
  Col,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// Import icons từ react-icons
import { FaNewspaper, FaSignOutAlt, FaSignInAlt, FaUser, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { MdManageAccounts } from "react-icons/md";
import MediaUpload from "./MediaUpload";
import PostMedia from "./PostMedia";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState("blogs");
  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [editingPost, setEditingPost] = useState(null);
  const navigate = useNavigate();

  const checkProcessingStatus = async (postId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/posts/${postId}/status`);
      return res.data;
    } catch (err) {
      console.error('Error checking status:', err);
      return null;
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const postsWithProcessing = posts.filter(post => 
        post.media && post.media.some(m => m.status !== 'processed')
      );

      if (postsWithProcessing.length > 0) {
        // Refresh posts
        await fetchPosts();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [posts]);

  useEffect(() => {
    fetchPosts();
    fetchUserProfile();
  }, []);
  

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts");
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPosts(sorted);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const userRes = await axios.get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userRes.data);

      const myPostsRes = await axios.get("http://localhost:5000/api/posts/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyPosts(myPostsRes.data);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const [mediaFiles, setMediaFiles] = useState([]);

  const handleAddPost = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to login first!");
      return;
    }

    // Validate inputs
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("Title and content are required!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newPost.title.trim());
      formData.append('content', newPost.content.trim());
      formData.append('tags', newPost.tags || '');
      
      // Add media files
      console.log('Uploading files:', mediaFiles.length);
      mediaFiles.forEach((file, index) => {
        console.log(`File ${index}:`, file.name, file.type, file.size);
        formData.append('media', file);
      });

      const res = await axios.post("http://localhost:5000/api/posts", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60 second timeout for large files
      });
      
      console.log('Post created:', res.data);
      
      // Update posts list
      setMyPosts([res.data, ...myPosts]);
      setPosts([res.data, ...posts]); // Also update all posts
      
      // Reset form
      setNewPost({ title: "", content: "", tags: "" });
      setMediaFiles([]);
      
      alert("Post created successfully!");
    } catch (err) {
      console.error("Error adding post:", err);
      
      if (err.response) {
        // Server responded with error
        alert(`Error: ${err.response.data.message || 'Failed to create post'}`);
        console.error('Server error:', err.response.data);
      } else if (err.request) {
        // Request made but no response
        alert("No response from server. Please check your connection.");
        console.error('No response:', err.request);
      } else {
        // Error setting up request
        alert(`Error: ${err.message}`);
        console.error('Request error:', err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You need to login first!");

    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId: user._id }, 
      });

      setMyPosts(myPosts.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setNewPost({ title: post.title, content: post.content });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("You need to login first!");

    try {
      const res = await axios.put(
        `http://localhost:5000/api/posts/${editingPost._id}`,
        {
          ...newPost,
          userId: user._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMyPosts(myPosts.map((p) => (p._id === editingPost._id ? res.data : p)));
      setEditingPost(null);
      setNewPost({ title: "", content: "" });
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  return (
    <Container className="mt-4">
      {/* --- Header --- */}
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="text-success fw-bold d-flex align-items-center gap-2">
            <FaNewspaper /> Our Blog
          </h1>
        </Col>

        <Col className="text-end">
          {user ? (
            <div className="d-flex flex-column align-items-end">
              <div className="d-flex align-items-center mb-1">
                <span className="me-2 text-muted">
                  Hello, <strong>{user.username}</strong>
                </span>
              </div>
              <Button
                variant="outline-danger"
                className="px-4 py-1 rounded-pill shadow-sm d-flex align-items-center gap-2"
                onClick={handleLogout}
              >
                <FaSignOutAlt /> Logout
              </Button>
            </div>
          ) : (
            <div className="d-flex flex-column align-items-end">
              <span className="text-muted mb-1">You are not logged in</span>
              <Button
                variant="success"
                className="px-4 py-1 rounded-pill shadow-sm d-flex align-items-center gap-2"
                onClick={() => navigate("/login")}
              >
                <FaSignInAlt /> Login now
              </Button>
            </div>
          )}
        </Col>
      </Row>

      {/* --- Tabs --- */}
      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3" justify>
        {/* TAB 1: All Blogs */}
        <Tab
          eventKey="blogs"
          title={
            <span className="d-flex align-items-center gap-1">
              <FaNewspaper /> All Blogs
            </span>
          }
        >
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p>Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            posts.map((p) => (
              <Card key={p._id} className="mb-3 shadow-sm">
                <Card.Body>
                  <Card.Title>{p.title}</Card.Title>
                  <Card.Subtitle className="text-muted mb-2">
                    by {p.author?.username || "Unknown"} •{" "}
                    {new Date(p.createdAt).toLocaleString()}
                    {p.tags && p.tags.length > 0 && (
                      <span className="ms-2">
                        {p.tags.map(tag => (
                          <span key={tag} className="badge bg-secondary me-1">#{tag}</span>
                        ))}
                      </span>
                    )}
                  </Card.Subtitle>
                  <Card.Text>{p.content}</Card.Text>
                  
                  {/* Hiển thị media */}
                  <PostMedia media={p.media} />
                </Card.Body>
              </Card>
            ))
          )}
        </Tab>

        {/* TAB 2: My Profile */}
        <Tab
          eventKey="profile"
          title={
            <span className="d-flex align-items-center gap-1">
              <FaUser /> My Profile
            </span>
          }
        >
          {!user ? (
            <div className="text-center mt-5">
              <h4>You need to login to view your profile.</h4>
              <Button variant="primary" onClick={() => navigate("/login")}>
                <FaSignInAlt /> Login now
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              {/* Thông tin người dùng */}
              <Card className="p-3 mb-4">
                <h4 className="d-flex align-items-center gap-2">
                  <MdManageAccounts /> Account Info
                </h4>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Password:</strong> ********</p>
                <Form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const token = localStorage.getItem("token");
                    if (!token) return alert("You need to login first!");

                    try {
                      await axios.put(
                        "http://localhost:5000/api/users/change-password",
                        { oldPassword, newPassword },
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      alert("Password changed successfully!");
                      setOldPassword("");
                      setNewPassword("");
                    } catch (err) {
                      alert(err.response?.data?.message || "Error changing password");
                    }
                  }}
                >
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="password"
                      placeholder="Current password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </Form.Group>
                  <Button variant="warning" type="submit">
                    Change Password
                  </Button>
                </Form>

              </Card>

              {/* Form thêm / sửa bài viết */}
              <Card className="p-3 mb-4">
                <h5 className="d-flex align-items-center gap-2">
                  {editingPost ? <FaEdit /> : <FaPlus />}{" "}
                  {editingPost ? "Edit Post" : "Add New Post"}
                </h5>
                <Form onSubmit={editingPost ? handleUpdate : handleAddPost}>
                <Form.Control
                  placeholder="Title"
                  className="mb-2"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Content"
                  className="mb-2"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
                <Form.Control
                  placeholder="Tags (comma separated)"
                  className="mb-2"
                  value={newPost.tags || ''}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                />
                
                <MediaUpload onFilesChange={setMediaFiles} />
                
                <Button type="submit" variant="primary">Add Post</Button>
              </Form>
              </Card>

              {/* List posts of user */}
              <h5 className="d-flex align-items-center gap-2">
                <FaNewspaper /> My Posts
              </h5>
              {myPosts.length === 0 ? (
                <p>No posts yet.</p>
              ) : (
                myPosts.map((p) => (
                  <Card key={p._id} className="mb-3 shadow-sm">
                    <Card.Body>
                      <Card.Title>{p.title}</Card.Title>
                      <Card.Subtitle className="text-muted mb-2">
                        {new Date(p.createdAt).toLocaleString()}
                        {p.tags && p.tags.length > 0 && (
                          <span className="ms-2">
                            {p.tags.map(tag => (
                              <span key={tag} className="badge bg-secondary me-1">#{tag}</span>
                            ))}
                          </span>
                        )}
                      </Card.Subtitle>
                      <Card.Text>{p.content}</Card.Text>
                      
                      {/* Hiển thị media */}
                      <PostMedia media={p.media} />

                      <div className="d-flex gap-2 mt-3">
                        <Button
                          variant="warning"
                          size="sm"
                          className="d-flex align-items-center gap-1"
                          onClick={() => handleEdit(p)}
                        >
                          <FaEdit /> Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="d-flex align-items-center gap-1"
                          onClick={() => handleDelete(p._id)}
                        >
                          <FaTrash /> Delete
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              )}
            </div>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Home;
