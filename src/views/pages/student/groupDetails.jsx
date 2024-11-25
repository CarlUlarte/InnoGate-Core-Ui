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
} from '@coreui/react'
import { collection, getDocs, query, where, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore'
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
  const [selectedAdviser, setSelectedAdviser] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [proposalId, setProposalId] = useState(null)
  const [groupID, setGroupID] = useState(null)
  const [isRequestPending, setIsRequestPending] = useState(false)

  useEffect(() => {
    const checkPendingRequest = async () => {
      if (!groupID) return;
      
      try {
        const requestsRef = collection(db, 'adviserRequests')
        const requestQuery = query(
          requestsRef, 
          where('groupID', '==', groupID),
          where('status', '==', 'pending')
        )
        const requestSnapshot = await getDocs(requestQuery)
        
        setIsRequestPending(!requestSnapshot.empty)
      } catch (error) {
        console.error('Error checking pending requests:', error)
      }
    }

    checkPendingRequest()
  }, [groupID])


  // Fetch group and thesis details
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        console.log('Starting to fetch group details...')
        const currentUser = auth.currentUser
        if (!currentUser) {
          console.log('No current user found')
          return
        }

        // First, get the current user's group ID
        const usersRef = collection(db, 'users')
        const userQuery = query(usersRef, where('uid', '==', currentUser.uid))
        const userSnapshot = await getDocs(userQuery)

        if (userSnapshot.empty) {
          console.log('No user document found')
          return
        }

        const userData = userSnapshot.docs[0].data()
        const userGroupID = userData.groupID

        if (!userGroupID) {
          console.log('User has no group ID')
          return
        }

        console.log('Found group ID:', userGroupID)
        setGroupID(userGroupID)

        // Fetch group members
        const membersQuery = query(usersRef, where('groupID', '==', userGroupID))
        const membersSnapshot = await getDocs(membersQuery)
        
        if (membersSnapshot.empty) {
          console.log('No members found for group:', userGroupID)
          return
        }

        const members = membersSnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            name: data.name || 'Unknown Name',
            email: data.email || 'No Email',
            role: data.role || 'Unknown Role'
          }
        }).filter(member => member.role === 'Student')

        // Fetch accepted proposal
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
          setProposalId(proposal.id)
          setSelectedAdviser(proposalData.adviser || '')
        }

        setGroup({
          members: members,
          thesisTitle: proposalData.title || '',
          thesisDescription: proposalData.description || '',
          client: proposalData.client || '',
          field: proposalData.field || '',
        })

      } catch (error) {
        console.error('Error fetching group details:', error)
      }
    }

    fetchGroupDetails()
  }, [])

  // Fetch advisers when modal opens
  useEffect(() => {
    const fetchAdvisers = async () => {
      try {
        const usersRef = collection(db, 'users')
        const adviserQuery = query(usersRef, where('role', '==', 'Adviser'))
        const adviserSnapshot = await getDocs(adviserQuery)

        const advisers = adviserSnapshot.docs.map((doc) => ({
          id: doc.id,
          uid: doc.data().uid,
          name: doc.data().name,
        }))
        

        setAdviserList(advisers)
      } catch (error) {
        console.error('Error fetching advisers:', error)
      }
    }

    if (modalVisible) {
      fetchAdvisers()
    }
  }, [modalVisible])

  const handleAdviserSelect = async (adviser) => {
    if (!groupID) {
      console.error('No group ID found')
      alert('Cannot send adviser request: No group found')
      return
    }

    try {
      // Get the current proposal data
      const proposalsRef = collection(db, 'proposals')
      const proposalQuery = query(
        proposalsRef,
        where('groupID', '==', groupID),
        where('status', '==', 'accepted')
      )
      const proposalSnapshot = await getDocs(proposalQuery)
      
      if (proposalSnapshot.empty) {
        alert('No accepted proposal found for this group')
        return
      }

      const proposalData = proposalSnapshot.docs[0].data()

      // Create adviser request document
      const requestsRef = collection(db, 'adviserRequests')
      await addDoc(requestsRef, {
        adviserUID: adviser.uid,
        groupID: groupID,
        status: 'pending',
        timestamp: serverTimestamp(),
        members: group.members,
        approvedProposal: {
          title: proposalData.title,
          description: proposalData.description,
          client: proposalData.client,
          field: proposalData.field
        }
      })

      setIsRequestPending(true)
      setModalVisible(false)
      alert('Adviser request sent successfully!')

    } catch (error) {
      console.error('Error sending adviser request:', error)
      alert('Failed to send adviser request: ' + error.message)
    }
  }

  return (
    <CContainer>
      <CRow className="my-4">
        <CCol md={4}>
          <CCard>
            <CCardHeader>
              <strong>Members</strong>
            </CCardHeader>
            <CCardBody>
              {group.members.length > 0 ? (
                <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                  {group.members.map((member, index) => (
                    <li key={index} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <CImage
                          src={defaultProfilePic}
                          width={30}
                          height={30}
                          alt="Profile Picture"
                          className="me-3"
                          style={{ border: '1px solid gray', borderRadius: '15px' }}
                        />
                        <div>
                          <div>{member.name}</div>
                          <div style={{ fontSize: '0.8em', color: '#666' }}>{member.email}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No members found in this group</p>
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={8}>
          <CCard className="mb-3">
            <CCardHeader>
              <strong>Thesis Information</strong>
            </CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <strong>Thesis Title: </strong>
                <span>{group.thesisTitle || 'No thesis title assigned'}</span>
              </div>
              <div className="mb-3">
                <strong>Description: </strong>
                <p>{group.thesisDescription || 'No description available'}</p>
              </div>
            </CCardBody>
          </CCard>

          <CRow>
            <CCol md={12} style={{ marginBottom: '15px' }}>
              <CCard>
                <CCardHeader>
                  <strong>Adviser</strong>
                </CCardHeader>
                <CCardBody>
                  {!selectedAdviser ? (
                    <CButton color="primary" onClick={() => setModalVisible(true)}>
                      Pick an Adviser
                    </CButton>
                  ) : (
                    <div>
                      <strong>Selected Adviser: </strong> {selectedAdviser}
                      <CButton
                        color="secondary"
                        onClick={() => setModalVisible(true)}
                        className="ms-3"
                      >
                        Change Adviser
                      </CButton>
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <strong>Client</strong>
                </CCardHeader>
                <CCardBody>
                  <span>{group.client || 'No client specified'}</span>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <strong>Field</strong>
                </CCardHeader>
                <CCardBody>
                  <span>{group.field || 'No field specified'}</span>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
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
              <li key={adviser.id} style={{ marginBottom: '10px' }}>
                <CButton
                  color="primary"
                  className="w-100 text-start"
                  onClick={() => handleAdviserSelect(adviser)}
                  disabled={isRequestPending}
                >
                  {adviser.name}
                </CButton>
              </li>
            ))}
          </ul>
        ) : (
          <p>No advisers available</p>
        )}
        {isRequestPending && (
          <div className="text-warning mt-3">
            You have a pending adviser request. Please wait for a response before selecting another adviser.
          </div>
        )}
      </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default GroupDetails