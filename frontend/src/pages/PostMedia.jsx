import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FaPlay } from 'react-icons/fa';

const PostMedia = ({ media }) => {
  if (!media || media.length === 0) return null;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Row className="mt-3">
      {media.map((item, index) => (
        <Col md={media.length === 1 ? 12 : 6} key={index} className="mb-3">
          <Card>
            {item.type === 'image' ? (
              item.status === 'processed' ? (
                <Card.Img
                  variant="top"
                  src={`http://localhost:5000/api/posts/media/images/${item.filename}`}
                  alt={item.originalName}
                  style={{ height: '300px', objectFit: 'cover' }}
                  onError={(e) => {
                    console.error('Image load error:', e.target.src);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div 
                  style={{ 
                    height: '300px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #dee2e6'
                  }}
                >
                  <div className="text-center">
                    <div className="spinner-border text-primary mb-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="text-muted">
                      {item.status === 'uploading' ? 'Uploading...' : 
                       item.status === 'processing' ? 'Processing...' : 
                       item.status === 'failed' ? 'Processing failed' : 'Processing...'}
                    </div>
                  </div>
                </div>
              )
            ) : (
              // Video processing logic tương tự
              item.status === 'processed' ? (
                <div style={{ position: 'relative' }}>
                  <video
                    controls
                    style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                    poster={`http://localhost:5000/api/posts/media/thumbnails/${item.thumbnail}`}
                  >
                    <source
                      src={`http://localhost:5000/api/posts/media/videos/${item.filename}`}
                      type={item.mimeType}
                    />
                  </video>
                  {item.duration && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '12px'
                      }}
                    >
                      {formatDuration(item.duration)}
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  style={{ 
                    height: '300px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #dee2e6'
                  }}
                >
                  <div className="text-center">
                    <div className="spinner-border text-primary mb-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="text-muted">Processing video...</div>
                  </div>
                </div>
              )
            )}
            <Card.Body className="p-2">
              <small className="text-muted">
                {item.originalName}
                {item.status !== 'processed' && (
                  <span className={`badge ms-2 ${
                    item.status === 'processing' ? 'bg-warning' :
                    item.status === 'failed' ? 'bg-danger' : 'bg-info'
                  }`}>
                    {item.status}
                  </span>
                )}
              </small>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default PostMedia;