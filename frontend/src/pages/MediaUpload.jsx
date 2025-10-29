import React, { useState } from 'react';
import { Form, Button, Alert, ProgressBar, Card, Row, Col } from 'react-bootstrap';
import { FaUpload, FaTrash, FaImage, FaVideo } from 'react-icons/fa';

const MediaUpload = ({ onFilesChange, maxFiles = 5 }) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles = selectedFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB
      
      return (isImage || isVideo) && isValidSize;
    });

    if (validFiles.length !== selectedFiles.length) {
      setError('Some files were rejected. Only images and videos under 100MB are allowed.');
    }

    const newFiles = [...files, ...validFiles];
    setFiles(newFiles);
    onFilesChange(newFiles);

    // Create previews
    const newPreviews = [...previews];
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push({
            type: 'image',
            src: e.target.result,
            name: file.name,
            size: file.size
          });
          setPreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        newPreviews.push({
          type: 'video',
          src: URL.createObjectURL(file),
          name: file.name,
          size: file.size
        });
        setPreviews([...newPreviews]);
      }
    });

    setError('');
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="media-upload">
      <Form.Group className="mb-3">
        <Form.Label>Upload Media (Images/Videos)</Form.Label>
        <Form.Control
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          disabled={files.length >= maxFiles}
        />
        <Form.Text className="text-muted">
          Max {maxFiles} files, up to 100MB each. Supported: JPG, PNG, GIF, MP4, AVI, MOV
        </Form.Text>
      </Form.Group>

      {error && <Alert variant="danger">{error}</Alert>}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} className="mb-3" />
      )}

      {previews.length > 0 && (
        <Row>
          {previews.map((preview, index) => (
            <Col md={4} key={index} className="mb-3">
              <Card>
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                  {preview.type === 'image' ? (
                    <img
                      src={preview.src}
                      alt={preview.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <video
                      src={preview.src}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      controls
                    />
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    style={{ position: 'absolute', top: '5px', right: '5px' }}
                    onClick={() => removeFile(index)}
                  >
                    <FaTrash />
                  </Button>
                </div>
                <Card.Body className="p-2">
                  <div className="d-flex align-items-center">
                    {preview.type === 'image' ? <FaImage className="me-2" /> : <FaVideo className="me-2" />}
                    <div>
                      <div className="small text-truncate" style={{ maxWidth: '150px' }}>
                        {preview.name}
                      </div>
                      <div className="text-muted small">{formatFileSize(preview.size)}</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default MediaUpload;