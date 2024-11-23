import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CRow,
  CCol,
  CFormTextarea,
  CContainer,
  CAlert,
  CButtonGroup,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CBadge,
  CSpinner,
} from '@coreui/react'
import { cilCheckCircle, cilXCircle, cilSync } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { db, auth } from 'src/backend/firebase'
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore'
import CustomToast from 'src/components/Toast/CustomToast'

const ProposalManagement = () => {
  const [selectedGroup, setSelectedGroup] = useState('CICS')
  const [proposalsByGroup, setProposalsByGroup] = useState({})
  const [toast, setToast] = useState(null)
  const [revisionModal, setRevisionModal] = useState(false)
  const [revisionComment, setRevisionComment] = useState('')
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [teacherID, setTeacherID] = useState(null)
  const [teacherGroups, setTeacherGroups] = useState([])

  // First, fetch teacher data and their enrolled students' groups
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const currentUser = auth.currentUser
        if (currentUser) {
          const usersSnapshot = await getDocs(collection(db, 'users'))
          const teacher = usersSnapshot.docs
            .map((doc) => ({ ...doc.data(), id: doc.id }))
            .find((user) => user.uid === currentUser.uid && user.role === 'Teacher')

          if (teacher) {
            setTeacherID(teacher.teacherID)
            
            // Get all students for this teacher
            const students = usersSnapshot.docs
              .map((doc) => ({ ...doc.data(), id: doc.id }))
              .filter((user) => user.role === 'Student' && user.myTeacher === teacher.teacherID)

            // Extract unique group IDs
            const groups = [...new Set(students.map((student) => student.groupID))]
              .filter(Boolean)
            
            setTeacherGroups(groups)
            
            // Set initial selected group if available
            if (groups.length > 0) {
              setSelectedGroup(groups[0])
            }
          }
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error)
        setToast({
          color: 'danger',
          message: 'Error fetching teacher data',
        })
      }
    }

    fetchTeacherData()
  }, [])

  // Then, fetch proposals but only for the teacher's groups
  useEffect(() => {
    const fetchProposals = async () => {
      if (!teacherID) return // Don't fetch if we don't have teacher ID yet

      try {
        const querySnapshot = await getDocs(collection(db, 'proposals'))
        const fetchedProposals = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isVisible: true,
          commentVisible: false,
          comment: '',
        }))

        // Filter proposals to only include those from teacher's groups
        const filteredProposals = fetchedProposals.filter(proposal => 
          teacherGroups.includes(proposal.groupID)
        )

        // Group the filtered proposals by groupID
        const groupedProposals = filteredProposals.reduce((acc, proposal) => {
          const groupID = proposal.groupID
          if (!acc[groupID]) {
            acc[groupID] = []
          }
          acc[groupID].push(proposal)
          return acc
        }, {})

        setProposalsByGroup(groupedProposals)
      } catch (error) {
        console.error('Error fetching proposals: ', error)
        setToast({
          color: 'danger',
          message: 'Error fetching proposals',
        })
      }
    }

    fetchProposals()
  }, [teacherID, teacherGroups])

  // Status color and text mapping
  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted':
        return {
          color: 'success',
          text: 'Approved'
        }
      case 'rejected':
        return {
          color: 'danger',
          text: 'Rejected'
        }
      case 'needs_revision':
        return {
          color: 'warning',
          text: 'Needs Revision'
        }
      default:
        return {
          color: 'info',
          text: 'Pending'
        }
    }
  }

  const handleGroupClick = (groupID) => {
    setSelectedGroup(groupID)
  }

  const handleApprove = async (id) => {
    try {
      const approvedProposalRef = doc(db, 'proposals', id)
      await updateDoc(approvedProposalRef, {
        status: 'accepted',
      })

      // Update other proposals in the same group to 'rejected'
      const otherProposalUpdates = proposalsByGroup[selectedGroup]
        .filter((proposal) => proposal.id !== id)
        .map(async (proposal) => {
          const proposalRef = doc(db, 'proposals', proposal.id)
          await updateDoc(proposalRef, {
            status: 'rejected',
          })
        })

      await Promise.all(otherProposalUpdates)

      setProposalsByGroup((prevProposals) => ({
        ...prevProposals,
        [selectedGroup]: prevProposals[selectedGroup].map((proposal) => {
          if (proposal.id === id) {
            return { ...proposal, status: 'accepted', isVisible: true }
          } else {
            return { ...proposal, status: 'rejected', isVisible: true }
          }
        }),
      }))

      setToast({
        color: 'success',
        message: 'Accepted.',
      })
    } catch (error) {
      setToast({
        color: 'danger',
        message: 'Failed to accept.',
      })
    }
  }

  const handleReject = async (id) => {
    try {
      const proposalRef = doc(db, 'proposals', id)
      await updateDoc(proposalRef, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        isEditable: false,
      })

      setProposalsByGroup((prevProposals) => ({
        ...prevProposals,
        [selectedGroup]: prevProposals[selectedGroup].map((proposal) =>
          proposal.id === id
            ? {
                ...proposal,
                status: 'rejected',
                isEditable: false,
                isVisible: true,
              }
            : proposal,
        ),
      }))

      setToast({
        color: 'success',
        message: 'Rejected.',
      })
    } catch (error) {
      setToast({
        color: 'danger',
        message: 'Failed to reject.',
      })
    }
  }

  const handleRevise = (proposal) => {
    setSelectedProposal(proposal)
    setRevisionComment('')
    setRevisionModal(true)
  }

  const handleRevisionSubmit = async () => {
    if (!revisionComment.trim()) {
      setToast({
        color: 'danger',
        message: 'Please add comments for revision.',
      })
      return
    }

    if (!selectedProposal || !selectedProposal.id) {
      setToast({
        color: 'danger',
        message: 'No Proposal selected.',
      })
      return
    }

    setLoading(true)
    try {
      const proposalRef = doc(db, 'proposals', selectedProposal.id)
      await updateDoc(proposalRef, {
        status: 'needs_revision',
        teacherComment: revisionComment,
        isEditable: true,
        lastUpdated: new Date().toISOString(),
      })

      setProposalsByGroup((prevProposals) => ({
        ...prevProposals,
        [selectedGroup]: prevProposals[selectedGroup].map((proposal) =>
          proposal.id === selectedProposal.id
            ? {
                ...proposal,
                status: 'needs_revision',
                teacherComment: revisionComment,
                isEditable: true,
                isVisible: true,
              }
            : proposal,
        ),
      }))

      setToast({
        color: 'success',
        message: 'Revision requested successfully.',
      })

      setRevisionModal(false)
    } catch (error) {
      setToast({
        color: 'danger',
        message: 'Error requesting revision.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <CContainer fluid className="d-flex">
      {/* Sidebar - Groups */}
      <CCard className="shadow-sm" style={{ width: '300px', marginRight: '20px', height: 'fit-content', paddingBottom: '10px' }}>
        <CCardHeader className="bg-light">
          <h4 className="mb-0">My Groups</h4>
        </CCardHeader>
        <CCardBody className="p-0">
          {teacherGroups.length === 0 ? (
            <p className="p-3 m-0">No groups available</p>
          ) : (
            <div className="list-group list-group-flush">
              {teacherGroups.map((groupID) => (
                <button
                  key={groupID}
                  className={`list-group-item list-group-item-action border-0 ${
                    selectedGroup === groupID ? 'active' : ''
                  }`}
                  onClick={() => handleGroupClick(groupID)}
                >
                  {groupID}
                </button>
              ))}
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Main Content - Proposals */}
      <CCard className="shadow-sm flex-grow-1" style={{ width: '100px' }}>
        <CCardHeader className="bg-light d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Proposals</h4>
          {loading && <CSpinner size="sm" />}
        </CCardHeader>
        <CCardBody>
          {!proposalsByGroup[selectedGroup]?.length ? (
            <CAlert color="info">No proposals available for this group</CAlert>
          ) : (
            proposalsByGroup[selectedGroup].map(
              (proposal) =>
                proposal.isVisible && (
                  <CCard
                    key={proposal.id}
                    className="mb-4 shadow-sm"
                    style={{
                      opacity: proposal.status === 'rejected' ? 0.7 : 1,
                      pointerEvents: proposal.status === 'rejected' ? 'none' : 'auto',
                    }}
                  >
                    <CCardBody>
                      <CRow>
                        <CCol xs={12} className="mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">{proposal.title}</h5>
                            <CBadge color={getStatusStyle(proposal.status).color} className="px-3 py-2">
                              {getStatusStyle(proposal.status).text}
                            </CBadge>
                          </div>
                        </CCol>
                        <CCol md={8}>
                          <p className="text-muted mb-3">{proposal.description}</p>
                          <div className="d-flex gap-4">
                            <div>
                              <small className="text-medium-emphasis">Client</small>
                              <p className="mb-0 fw-bold">{proposal.client}</p>
                            </div>
                            <div>
                              <small className="text-medium-emphasis">Field</small>
                              <p className="mb-0 fw-bold">{proposal.field}</p>
                            </div>
                          </div>
                        </CCol>
                        <CCol md={4} className="d-flex align-items-center justify-content-end">
                          <CButtonGroup vertical>
                            <CButton
                              color="success"
                              variant="outline"
                              onClick={() => handleApprove(proposal.id)}
                              className="mb-2"
                              disabled={proposal.status === 'rejected' || proposal.status === 'accepted'}
                            >
                              <CIcon icon={cilCheckCircle} className="me-2" />
                              Approve
                            </CButton>
                            <CButton
                              color="danger"
                              variant="outline"
                              onClick={() => handleReject(proposal.id)}
                              className="mb-2"
                            >
                              <CIcon icon={cilXCircle} className="me-2" />
                              Reject
                            </CButton>
                            <CButton
                              color="warning"
                              variant="outline"
                              onClick={() => handleRevise(proposal)}
                            >
                              <CIcon icon={cilSync} className="me-2" />
                              Revise
                            </CButton>
                          </CButtonGroup>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                )
            )
          )}
        </CCardBody>
      </CCard>

      {/* Revision Modal */}
      <CModal visible={revisionModal} onClose={() => setRevisionModal(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Request Revision</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p className="text-medium-emphasis">Please provide your comments for revision:</p>
          <CFormTextarea
            rows={4}
            value={revisionComment}
            onChange={(e) => setRevisionComment(e.target.value)}
            placeholder="Enter your comments for the students..."
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setRevisionModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleRevisionSubmit} disabled={loading}>
            {loading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Submitting...
              </>
            ) : (
              'Submit Revision Request'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      <CustomToast toast={toast} setToast={setToast} />
    </CContainer>
  )
}

export default ProposalManagement