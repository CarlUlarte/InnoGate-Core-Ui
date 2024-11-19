import React, { useState, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { CCard, CCardBody, CCardHeader, CButton } from '@coreui/react'
import { Maximize, Minimize } from 'lucide-react'
import CIcon from '@coreui/icons-react'
import { cilDataTransferUp, cilCheckCircle } from '@coreui/icons'

const UploadManuscript = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploaded, setUploaded] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const previewRef = useRef(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0])
    },
  })

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (file) {
      console.log('Uploading:', file)
      setUploaded(true)
      setShowFeedback(true)
    }
  }

  const handleEdit = () => {
    setUploaded(false)
    setShowFeedback(false)
    setFile(null)
    setPreview(null)
  }

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      previewRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullScreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange)
  }, [])

  const renderPreview = () => {
    if (!preview) return null

    if (file.type === 'application/pdf') {
      return (
        <div className="position-relative">
          <iframe
            ref={previewRef}
            src={preview}
            title="PDF Preview"
            width="100%"
            height="500px"
            className="mb-3"
          />
          <CButton
            color="secondary"
            size="sm"
            className="position-absolute top-0 end-0 m-2"
            onClick={toggleFullScreen}
          >
            {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </CButton>
        </div>
      )
    } else {
      return (
        <div className="mb-3 p-3 border rounded">
          <p>Preview not available for {file.type} files.</p>
          <p>Filename: {file.name}</p>
          <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )
    }
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
                    <CIcon icon={cilDataTransferUp} size="3xl" />
                    Drag and Drop here <br /> or <br />
                    <span style={{ color: 'blue', cursor: 'pointer' }}>Browse files</span>
                  </p>
                ) : (
                  <p className="d-flex align-items-center justify-content-center flex-column">
                    <CIcon icon={cilDataTransferUp} size="3xl" />
                    Drag and Drop here <br /> or <br />
                    <span style={{ color: 'blue', cursor: 'pointer' }}>Browse files</span>
                  </p>
                )}
              </div>

              {file && (
                <div className="file-info mt-3">
                  <p>Selected File: {file.name}</p>
                  {renderPreview()}
                </div>
              )}

              <p className="file-type-info">Accepted File Types: pdf, .doc, and .docx only</p>

              <CButton color="primary" onClick={handleSubmit} disabled={!file}>
                Upload
              </CButton>
            </div>
          ) : (
            <div className="uploaded-section text-center">
              <CIcon icon={cilCheckCircle} size="3xl" />
              <p>File uploaded: {file.name}</p>
              {renderPreview()}
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

export default UploadManuscript
