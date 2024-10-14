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
  CFormCheck,
  CRow,
  CCol,
} from '@coreui/react'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from 'src/backend/firebase'
import CustomToast from 'src/components/Toast/CustomToast'
import { auth } from 'src/backend/firebase' // Import auth to get the current user

const colorPalette = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#A633FF', '#FF8333', '#33FF8A']

const MyStudents = () => {
  const [students, setStudents] = useState([])
  const [availableStudents, setAvailableStudents] = useState([]) // For students with empty myTeacher field
  const [modalVisible, setModalVisible] = useState(false)
  const [enrollModalVisible, setEnrollModalVisible] = useState(false) // Modal for enrolling students
  const [selectedStudents, setSelectedStudents] = useState([])
  const [selectedEnrollStudents, setSelectedEnrollStudents] = useState([]) // For enrolling students
  const [toast, setToast] = useState(null)
  const [teacherID, setTeacherID] = useState(null) // Store the teacher's ID

  useEffect(() => {
    const fetchTeacherData = async () => {
      const currentUser = auth.currentUser
      if (currentUser) {
        const querySnapshot = await getDocs(collection(db, 'users'))
        const teacher = querySnapshot.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }))
          .find((user) => user.uid === currentUser.uid && user.role === 'Teacher')
        if (teacher) {
          setTeacherID(teacher.teacherID)
          fetchStudents(teacher.teacherID)
        }
      }
    }

    const fetchStudents = async (teacherID) => {
      const querySnapshot = await getDocs(collection(db, 'users'))
      const studentsList = querySnapshot.docs
        .map((doc) => ({ ...doc.data(), id: doc.id }))
        .filter((user) => user.role === 'Student' && user.myTeacher === teacherID) // Fetch only enrolled students
      studentsList.sort((a, b) => (a.groupID || '').localeCompare(b.groupID || ''))
      setStudents(studentsList)
    }

    const fetchAvailableStudents = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'))
      const availableList = querySnapshot.docs
        .map((doc) => ({ ...doc.data(), id: doc.id }))
        .filter((user) => user.role === 'Student' && !user.myTeacher) // Fetch students without a teacher
      setAvailableStudents(availableList)
    }

    fetchTeacherData()
    fetchAvailableStudents()
  }, [])

  const toggleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId))
    } else if (selectedStudents.length < 3) {
      setSelectedStudents([...selectedStudents, studentId])
    }
  }

  const toggleEnrollStudentSelection = (studentId) => {
    if (selectedEnrollStudents.includes(studentId)) {
      setSelectedEnrollStudents(selectedEnrollStudents.filter((id) => id !== studentId))
    } else {
      setSelectedEnrollStudents([...selectedEnrollStudents, studentId])
    }
  }

  const handleGroupStudents = async () => {
    if (selectedStudents.length < 1) {
      setToast({
        color: 'warning',
        message: 'Please select at least one student to group.',
      })
      return
    }

    const newGroupID = `group-${Date.now()}`
    try {
      await Promise.all(
        selectedStudents.map((studentId) =>
          updateDoc(doc(db, 'users', studentId), { groupID: newGroupID })
        )
      )
      setStudents(
        students.map((student) =>
          selectedStudents.includes(student.id)
            ? { ...student, groupID: newGroupID }
            : student
        ).sort((a, b) => (a.groupID || '').localeCompare(b.groupID || ''))
      )
      setToast({
        color: 'success',
        message: 'Students grouped successfully!',
      })
      setModalVisible(false)
      setSelectedStudents([])
    } catch (error) {
      console.error('Error grouping students:', error)
      setToast({
        color: 'danger',
        message: `Error: ${error.message}`,
      })
    }
  }

  const handleEnrollStudents = async () => {
    if (selectedEnrollStudents.length < 1) {
      setToast({
        color: 'warning',
        message: 'Please select at least one student to enroll.',
      })
      return
    }

    try {
      await Promise.all(
        selectedEnrollStudents.map((studentId) =>
          updateDoc(doc(db, 'users', studentId), { myTeacher: teacherID })
        )
      )
      setStudents([
        ...students,
        ...availableStudents
          .filter((student) => selectedEnrollStudents.includes(student.id))
          .map((student) => ({ ...student, myTeacher: teacherID })),
      ])
      setToast({
        color: 'success',
        message: 'Students enrolled successfully!',
      })
      setEnrollModalVisible(false)
      setSelectedEnrollStudents([])
    } catch (error) {
      console.error('Error enrolling students:', error)
      setToast({
        color: 'danger',
        message: `Error: ${error.message}`,
      })
    }
  }

  const getGroupColor = (groupID) => {
    const groupIndex = [...new Set(students.map((s) => s.groupID))].indexOf(groupID)
    return colorPalette[groupIndex % colorPalette.length]
  }

  return (
    <CCard>
      <CCardHeader>
        <div className="d-flex justify-content-between align-items-center">
          <h5>My Students</h5>
          <div>
            <CButton color="primary" className="me-2" onClick={() => setEnrollModalVisible(true)}>
              Add Students
            </CButton>
            <CButton color="primary" onClick={() => setModalVisible(true)}>
              Group Students
            </CButton>
          </div>
        </div>
      </CCardHeader>
      <CCardBody>
        <CRow className="mb-4">
          <CCol sm={4}>
            <strong>Name</strong>
          </CCol>
          <CCol sm={4}>
            <strong>Email</strong>
          </CCol>
          <CCol sm={4}>
            <strong>Group ID</strong>
          </CCol>
        </CRow>
        {students.length === 0 ? (
          <p>No students enrolled.</p>
        ) : (
          students.map((student, index) => (
            <CRow key={index} className="mb-2 align-items-center">
              <CCol sm={4}>{student.name}</CCol>
              <CCol sm={4}>{student.email}</CCol>
              <CCol sm={4} className="d-flex align-items-center">
                {student.groupID && (
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: getGroupColor(student.groupID),
                      borderRadius: '50%',
                      display: 'inline-block',
                      marginRight: '8px',
                    }}
                  ></span>
                )}
                {student.groupID || 'Not grouped'}
              </CCol>
            </CRow>
          ))
        )}
      </CCardBody>

      {/* Group Students Modal */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Group Students</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol sm={2} className="d-flex justify-content-center"><strong>Select</strong></CCol>
            <CCol sm={4}><strong>Name</strong></CCol>
            <CCol sm={6}><strong>Email</strong></CCol>
          </CRow>
          {students
            .filter((student) => !student.groupID) // Filter only students that aren't grouped yet
            .map((student) => (
              <CRow key={student.id} className="align-items-center">
                <CCol sm={2} className="d-flex justify-content-center">
                  <CFormCheck
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => toggleStudentSelection(student.id)}
                    disabled={selectedStudents.length === 3 && !selectedStudents.includes(student.id)}
                  />
                </CCol>
                <CCol sm={4}>{student.name}</CCol>
                <CCol sm={6}>{student.email}</CCol>
              </CRow>
            ))}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleGroupStudents}>
            Confirm Group
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Enroll Students Modal */}
      <CModal visible={enrollModalVisible} onClose={() => setEnrollModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Enroll Students</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol sm={2} className="d-flex justify-content-center"><strong>Select</strong></CCol>
            <CCol sm={4}><strong>Name</strong></CCol>
            <CCol sm={6}><strong>Email</strong></CCol>
          </CRow>
          {availableStudents.map((student) => (
            <CRow key={student.id} className="align-items-center">
              <CCol sm={2} className="d-flex justify-content-center">
                <CFormCheck
                  checked={selectedEnrollStudents.includes(student.id)}
                  onChange={() => toggleEnrollStudentSelection(student.id)}
                />
              </CCol>
              <CCol sm={4}>{student.name}</CCol>
              <CCol sm={6}>{student.email}</CCol>
            </CRow>
          ))}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEnrollModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleEnrollStudents}>
            Enroll
          </CButton>
        </CModalFooter>
      </CModal>


      {/* Custom Toast Notification */}
      <CustomToast toast={toast} setToast={setToast} />
    </CCard>
  )
}

export default MyStudents
