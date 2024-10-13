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
  CTable,
  CTableBody,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
} from '@coreui/react'
import { setDoc, collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
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
  const [maxTeacherID, setMaxTeacherID] = useState(0) // Track highest teacherID
  const [maxAdviserID, setMaxAdviserID] = useState(0) // Track highest adviserID

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'))
      const usersList = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))

      // Get the highest teacherID and adviserID
      let maxTeacherID = 0
      let maxAdviserID = 0

      usersList.forEach((user) => {
        if (user.role === 'Teacher' && user.teacherID) {
          maxTeacherID = Math.max(maxTeacherID, parseInt(user.teacherID, 10))
        }
        if (user.role === 'Adviser' && user.adviserID) {
          maxAdviserID = Math.max(maxAdviserID, parseInt(user.adviserID, 10))
        }
      })

      setMaxTeacherID(maxTeacherID)
      setMaxAdviserID(maxAdviserID)
      setUsers(usersList)
    }

    fetchUsers()
  }, [])

  const handleAddUser = async () => {
    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await signInWithEmailAndPassword(auth, adminEmail, adminPassword)

      // Generate next IDs
      let newTeacherID = maxTeacherID + 1
      let newAdviserID = maxAdviserID + 1

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        role,
        photoURL: defaultProfilePic,
        ...(role === 'Adviser' && { adviserID: newAdviserID.toString() }), // Assign new adviserID
        ...(role === 'Teacher' && { teacherID: newTeacherID.toString() }), // Assign new teacherID
        ...(role === 'Student' && {
          groupID: '', // Placeholder for group ID, if grouping is used
          myTeacher: '', // Placeholder, can be updated later
          myAdviser: '', // Placeholder, can be updated later
        }),
      })

      setUsers([...users, { id: user.uid, name, email, role, photoURL: defaultProfilePic }])
      setName('')
      setEmail('')
      setRole('')
      setPassword('')
      setModalVisible(false)
      setPasswordModalVisible(false)

      // Increment maxTeacherID or maxAdviserID if applicable
      if (role === 'Teacher') {
        setMaxTeacherID(newTeacherID)
      } else if (role === 'Adviser') {
        setMaxAdviserID(newAdviserID)
      }

      // Increment maxTeacherID or maxAdviserID if applicable
      if (role === 'Teacher') {
        setMaxTeacherID(newTeacherID)
      } else if (role === 'Adviser') {
        setMaxAdviserID(newAdviserID)
      }

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
    <CCard className="mb-3">
      <CCardHeader>
        <div className="d-flex justify-content-between align-items-center">
          <h5>Users</h5>
          <CButton onClick={() => setModalVisible(true)} color="primary">
            Add User
          </CButton>
        </div>
      </CCardHeader>
      <CCardBody>
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Email</CTableHeaderCell>
              <CTableHeaderCell>Role</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {users.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={4} className="text-center">
                  No users added yet.
                </CTableDataCell>
              </CTableRow>
            ) : (
              users.map((user, index) => (
                <CTableRow key={index}>
                  <CTableDataCell className="d-flex align-items-center">
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
                  </CTableDataCell>
                  <CTableDataCell>
                    <span className="small">{user.email}</span>
                  </CTableDataCell>
                  <CTableDataCell>
                    <span className="small">{user.role}</span>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton size="sm" color="danger" onClick={() => handleDeleteUser(user.id)}>
                      Delete
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
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

      <CustomToast toast={toast} setToast={setToast} />
    </CCard>
  )
}

export default CreateAccount
