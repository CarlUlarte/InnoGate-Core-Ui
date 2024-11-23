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
          color: 'green',
          text: 'Approved',
          backgroundColor: 'rgba(0, 255, 0, 0.1)'
        }
      case 'rejected':
        return {
          color: 'red',
          text: 'Rejected',
          backgroundColor: 'rgba(255, 0, 0, 0.1)'
        }
      case 'needs_revision':
        return {
          color: 'orange',
          text: 'Needs Revision',
          backgroundColor: 'rgba(255, 165, 0, 0.1)'
        }
      default:
        return {
          color: 'black',
          text: 'Pending',
          backgroundColor: 'transparent'
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
      <CCard style={{ width: '250px', marginRight: '20px' }}>
        <CCardHeader>
          <h2>My Groups</h2>
        </CCardHeader>
        <CCardBody>
          {teacherGroups.length === 0 ? (
            <p>No groups available</p>
          ) : (
            <ul className="list-unstyled">
              {teacherGroups.map((groupID) => (
                <li
                  key={groupID}
                  onClick={() => handleGroupClick(groupID)}
                  style={{
                    cursor: 'pointer',
                    fontWeight: selectedGroup === groupID ? 'bold' : 'normal',
                    marginBottom: '10px',
                  }}
                >
                  {groupID}
                </li>
              ))}
            </ul>
          )}
        </CCardBody>
      </CCard>

      {/* Main Content - Proposals */}
      <CCard style={{ flex: 1 }}>
        <CCardHeader>
          <h1>Proposals for {selectedGroup}</h1>
        </CCardHeader>
        <CCardBody>
          {!proposalsByGroup[selectedGroup]?.length ? (
            <p>No proposals available for this group</p>
          ) : (
            (proposalsByGroup[selectedGroup] || []).map(
              (proposal) =>
                proposal.isVisible && (
                  <CCard
                    key={proposal.id}
                    className="mb-4"
                    style={{
                      opacity: proposal.status === 'rejected' ? 0.5 : 1,
                      pointerEvents: proposal.status === 'rejected' ? 'none' : 'auto',
                    }}
                  >
                    <CCardBody>
                      {/* Status Indicator */}
                      {proposal.status && (
                        <div 
                          style={{
                            position: 'absolute', 
                            top: '10px', 
                            right: '10px', 
                            padding: '5px 10px',
                            borderRadius: '4px',
                            ...getStatusStyle(proposal.status)
                          }}
                        >
                          {getStatusStyle(proposal.status).text}
                        </div>
                      )}

                      <CRow>
                        <CCol md={8}>
                          <h2>{proposal.title}</h2>
                          <p>{proposal.description}</p>
                          <p>
                            <strong>Client:</strong> {proposal.client}
                          </p>
                          <p>
                            <strong>Field:</strong> {proposal.field}
                          </p>
                        </CCol>
                        <CCol md={4} className="d-flex align-items-center justify-content-end">
                          <CButtonGroup>
                            <CButton
                              color="success"
                              onClick={() => handleApprove(proposal.id)}
                              className="mx-1"
                              disabled={
                                proposal.status === 'rejected' || proposal.status === 'accepted'
                              }
                            >
                              <CIcon icon={cilCheckCircle} className="me-2" />
                              Approve
                            </CButton>
                            <CButton
                              color="danger"
                              onClick={() => handleReject(proposal.id)}
                              className="mx-1"
                            >
                              <CIcon icon={cilXCircle} className="me-2" />
                              Reject
                            </CButton>
                            <CButton
                              color="warning"
                              onClick={() => handleRevise(proposal)}
                              className="mx-1"
                            >
                              <CIcon icon={cilSync} className="me-2" />
                              Revise
                            </CButton>
                          </CButtonGroup>
                        </CCol>
                      </CRow>

                      {proposal.commentVisible && (
                        <div className="mt-4">
                          <p>
                            <strong>Comment:</strong>
                          </p>
                          <CFormTextarea
                            placeholder="Add your comments here..."
                            rows={4}
                            value={proposal.comment}
                            onChange={(e) => handleCommentChange(proposal.id, e.target.value)}
                          />
                          <CButton
                            color="primary"
                            className="mt-2"
                            onClick={() => handleCommentDone(proposal.id)}
                          >
                            Done
                          </CButton>
                        </div>
                      )}
                    </CCardBody>
                  </CCard>
                ),
            )
          )}
        </CCardBody>
      </CCard>

      {/* Revision Modal */}
      <CModal visible={revisionModal} onClose={() => setRevisionModal(false)}>
        <CModalHeader>
          <CModalTitle>Request Revision</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Please provide your comments for revision:</p>
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
            {loading ? 'Submitting...' : 'Submit Revision Request'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CustomToast toast={toast} setToast={setToast} />
    </CContainer>
  )
}

export default ProposalManagement