import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CForm,
  CFormInput,
  CImage,
  CFormLabel,
  CRow,
  CCol,
  CSpinner,
} from '@coreui/react'
import { updateDoc, doc, getDoc } from 'firebase/firestore'
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { db, auth, storage } from 'src/backend/firebase'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

const defaultProfilePic = 'src/assets/images/avatars/pic.png'

const EditProfile = () => {
  const [photoURL, setPhotoURL] = useState(defaultProfilePic)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [photoLoading, setPhotoLoading] = useState(false)
  const [previewURL, setPreviewURL] = useState('')
  const [isPreviewing, setIsPreviewing] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser
      if (currentUser) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setName(userData.name)
          setEmail(currentUser.email) // Email is fetched from auth
          setPhotoURL(userData.photoURL || defaultProfilePic) // Use Firestore photoURL or default
        }
      }
    }

    fetchUserData()
  }, [])

  // Function to handle profile picture change and upload to Firebase Storage
  const handlePhotoChange = (e) => {
    const newPhoto = e.target.files[0]
    if (newPhoto) {
      setPreviewURL(URL.createObjectURL(newPhoto)) // Preview the selected image
      setIsPreviewing(true)
    }
  }

  const confirmPhotoChange = async () => {
    if (!previewURL) {
      alert('Please select a valid image before confirming.')
      return
    }

    const newPhoto = document.getElementById('formFile').files[0] // Directly get the file from the input
    if (!newPhoto) {
      alert('No photo selected.')
      return
    }

    const storageRef = ref(
      storage,
      `profile_pictures/${auth.currentUser.uid}/${new Date().getTime()}_profile.jpg`,
    )

    const uploadTask = uploadBytesResumable(storageRef, newPhoto) // Pass the file directly

    setPhotoLoading(true)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Optional: You can add progress feedback here
      },
      (error) => {
        console.error('Error uploading file:', error)
        alert('Failed to upload profile picture.')
        setPhotoLoading(false)
      },
      async () => {
        // Get the download URL and update Firestore with the new profile picture
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        await updateDoc(doc(db, 'users', auth.currentUser.uid), { photoURL: downloadURL })

        // Update the state to display the new photo URL
        setPhotoURL(downloadURL)
        setPhotoLoading(false)
        alert('Profile picture updated successfully!')
        setIsPreviewing(false)
        setPreviewURL('')
      },
    )
  }

  // Function to update the user's password
  const handlePasswordChange = async () => {
    try {
      const currentUser = auth.currentUser
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)

      // Re-authenticate user
      await reauthenticateWithCredential(currentUser, credential)

      // Check if new passwords match
      if (newPassword !== confirmPassword) {
        alert('New passwords do not match.')
        return
      }

      await updatePassword(currentUser, newPassword)
      alert('Password updated successfully!')
      setNewPassword('')
      setCurrentPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Error updating password:', error.message)
      alert('Failed to update password.')
    }
  }

  return (
    <CRow>
      <CCol md={6}>
        <CCard style={{ height: '250px', width: '100%' }}>
          <CCardHeader className="text-center">
            <h5>Change Profile Picture</h5>
          </CCardHeader>
          <CCardBody className="d-flex align-items-center">
            <div className="d-flex flex-column align-items-center" style={{ width: '40%' }}>
              <CImage
                src={isPreviewing ? previewURL : photoURL}
                width={150}
                height={150}
                alt="Profile Picture"
                style={{
                  border: '3px solid gray',
                  borderRadius: '10px',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                  marginBottom: '10px',
                }}
              />
            </div>
            <div className="d-flex flex-column align-items-left" style={{ width: '60%' }}>
              <CFormInput
                type="file"
                id="formFile"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ marginBottom: '10px' }}
              />
              {isPreviewing && (
                <CButton color="primary" onClick={confirmPhotoChange}>
                  Confirm Change
                </CButton>
              )}
              {photoLoading && <CSpinner color="primary" />}
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol md={6}>
        <CCard style={{ height: '250px', width: '100%' }}>
          <CCardHeader>
            <h5>Name and Email</h5>
          </CCardHeader>
          <CCardBody>
            <div className="mb-3">
              <CFormLabel>Name</CFormLabel>
              <CFormInput type="text" value={name} readOnly />
            </div>
            <div className="mb-3">
              <CFormLabel>Email</CFormLabel>
              <CFormInput type="email" value={email} readOnly />
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol md={12}>
        <CCard className="mt-3 mb-3">
          <CCardHeader>
            <h5>Change Password</h5>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <div className="mb-3">
                <CFormLabel>Current Password</CFormLabel>
                <CFormInput
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <CFormLabel>New Password</CFormLabel>
                <CFormInput
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Confirm New Password</CFormLabel>
                <CFormInput
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <CButton color="primary" onClick={handlePasswordChange}>
                Update Password
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default EditProfile
