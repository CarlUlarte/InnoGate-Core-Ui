import React, { useState, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { CCard, CCardBody, CCardHeader, CButton, CSpinner } from '@coreui/react'
import { Maximize, Minimize } from 'lucide-react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db, auth, storage } from 'src/backend/firebase'
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import CustomToast from 'src/components/Toast/CustomToast'

const UploadManuscript = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploaded, setUploaded] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [currentUserData, setCurrentUserData] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const previewRef = useRef(null)

  // Fetch current user's data and restore preview on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error('No user is signed in');
          setToast({
            color: 'danger',
            message: 'Please sign in to upload manuscripts.',
          });
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (!userDoc.exists()) {
          console.error('User document not found');
          setToast({
            color: 'danger',
            message: 'User profile not found.',
          });
          return;
        }

        const userData = userDoc.data();
        console.log('User Data:', userData);
        
        if (!userData.groupID) {
          console.error('User has no groupID');
          setToast({
            color: 'warning',
            message: 'You need to be assigned to a group before uploading.',
          });
          return;
        }

        setCurrentUserData(userData);
        
        // Restore preview if file exists in userData
        if (userData.fileContainer && userData.fileContainer.file) {
          setUploaded(true);
          setPreview(userData.fileContainer.file);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setToast({
          color: 'danger',
          message: `Error fetching user data: ${error.message}`,
        });
      }
    };
    
    fetchUserData();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'], // Only accept PDF files
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const selectedFile = acceptedFiles[0];
      if (selectedFile && selectedFile.type === 'application/pdf') {
        console.log('File selected:', selectedFile);
        setFile(selectedFile);
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);
      } else {
        setToast({
          color: 'warning',
          message: 'Only PDF files are allowed.',
        });
      }
    },
  });

  // Function to update file container for all group members
  const updateGroupMembersFileContainers = async (fileUrl) => {
    try {
      if (!currentUserData?.groupID) {
        throw new Error('No group ID found');
      }

      console.log('Updating group members for groupID:', currentUserData.groupID);
      
      const usersQuery = query(
        collection(db, 'users'),
        where('groupID', '==', currentUserData.groupID)
      );
      
      const groupMembers = await getDocs(usersQuery);
      
      if (groupMembers.empty) {
        console.log('No group members found');
        return;
      }

      const updatePromises = groupMembers.docs.map(async (userDoc) => {
        console.log('Updating user:', userDoc.id);
        return updateDoc(doc(db, 'users', userDoc.id), {
          fileContainer: {
            file: fileUrl,
            uploadedAt: new Date().toISOString(),
            fileName: file.name
          }
        });
      });
      
      await Promise.all(updatePromises);
      console.log('All group members updated successfully');
      
    } catch (error) {
      console.error('Error updating group members:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setToast({
        color: 'warning',
        message: 'Please select a file first.',
      });
      return;
    }

    if (!currentUserData?.groupID) {
      setToast({
        color: 'warning',
        message: 'You must be assigned to a group before uploading.',
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Starting upload process...');
      
      const storageRef = ref(
        storage,
        `manuscripts/${currentUserData.groupID}/${Date.now()}_${file.name}`
      );

      console.log('Storage reference created:', storageRef);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          console.log('Upload progress:', progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setToast({
            color: 'danger',
            message: `Upload failed: ${error.message}`,
          });
          setLoading(false);
        },
        async () => {
          try {
            console.log('Upload completed, getting download URL...');
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Download URL obtained:', downloadURL);
            
            await updateGroupMembersFileContainers(downloadURL);
            
            setUploaded(true);
            setShowFeedback(true);
            setToast({
              color: 'success',
              message: 'Manuscript uploaded successfully!',
            });
          } catch (error) {
            console.error('Error in upload completion:', error);
            setToast({
              color: 'danger',
              message: `Error completing upload: ${error.message}`,
            });
          } finally {
            setLoading(false);
            setUploadProgress(0);
          }
        }
      );
    } catch (error) {
      console.error('Error initiating upload:', error);
      setToast({
        color: 'danger',
        message: `Error initiating upload: ${error.message}`,
      });
      setLoading(false);
    }
  };

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

              <p className="file-type-info">Accepted File Type: PDF only</p>

              <CButton 
                color="primary" 
                onClick={handleSubmit} 
                disabled={!file || loading}
              >
                {loading ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Uploading ({uploadProgress.toFixed(0)}%)
                  </>
                ) : (
                  'Upload'
                )}
              </CButton>
            </div>
          ) : (
            <div className="uploaded-section text-center">
              <img
                src="src/assets/images/uploaded.png"
                alt="Uploaded document"
                style={{ width: '80px', marginBottom: '10px' }}
              />
              <p>File uploaded: {file?.name || currentUserData?.fileContainer?.fileName}</p>
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

      <CustomToast toast={toast} setToast={setToast} />
    </div>
  )
}

export default UploadManuscript