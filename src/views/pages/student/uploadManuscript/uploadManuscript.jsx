import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { CCard, CCardBody, CCardHeader, CButton } from '@coreui/react'

const uploadManuscript = () => {
  const [file, setFile] = useState(null)
  const [uploaded, setUploaded] = useState(false) // State to track upload status
  const [showFeedback, setShowFeedback] = useState(false) // State to toggle showing feedback

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: '.doc, .docx, .pdf',
    multiple: false,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0])
    },
  })

  const handleFileSelect = (e) => {
    setFile(e.target.files[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (file) {
      console.log('Uploading:', file)
      // Simulate upload completion by setting "uploaded" to true
      setUploaded(true)
      setShowFeedback(true) // Show the feedback card after upload
    }
  }

  const handleEdit = () => {
    setUploaded(false) // Allow user to upload a new file
    setShowFeedback(false) // Hide feedback card when editing
    setFile(null) // Reset the file
  }

  return (
    <div>
      <CCard className="mb-2">
        <CCardHeader>Attach Documents</CCardHeader>
        <CCardBody>
          {!uploaded ? (
            <div>
              <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p className="d-flex align-items-center justify-content-center flex-column">
                    <img
                      src="src/assets/images/upload.png"
                      alt="upload"
                      style={{ width: '80px', marginBottom: '10px' }}
                    />
                    Drag and Drop here <br /> or <br />
                    <span style={{ color: 'blue', cursor: 'pointer' }}>Browse files</span>
                  </p>
                ) : (
                  <p className="d-flex align-items-center justify-content-center flex-column">
                    <img
                      src="src/assets/images/upload.png"
                      alt="upload"
                      style={{ width: '80px', marginBottom: '10px' }}
                    />
                    Drag and Drop here <br /> or <br />
                    <span style={{ color: 'blue', cursor: 'pointer' }}>Browse files</span>
                  </p>
                )}
              </div>

              {file && (
                <div className="file-info">
                  <p>Selected File: {file.name}</p>
                </div>
              )}

              <p className="file-type-info">Accepted File Types: pdf, .doc, and .docx only</p>

              <CButton color="primary" onClick={handleSubmit}>
                Upload
              </CButton>
            </div>
          ) : (
            <div className="uploaded-section text-center">
              <img
                src="src/assets/images/uploaded.png"
                alt="Uploaded document"
                style={{ width: '80px', marginBottom: '10px' }}
              />
              <p>File uploaded: {file.name}</p>
              <div className="action-buttons">
                <CButton color="warning" onClick={handleEdit}>
                  Edit
                </CButton>
              </div>
            </div>
          )}
        </CCardBody>
      </CCard>

      {showFeedback && (
        <CCard>
          <CCardHeader>Adviser Feedback</CCardHeader>
          <CCardBody>
            <p>Adviser feedback goes here...</p>
          </CCardBody>
        </CCard>
      )}
    </div>
  )
}

export default uploadManuscript
