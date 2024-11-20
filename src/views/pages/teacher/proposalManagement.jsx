import React, { useState, useEffect } from 'react';
import { CCard, CCardBody, CCardHeader, CButton, CRow, CCol, CFormTextarea, CContainer, CAlert, CButtonGroup } from '@coreui/react';
import { cilCheckCircle, cilXCircle, cilSync } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { db } from 'src/backend/firebase'; // Make sure you have firebase set up and this file imported correctly
import { collection, getDocs } from 'firebase/firestore';

const ProposalManagement = () => {
  const [selectedGroup, setSelectedGroup] = useState('group1'); // Default group
  const [proposalsByGroup, setProposalsByGroup] = useState({});
  const [notification, setNotification] = useState(null);

  // Fetch proposals from Firestore
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'proposals'));
        const fetchedProposals = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isVisible: true,
          commentVisible: false,
          comment: '', // Initialize comment field
        }));

        // Group proposals by groupID
        const groupedProposals = fetchedProposals.reduce((acc, proposal) => {
          const groupID = proposal.groupID; // Ensure 'groupID' field exists in your Firestore documents
          if (!acc[groupID]) {
            acc[groupID] = [];
          }
          acc[groupID].push(proposal);
          return acc;
        }, {});

        setProposalsByGroup(groupedProposals);
      } catch (error) {
        console.error('Error fetching proposals: ', error);
      }
    };

    fetchProposals();
  }, []);

  const handleGroupClick = (groupID) => {
    setSelectedGroup(groupID);
  };

  const handleApprove = (id) => {
    setProposalsByGroup((prevProposals) => ({
      ...prevProposals,
      [selectedGroup]: prevProposals[selectedGroup].map((proposal) =>
        proposal.id === id ? { ...proposal, status: 'approved', isVisible: false } : proposal
      ),
    }));
    showNotification('✔ Proposal Approved!');
  };

  const handleReject = (id) => {
    setProposalsByGroup((prevProposals) => ({
      ...prevProposals,
      [selectedGroup]: prevProposals[selectedGroup].map((proposal) =>
        proposal.id === id ? { ...proposal, status: 'rejected', isVisible: false } : proposal
      ),
    }));
    showNotification('✖ Proposal Rejected!');
  };

  const handleRevise = (id) => {
    setProposalsByGroup((prevProposals) => ({
      ...prevProposals,
      [selectedGroup]: prevProposals[selectedGroup].map((proposal) =>
        proposal.id === id ? { ...proposal, commentVisible: !proposal.commentVisible } : proposal
      ),
    }));
  };

  const handleCommentChange = (id, comment) => {
    setProposalsByGroup((prevProposals) => ({
      ...prevProposals,
      [selectedGroup]: prevProposals[selectedGroup].map((proposal) =>
        proposal.id === id ? { ...proposal, comment } : proposal
      ),
    }));
  };

  const handleCommentDone = (id) => {
    setProposalsByGroup((prevProposals) => ({
      ...prevProposals,
      [selectedGroup]: prevProposals[selectedGroup].map((proposal) =>
        proposal.id === id ? { ...proposal, commentVisible: false, isVisible: false } : proposal
      ),
    }));
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
        <CAlert
          color="info"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
          }}
        >
          {notification}
        </CAlert>
      )}
    </CContainer>
  );
};

export default ProposalManagement;
