import React, { useState } from 'react';
import { CCard, CCardBody, CCardHeader, CButton, CRow, CCol, CFormTextarea, CContainer, CAlert, CButtonGroup } from '@coreui/react';
import { cilCheckCircle, cilXCircle, cilSync } from '@coreui/icons';
import CIcon from '@coreui/icons-react';

const ProposalManagement = () => {
  const [selectedGroup, setSelectedGroup] = useState('InnoGate');
  const [proposals, setProposals] = useState([
    {
      id: 1,
      title: 'Dancing Computational Technology',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      client: 'Dog Owner',
      field: 'Computational Technology',
      status: null,
      isVisible: true,
      commentVisible: false,
      comment: '', // Added comment field
    },
    {
      id: 2,
      title: 'Artificial Intelligence in Milk Tea',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      client: 'Tea Enthusiast',
      field: 'AI Research',
      status: null,
      isVisible: true,
      commentVisible: false,
      comment: '', // Added comment field
    },
  ]);

  const [notification, setNotification] = useState(null);

  const handleGroupClick = (groupName) => {
    setSelectedGroup(groupName);
  };

  const handleApprove = (id) => {
    setProposals((prevProposals) =>
      prevProposals.map((proposal) =>
        proposal.id === id ? { ...proposal, status: 'approved', isVisible: false } : proposal
      )
    );
    showNotification('✔ Proposal Approved!');
  };

  const handleReject = (id) => {
    setProposals((prevProposals) =>
      prevProposals.map((proposal) =>
        proposal.id === id ? { ...proposal, status: 'rejected', isVisible: false } : proposal
      )
    );
    showNotification('✖ Proposal Rejected!');
  };

  const handleRevise = (id) => {
    setProposals((prevProposals) =>
      prevProposals.map((proposal) =>
        proposal.id === id ? { ...proposal, commentVisible: !proposal.commentVisible } : proposal
      )
    );
  };

  const handleCommentChange = (id, comment) => {
    setProposals((prevProposals) =>
      prevProposals.map((proposal) =>
        proposal.id === id ? { ...proposal, comment } : proposal
      )
    );
  };

  const handleCommentDone = (id) => {
    setProposals((prevProposals) =>
      prevProposals.map((proposal) =>
        proposal.id === id ? { ...proposal, commentVisible: false, isVisible: false } : proposal
      )
    );
    showNotification('✔ Comment Submitted!');
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 1500);
  };

  return (
    <CContainer fluid className="d-flex">
      {/* Sidebar - Groups */}
      <CCard style={{ width: '250px', marginRight: '20px' }}>
        <CCardHeader>
          <h2>Groups</h2>
        </CCardHeader>
        <CCardBody>
          <ul className="list-unstyled">
            <li
              onClick={() => handleGroupClick('InnoGate')}
              style={{ cursor: 'pointer', fontWeight: selectedGroup === 'InnoGate' ? 'bold' : 'normal', marginBottom: '10px' }}
            >
              InnoGate
            </li>
            <li
              onClick={() => handleGroupClick('Group 2')}
              style={{ cursor: 'pointer', fontWeight: selectedGroup === 'Group 2' ? 'bold' : 'normal', marginBottom: '10px' }}
            >
              Group 2
            </li>
            <li
              onClick={() => handleGroupClick('Group 3')}
              style={{ cursor: 'pointer', fontWeight: selectedGroup === 'Group 3' ? 'bold' : 'normal' }}
            >
              Group 3
            </li>
          </ul>
        </CCardBody>
      </CCard>

      {/* Main Content - Proposals */}
      <CCard style={{ flex: 1 }}>
        <CCardHeader>
          <h1>Proposals for {selectedGroup}</h1>
        </CCardHeader>
        <CCardBody>
          {proposals.map(
            (proposal) =>
              proposal.isVisible && (
                <CCard key={proposal.id} className="mb-4">
                  <CCardBody>
                    <CRow>
                      <CCol md={8}>
                        <h2>{proposal.title}</h2>
                        <p>{proposal.description}</p>
                        <p><strong>Client:</strong> {proposal.client}</p>
                        <p><strong>Field:</strong> {proposal.field}</p>
                      </CCol>
                      <CCol md={4} className="d-flex align-items-center justify-content-end">
                        {/* Horizontal Button Group */}
                        <CButtonGroup>
                          <CButton color="success" onClick={() => handleApprove(proposal.id)} className="mx-1">
                            <CIcon icon={cilCheckCircle} className="me-2" />
                            Approve
                          </CButton>
                          <CButton color="danger" onClick={() => handleReject(proposal.id)} className="mx-1">
                            <CIcon icon={cilXCircle} className="me-2" />
                            Reject
                          </CButton>
                          <CButton color="warning" onClick={() => handleRevise(proposal.id)} className="mx-1">
                            <CIcon icon={cilSync} className="me-2" />
                            Revise
                          </CButton>
                        </CButtonGroup>
                      </CCol>
                    </CRow>

                    {proposal.commentVisible && (
                      <div className="mt-4">
                        <p><strong>Comment:</strong></p>
                        <CFormTextarea
                          placeholder="Add your comments here..."
                          rows={4}
                          value={proposal.comment}
                          onChange={(e) => handleCommentChange(proposal.id, e.target.value)}
                        />
                        <CButton color="primary" className="mt-2" onClick={() => handleCommentDone(proposal.id)}>
                          Done
                        </CButton>
                      </div>
                    )}
                  </CCardBody>
                </CCard>
              )
          )}
        </CCardBody>
      </CCard>

      {/* Centralized Notification */}
      {notification && (
        <CAlert color="info" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
        }}>
          {notification}
        </CAlert>
      )}
    </CContainer>
  );
};

export default ProposalManagement;
