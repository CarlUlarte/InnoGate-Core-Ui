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
import { db } from 'src/backend/firebase' // Make sure you have firebase set up and this file imported correctly
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import CustomToast from 'src/components/Toast/CustomToast'

const ProposalManagement = () => {
  const [selectedGroup, setSelectedGroup] = useState('CICS') // Default group
  const [proposalsByGroup, setProposalsByGroup] = useState({})
  const [toast, setToast] = useState(null)
  const [revisionModal, setRevisionModal] = useState(false)
  const [revisionComment, setRevisionComment] = useState('')
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetch proposals from Firestore
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'proposals'))
        const fetchedProposals = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isVisible: true,
          commentVisible: false,
          comment: '', // Initialize comment field
        }))

        // Group proposals by groupID
        const groupedProposals = fetchedProposals.reduce((acc, proposal) => {
          const groupID = proposal.groupID // Ensure 'groupID' field exists in your Firestore documents
          if (!acc[groupID]) {
            acc[groupID] = []
          }
          acc[groupID].push(proposal)
          return acc
        }, {})

        setProposalsByGroup(groupedProposals)
      } catch (error) {
        console.error('Error fetching proposals: ', error)
      }
    }

    fetchProposals()
  }, [])

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
      // Update the approved proposal in Firestore
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

      // Wait for all other proposal updates to complete
      await Promise.all(otherProposalUpdates)

      // Update local state
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
    setSelectedProposal(proposal) // Pass whole proposal
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

      // Update local state with revision
      setProposalsByGroup((prevProposals) => ({
        ...prevProposals,
        [selectedGroup]: prevProposals[selectedGroup].map((proposal) =>
          proposal.id === selectedProposal.id
            ? {
                ...proposal,
                status: 'needs_revision',
                teacherComment: revisionComment,
                isEditable: true,
                isVisible: true, // Set visibility to false as it's being revised
              }
            : proposal,
        ),
      }))

      setToast({
        color: 'success',
        message: 'Revision requested successfully.',
      })

      setRevisionModal(false) // Close modal
    } catch (error) {
      setToast({
        color: 'danger',
        message: 'Error requesting revision..',
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
          <h2>Groups</h2>
        </CCardHeader>
        <CCardBody>
          <ul className="list-unstyled">
            {Object.keys(proposalsByGroup).map((groupID) => (
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
        </CCardBody>
      </CCard>
      {/* Main Content - Proposals */}
      <CCard style={{ flex: 1 }}>
        <CCardHeader>
          <h1>Proposals for {selectedGroup}</h1>
        </CCardHeader>
        <CCardBody>
          {(proposalsByGroup[selectedGroup] || []).map(
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
                        {/* Horizontal Button Group */}
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
          )}
        </CCardBody>
      </CCard>
      {/* Revision Modal and other components remain the same */}
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