import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CRow,
  CCol,
  CContainer,
  CButtonGroup,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CListGroup,
  CListGroupItem
} from '@coreui/react'
import { cilCheckCircle, cilXCircle } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const GroupRequestExample = () => {
  const [groupRequests] = useState([
    {
      id: 'group1',
      groupID: 'SWE-24-A',
      members: [
        { uid: '1', name: 'Alice Johnson', email: 'alice@example.com' },
        { uid: '2', name: 'Bob Smith', email: 'bob@example.com' },
        { uid: '3', name: 'Charlie Davis', email: 'charlie@example.com' }
      ],
      approvedProposal: {
        title: 'AI-Powered Customer Support Chatbot',
        description: 'Develop an advanced chatbot using natural language processing to improve customer service efficiency.',
        client: 'TechCorp Solutions',
        field: 'Artificial Intelligence'
      }
    },
    {
      id: 'group2',
      groupID: 'SWE-24-B',
      members: [
        { uid: '4', name: 'Diana Wilson', email: 'diana@example.com' },
        { uid: '5', name: 'Ethan Brown', email: 'ethan@example.com' }
      ],
      approvedProposal: {
        title: 'Sustainable Energy Management Platform',
        description: 'Create a web application to monitor and optimize energy consumption for businesses.',
        client: 'GreenTech Innovations',
        field: 'Sustainability'
      }
    }
  ])

  const [selectedGroup, setSelectedGroup] = useState(null)
  const [confirmModal, setConfirmModal] = useState(false)
  const [modalAction, setModalAction] = useState(null)

  const handleGroupSelect = (group) => {
    setSelectedGroup(group)
  }

  const openConfirmModal = (action) => {
    setModalAction(action)
    setConfirmModal(true)
  }

  const handleGroupRequestResponse = () => {
    // Simulated response handling
    setConfirmModal(false)
    setSelectedGroup(null)
  }

  return (
    <CContainer fluid className="d-flex" style={{ fontSize: '0.875rem' }}>
      {/* Sidebar - Group Requests List */}
      <CCard style={{ width: '250px', marginRight: '15px' }}>
        <CCardHeader className="py-2">
          <h6 className="m-0">Pending Group Requests</h6>
        </CCardHeader>
        <CCardBody className="p-0">
          <CListGroup>
            {groupRequests.map((request) => (
              <CListGroupItem 
                key={request.id}
                onClick={() => handleGroupSelect(request)}
                active={selectedGroup?.id === request.id}
                color={selectedGroup?.id === request.id ? 'primary' : undefined}
                className="py-2"
              >
                <small>{request.groupID}</small>
              </CListGroupItem>
            ))}
          </CListGroup>
        </CCardBody>
      </CCard>

      {/* Main Content - Group Request Details */}
      <CCard style={{ flex: 1 }}>
        <CCardHeader className="py-2">
          <h6 className="m-0">
            {selectedGroup 
              ? `Group Request: ${selectedGroup.groupID}` 
              : 'Select a Group Request'}
          </h6>
        </CCardHeader>
        <CCardBody>
          {selectedGroup && (
            <div>
              {/* Group Members */}
              <CCard className="mb-3">
                <CCardHeader className="py-2">
                  <small className="m-0 fw-bold">Group Members</small>
                </CCardHeader>
                <CCardBody className="p-2">
                  <CListGroup>
                    {selectedGroup.members?.map((member) => (
                      <CListGroupItem key={member.uid} className="py-1">
                        <small>
                          {member.name} - <em>{member.email}</em>
                        </small>
                      </CListGroupItem>
                    ))}
                  </CListGroup>
                </CCardBody>
              </CCard>

              {/* Approved Topic Details */}
              <CCard className="mb-3">
                <CCardHeader className="py-2">
                  <small className="m-0 fw-bold">Approved Topic</small>
                </CCardHeader>
                <CCardBody className="p-2">
                  <h6 className="mb-2">{selectedGroup.approvedProposal.title}</h6>
                  <p className="mb-2" style={{ fontSize: '0.8rem' }}>
                    {selectedGroup.approvedProposal.description}
                  </p>
                  <CRow>
                    <CCol>
                      <small><strong>Client:</strong> {selectedGroup.approvedProposal.client}</small>
                    </CCol>
                    <CCol>
                      <small><strong>Field:</strong> {selectedGroup.approvedProposal.field}</small>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>

              {/* Action Buttons */}
              <CButtonGroup className="w-100">
                <CButton 
                  color="success" 
                  size="sm"
                  onClick={() => openConfirmModal('accept')}
                >
                  <CIcon icon={cilCheckCircle} className="me-1" />
                  Accept
                </CButton>
                <CButton 
                  color="danger" 
                  size="sm"
                  onClick={() => openConfirmModal('reject')}
                >
                  <CIcon icon={cilXCircle} className="me-1" />
                  Reject
                </CButton>
              </CButtonGroup>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Confirmation Modal */}
      <CModal visible={confirmModal} onClose={() => setConfirmModal(false)} size="sm">
        <CModalHeader>
          <CModalTitle>
            <small>
              {modalAction === 'accept' ? 'Accept Group Request' : 'Reject Group Request'}
            </small>
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <small>
            Are you sure you want to {modalAction} the group request for {selectedGroup?.groupID}?
          </small>
        </CModalBody>
        <CModalFooter>
          <CButton size="sm" color="secondary" onClick={() => setConfirmModal(false)}>
            Cancel
          </CButton>
          <CButton 
            size="sm"
            color={modalAction === 'accept' ? 'success' : 'danger'} 
            onClick={handleGroupRequestResponse}
          >
            {modalAction === 'accept' ? 'Accept' : 'Reject'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default GroupRequestExample