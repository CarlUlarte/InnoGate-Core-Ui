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
import { setDoc, updateDoc, collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from 'src/backend/firebase'
import CustomToast from 'src/components/Toast/CustomToast'

const defaultProfilePic = 'src/assets/images/avatars/pic.png'

const CreateAccount = () => {
  const [users, setUsers] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [password, setPassword] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [toast, setToast] = useState(null)

  // State to hold last used IDs for advisers and teachers
  const [lastAdviserID, setLastAdviserID] = useState(0)
  const [lastTeacherID, setLastTeacherID] = useState(0)

  useEffect(() => {
    const fetchAndAssignIDs = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'))
      const usersList = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      setUsers(usersList)

      let maxAdviserID = 0
      let maxTeacherID = 0

      // Scan through the users to find the maximum adviserID and teacherID
      usersList.forEach((user) => {
        if (user.role === 'Adviser' && user.adviserID) {
          const adviserID = parseInt(user.adviserID, 10)
          if (adviserID > maxAdviserID) maxAdviserID = adviserID
        }
        if (user.role === 'Teacher' && user.teacherID) {
          const teacherID = parseInt(user.teacherID, 10)
          if (teacherID > maxTeacherID) maxTeacherID = teacherID
        }
      })

      // Set the last used IDs in state
      setLastAdviserID(maxAdviserID)
      setLastTeacherID(maxTeacherID)
    }

    fetchAndAssignIDs()
  }, [])

  const handleAddUser = async () => {
    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await signInWithEmailAndPassword(auth, adminEmail, adminPassword)

      let newUser = {
        uid: user.uid,
        name,
        email,
        role,
        photoURL: defaultProfilePic,
      }

      if (role === 'Adviser') {
        const newAdviserID = lastAdviserID + 1
        setLastAdviserID(newAdviserID)
        newUser.adviserID = newAdviserID.toString()
      } else if (role === 'Teacher') {
        const newTeacherID = lastTeacherID + 1
        setLastTeacherID(newTeacherID)
        newUser.teacherID = newTeacherID.toString()
      } else if (role === 'Student') {
        newUser = {
          ...newUser,
          groupID: '',
          myTeacher: '',
          myAdviser: ''
        }
      }

      await setDoc(doc(db, 'users', user.uid), newUser)

      setUsers([...users, { id: user.uid, ...newUser }])
      setName('')
      setEmail('')
      setRole('')
      setPassword('')
      setModalVisible(false)
      setPasswordModalVisible(false)

      setToast({
        color: 'success',
        message: `User ${name} created successfully!`,
      })
    } catch (error) {
      console.error('Error adding user: ', error.message)
      setToast({
        color: 'danger',
        message: `Error: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const confirmAddUser = () => {
    const currentUser = auth.currentUser
    setAdminEmail(currentUser.email)
    setPasswordModalVisible(true)
    setModalVisible(false)
  }

  const handleDeleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, 'users', userId))
      setUsers(users.filter((user) => user.id !== userId))
      setToast({
        color: 'warning',
        message: 'User deleted successfully!',
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      setToast({
        color: 'danger',
        message: `Error: ${error.message}`,
      })
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

      {/* Custom Toast Notification */}
      <CustomToast toast={toast} setToast={setToast} />
    </CCard>
  )
}

export default CreateAccount
