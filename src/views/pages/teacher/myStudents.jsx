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

const colorPalette = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#A633FF', '#FF8333', '#33FF8A']

const MyStudents = () => {
  const [students, setStudents] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const fetchStudents = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'))
      const studentsList = querySnapshot.docs
        .map((doc) => ({ ...doc.data(), id: doc.id }))
        .filter((user) => user.role === 'Student')
      studentsList.sort((a, b) => (a.groupID || '').localeCompare(b.groupID || ''))
      setStudents(studentsList)
    }

    fetchStudents()
  }, [])

  const toggleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId))
    } else if (selectedStudents.length < 3) {
      setSelectedStudents([...selectedStudents, studentId])
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

  const getGroupColor = (groupID) => {
    const groupIndex = [...new Set(students.map((s) => s.groupID))].indexOf(groupID)
    return colorPalette[groupIndex % colorPalette.length]
  }

  return (
    <CCard>
      <CCardHeader>
        <div className="d-flex justify-content-between align-items-center">
          <h5>My Students</h5>
          <CButton color="primary" onClick={() => setModalVisible(true)}>
            Group Students
          </CButton>
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
          <p>No students available.</p>
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
          {students
            .filter((student) => !student.groupID)
            .map((student) => (
              <CFormCheck
                key={student.id}
                label={student.name}
                checked={selectedStudents.includes(student.id)}
                onChange={() => toggleStudentSelection(student.id)}
                disabled={
                  selectedStudents.length === 3 && !selectedStudents.includes(student.id)
                }
              />
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

      {/* Custom Toast Notification */}
      <CustomToast toast={toast} setToast={setToast} />
    </CCard>
  )
}

export default MyStudents
