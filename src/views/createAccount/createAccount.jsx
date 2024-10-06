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
} from '@coreui/react'
import { setDoc, collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from 'src/backend/firebase'
import { getFunctions, httpsCallable } from 'firebase/functions'

const CreateAccount = () => {
  const [users, setUsers] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [password, setPassword] = useState('')

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
    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Use the UID from Firebase Auth as the document ID in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid, // Save UID explicitly for reference
        name,
        email,
        role,
      })

      setUsers([...users, { id: user.uid, name, email, role }])
      setName('')
      setEmail('')
      setRole('')
      setPassword('')
      setModalVisible(false)
    } catch (error) {
      console.error('Error adding user: ', error)
    }
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
        <CRow className="mb-4">
          <CCol sm={3}>
            <strong>Name</strong>
          </CCol>
          <CCol sm={3}>
            <strong>Email</strong>
          </CCol>
          <CCol sm={3}>
            <strong>Role</strong>
          </CCol>
          <CCol sm={3}>
            <strong>Actions</strong>
          </CCol>
        </CRow>
        {users.length === 0 ? (
          <p>No users added yet.</p>
        ) : (
          users.map((user, index) => (
            <CRow key={index} className="mb-2">
              <CCol sm={3}>{user.name}</CCol>
              <CCol sm={3}>{user.email}</CCol>
              <CCol sm={3}>{user.role}</CCol>
              <CCol sm={3}>
                <CButton size="sm" color="danger" onClick={() => handleDeleteUser(user.id)}>
                  Delete
                </CButton>
              </CCol>
            </CRow>
          ))
        )}
      </CCardBody>

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
          <CButton color="primary" onClick={handleAddUser}>
            Add User
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default CreateAccount
