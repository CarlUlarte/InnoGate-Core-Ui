import React, { useState, useEffect } from 'react';
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
  CModalFooter
} from '@coreui/react';
import { cilCheckCircle, cilXCircle, cilSync } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { db } from 'src/backend/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const ProposalManagement = () => {
  const [selectedGroup, setSelectedGroup] = useState('group1');
  const [proposalsByGroup, setProposalsByGroup] = useState({});
  const [notification, setNotification] = useState(null);
  const [revisionModal, setRevisionModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [revisionComment, setRevisionComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'proposals'));
        const fetchedProposals = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isVisible: true,
          commentVisible: false,
          comment: doc.data().teacherComment || '',
        }));

        const groupedProposals = fetchedProposals.reduce((acc, proposal) => {
          const groupID = proposal.groupID;
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

  const handleApprove = async (id) => {
    try {
      const proposalRef = doc(db, 'proposals', id);
      await updateDoc(proposalRef, {
        status: 'approved',
        isEditable: false
      });

      setProposalsByGroup((prevProposals) => ({
        ...prevProposals,
        [selectedGroup]: prevProposals[selectedGroup].map((proposal) =>
          proposal.id === id ? { ...proposal, status: 'approved', isVisible: false } : proposal
        ),
      }));

      showNotification('✔ Proposal Approved!');
    } catch (error) {
      console.error('Error approving proposal:', error);
      showNotification('❌ Error approving proposal');
    }
  };

  const handleReject = async (id) => {
    try {
      const proposalRef = doc(db, 'proposals', id);
      await updateDoc(proposalRef, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        isEditable: false
      });

      setProposalsByGroup((prevProposals) => ({
        ...prevProposals,
        [selectedGroup]: prevProposals[selectedGroup].map((proposal) =>
          proposal.id === id ? { 
            ...proposal, 
            status: 'rejected',
            isEditable: false,
            isVisible: false 
          } : proposal
        ),
      }));

      showNotification('✖ Proposal Rejected!');
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      showNotification('❌ Error rejecting proposal');
    }
  };

  const handleRevise = (proposal) => {
    setSelectedProposal(proposal);
    setRevisionComment('');
    setRevisionModal(true);
  };

  const handleRevisionSubmit = async () => {
    if (!revisionComment.trim()) {
      showNotification('❌ Please add a comment for revision');
      return;
    }

    setLoading(true);
    try {
      const proposalRef = doc(db, 'proposals', selectedProposal.id);
      await updateDoc(proposalRef, {
        status: 'needs_revision',
        teacherComment: revisionComment,
        isEditable: true,
        lastUpdated: new Date().toISOString()
      });

      setProposalsByGroup((prevProposals) => ({
        ...prevProposals,
        [selectedGroup]: prevProposals[selectedGroup].map((proposal) =>
          proposal.id === selectedProposal.id ? {
            ...proposal,
            status: 'needs_revision',
            teacherComment: revisionComment,
            isEditable: true,
            isVisible: false
          } : proposal
        ),
      }));

      showNotification('✔ Revision requested successfully!');
      setRevisionModal(false);
    } catch (error) {
      console.error('Error requesting revision:', error);
      showNotification('❌ Error requesting revision');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 1500);
  };

  return (
    <CContainer fluid className="d-flex">
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
                        <CButtonGroup>
                          <CButton color="success" onClick={() => handleApprove(proposal.id)} className="mx-1">
                            <CIcon icon={cilCheckCircle} className="me-2" />
                            Approve
                          </CButton>
                          <CButton color="danger" onClick={() => handleReject(proposal.id)} className="mx-1">
                            <CIcon icon={cilXCircle} className="me-2" />
                            Reject
                          </CButton>
                          <CButton color="warning" onClick={() => handleRevise(proposal)} className="mx-1">
                            <CIcon icon={cilSync} className="me-2" />
                            Revise
                          </CButton>
                        </CButtonGroup>
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
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
          <CButton 
            color="primary" 
            onClick={handleRevisionSubmit}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Revision Request'}
          </CButton>
        </CModalFooter>
      </CModal>

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