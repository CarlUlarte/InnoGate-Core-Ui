import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
  CImage,
} from '@coreui/react'
import { setDoc, collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from 'src/backend/firebase'

const defaultProfilePic = 'src/assets/images/avatars/pic.png'

const createAccount = () => {
  const [users, setUsers] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [password, setPassword] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [loading, setLoading] = useState(false) // Add a loading state
  const [adminEmail, setAdminEmail] = useState('') // Store admin email

  // Fetch users from Firestore when component loads
  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'))
      const usersList = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      setUsers(usersList)
    }

    fetchUsers()
  }, [])

  const handleAddUser = async () => {
    setLoading(true) // Start loading before creating the user
    try {
      // Step 1: Create the new user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Step 2: Save the new user info in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        role,
        photoURL: defaultProfilePic, // Set default profile picture
      })

      // Step 3: Immediately log the admin user back in
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword)

      // Update the UI after successful user creation
      setUsers([...users, { id: user.uid, name, email, role, photoURL: defaultProfilePic }])
      setName('')
      setEmail('')
      setRole('')
      setPassword('')
      setModalVisible(false)
      setPasswordModalVisible(false) // Close both modals

      console.log(`User ${name} created successfully.`)
    } catch (error) {
      console.error('Error adding user: ', error.message)
    } finally {
      setLoading(false) // End loading after everything is done
    }
  }

  const confirmAddUser = () => {
    const currentUser = auth.currentUser
    setAdminEmail(currentUser.email) // Save admin email
    setPasswordModalVisible(true) // Show password modal
    setModalVisible(false)
  }

  const handleDeleteUser = async (userId) => {
    try {
      // Delete user document using UID as the document ID
      await deleteDoc(doc(db, 'users', userId))
      setUsers(users.filter((user) => user.id !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  return (
    <CCard>
      <CCardHeader>
        <div className="d-flex justify-content-between align-items-center">
          <h5>Users</h5>
          <CButton onClick={() => setModalVisible(true)} color="primary">
            Add User
          </CButton>
        </div>
      </CCardHeader>
      <CCardBody>
        <CRow className="mb-4 justify-content-between">
          <CCol sm={4}>
            <strong>Name & Profile Picture</strong>
          </CCol>
          <CCol sm={4}>
            <strong>Email</strong>
          </CCol>
          <CCol sm={3}>
            <strong>Role</strong>
          </CCol>
          <CCol sm={1}>
            <strong>Actions</strong>
          </CCol>
        </CRow>
        {users.length === 0 ? (
          <p>No users added yet.</p>
        ) : (
          users.map((user, index) => (
            <CRow key={index} className="mb-2 justify-content-between align-items-center">
              <CCol sm={4} className="d-flex align-items-center">
                <CImage
                  src={user.photoURL || defaultProfilePic}
                  width={40}
                  height={40}
                  roundedCircle
                  alt="Profile Picture"
                  className="me-3"
                  style={{
                    border: '1px solid gray',
                    borderRadius: '20px',
                  }}
                />
                <span className="small">{user.name}</span>
              </CCol>
              <CCol sm={4}>
                <span className="small">{user.email}</span>
              </CCol>
              <CCol sm={3}>
                <span className="small">{user.role}</span>
              </CCol>
              <CCol sm={1}>
                <CButton size="sm" color="danger" onClick={() => handleDeleteUser(user.id)}>
                  Delete
                </CButton>
              </CCol>
            </CRow>
          ))
        )}
      </CCardBody>

      {/* Add User Modal */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Add User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <CFormInput
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <CFormSelect
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              <option value="Adviser">Adviser</option>
              <option value="Teacher">Teacher</option>
              <option value="Student">Student</option>
              <option value="Admin">Admin</option>
            </CFormSelect>
            <CFormInput
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={confirmAddUser} disabled={loading}>
            {loading ? 'Adding...' : 'Next'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Admin Password Confirmation Modal */}
      <CModal visible={passwordModalVisible} onClose={() => setPasswordModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Admin Password Confirmation</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="password"
              label="Admin Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setPasswordModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleAddUser} disabled={loading}>
            {loading ? 'Adding...' : 'Confirm'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default createAccount
