import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CContainer,
  CButton,
  CImage,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CAlert
} from '@coreui/react'
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from 'src/backend/firebase'

const defaultProfilePic = 'src/assets/images/avatars/pic.png'

const GroupDetails = () => {
  const [group, setGroup] = useState({
    members: [],
    thesisTitle: '',
    thesisDescription: '',
    client: '',
    field: '',
  })
  const [adviserList, setAdviserList] = useState([])
  const [selectedAdviser, setSelectedAdviser] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [groupID, setGroupID] = useState(null)
  const [adviserRejectionMessage, setAdviserRejectionMessage] = useState(null)
  const [rejectedAdviserUIDs, setRejectedAdviserUIDs] = useState([])
  const [requestStatus, setRequestStatus] = useState(null)

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) return

        const usersRef = collection(db, 'users')
        const userQuery = query(usersRef, where('uid', '==', currentUser.uid))
        const userSnapshot = await getDocs(userQuery)

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data()
          const userGroupID = userData.groupID

          if (userGroupID) {
            setGroupID(userGroupID)

            const membersQuery = query(usersRef, where('groupID', '==', userGroupID))
            const membersSnapshot = await getDocs(membersQuery)

            const members = membersSnapshot.docs.map(doc => ({
              name: doc.data().name || 'Unknown Name',
              email: doc.data().email || 'No Email',
              role: doc.data().role || 'Unknown Role'
            })).filter(member => member.role === 'Student')

            const proposalsRef = collection(db, 'proposals')
            const proposalQuery = query(
              proposalsRef,
              where('groupID', '==', userGroupID),
              where('status', '==', 'accepted')
            )
            const proposalSnapshot = await getDocs(proposalQuery)

            let proposalData = {}
            if (!proposalSnapshot.empty) {
              const proposal = proposalSnapshot.docs[0]
              proposalData = proposal.data()
            }

            setGroup({
              members,
              thesisTitle: proposalData.title || '',
              thesisDescription: proposalData.description || '',
              client: proposalData.client || '',
              field: proposalData.field || '',
            })

            // Fetch adviser request status
            const requestsRef = collection(db, 'adviserRequests')
            const requestQuery = query(requestsRef, where('groupID', '==', userGroupID))
            const requestSnapshot = await getDocs(requestQuery)

            if (!requestSnapshot.empty) {
              const requestData = requestSnapshot.docs[0].data()
              setSelectedAdviser({ uid: requestData.adviserUID, name: requestData.adviserName })
              setRequestStatus(requestData.status)

              if (requestData.status === 'rejected') {
                setRejectedAdviserUIDs([requestData.adviserUID])
                setAdviserRejectionMessage('Your adviser request was rejected. Please choose another adviser.')
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching group details:', error)
      }
    }

    fetchGroupDetails()
  }, [])

  useEffect(() => {
    const fetchAdvisers = async () => {
      try {
        const usersRef = collection(db, 'users')
        const adviserQuery = query(usersRef, where('role', '==', 'Adviser'))
        const adviserSnapshot = await getDocs(adviserQuery)

        const advisers = adviserSnapshot.docs.map(doc => ({
          id: doc.id,
          uid: doc.data().uid,
          name: doc.data().name,
        }))

        setAdviserList(advisers)
      } catch (error) {
        console.error('Error fetching advisers:', error)
      }
    }

    if (modalVisible) fetchAdvisers()
  }, [modalVisible])

  const handleSubmitRequest = async () => {
    if (!selectedAdviser || !groupID) {
      alert('Please select an adviser before submitting.')
      return
    }

    try {
      await addDoc(collection(db, 'adviserRequests'), {
        adviserUID: selectedAdviser.uid,
        adviserName: selectedAdviser.name,
        groupID,
        status: 'pending',
        timestamp: serverTimestamp(),
        members: group.members,
        approvedProposal: {
          title: group.thesisTitle,
          description: group.thesisDescription,
          client: group.client,
          field: group.field,
        },
      })

      setRequestStatus('pending')
      setModalVisible(false)
      alert('Adviser request submitted successfully!')
    } catch (error) {
      console.error('Error submitting adviser request:', error)
      alert('Failed to submit adviser request.')
    }
  }

  return (
    <CContainer>
      <CRow className="my-4">
        <CCol md={4}>
          <CCard>
            <CCardHeader><strong>Members</strong></CCardHeader>
            <CCardBody>
              {group.members.length > 0 ? (
                <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                  {group.members.map((member, index) => (
                    <li key={index} className="d-flex align-items-center mb-3">
                      <CImage
                        src={defaultProfilePic}
                        width={40}
                        height={40}
                        className="me-3 rounded-circle"
                      />
                      <div>
                        <strong>{member.name}</strong>
                        <div className="text-muted" style={{ fontSize: '0.9em' }}>{member.email}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No members found in this group.</p>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={8}>
          <CCard className="mb-3">
            <CCardHeader><strong>Thesis Information</strong></CCardHeader>
            <CCardBody>
              <div><strong>Title:</strong> {group.thesisTitle || 'No title assigned'}</div>
              <div><strong>Description:</strong> {group.thesisDescription || 'No description available'}</div>
            </CCardBody>
          </CCard>

          <CCard className="mb-3">
            <CCardHeader><strong>Client Information</strong></CCardHeader>
            <CCardBody>
              <div><strong>Client:</strong> {group.client || 'No client assigned'}</div>
            </CCardBody>
          </CCard>

          <CCard className="mb-3">
            <CCardHeader><strong>Field of Study</strong></CCardHeader>
            <CCardBody>
              <div><strong>Field:</strong> {group.field || 'No field assigned'}</div>
            </CCardBody>
          </CCard>

          <CCard>
            <CCardHeader><strong>Adviser</strong></CCardHeader>
            <CCardBody>
              {adviserRejectionMessage && (
                <>
                  <CAlert color="warning">{adviserRejectionMessage}</CAlert>
                  <CButton color="primary" onClick={() => setModalVisible(true)}>
                    Pick an Adviser
                  </CButton>
                </>
              )}
              {selectedAdviser && requestStatus !== 'rejected' && (
                <p>
                  <strong>Name:</strong> {selectedAdviser.name}{' '}
                  {requestStatus === 'pending' && <span className="text-warning">(Pending for approval)</span>}
                </p>
              )}
              {!adviserRejectionMessage && !selectedAdviser && (
                <CButton color="primary" onClick={() => setModalVisible(true)}>
                  Pick an Adviser
                </CButton>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Select an Adviser</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {adviserList.length > 0 ? (
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {adviserList.map((adviser) => (
              <li
                key={adviser.id}
                onClick={() => {
                  if (!rejectedAdviserUIDs.includes(adviser.uid)) {
                    setSelectedAdviser(adviser);
                    setAdviserRejectionMessage(null); // Clear rejection message
                  }
                }}
                style={{
                  cursor: rejectedAdviserUIDs.includes(adviser.uid) ? 'not-allowed' : 'pointer',
                  backgroundColor: selectedAdviser && selectedAdviser.uid === adviser.uid ? '#d1e7dd' : '#f8f9fa',
                  padding: '10px',
                  borderRadius: '5px',
                  marginBottom: '10px',
                  color: rejectedAdviserUIDs.includes(adviser.uid) ? 'gray' : 'black',
                }}
                className="d-flex justify-content-between align-items-center"
              >
                <span>{adviser.name}</span>
              </li>
            ))}
          </ul>
          ) : (
            <p>No advisers available at the moment.</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSubmitRequest}>Submit Request</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default GroupDetails
