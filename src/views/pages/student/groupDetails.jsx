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
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore'
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

  // Fetch group and thesis details
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) return

        const usersRef = collection(db, 'users')
        const userQuery = query(
          usersRef,
          where('uid', '==', currentUser.uid),
          where('role', '==', 'Student'),
        )
        const userSnapshot = await getDocs(userQuery)

        if (userSnapshot.empty) return

        const user = userSnapshot.docs[0].data()
        const groupID = user.groupID
        if (!groupID) return

        // Fetch group members
        const membersQuery = query(
          usersRef,
          where('groupID', '==', groupID),
          where('role', '==', 'Student'),
        )
        const membersSnapshot = await getDocs(membersQuery)
        const members = membersSnapshot.docs.map((doc) => doc.data().name)

        // Fetch accepted proposal
        const proposalsRef = collection(db, 'proposals')
        const proposalQuery = query(
          proposalsRef,
          where('groupID', '==', groupID),
          where('status', '==', 'accepted'),
        )
        const proposalSnapshot = await getDocs(proposalQuery)

        if (proposalSnapshot.empty) return

        const proposal = proposalSnapshot.docs[0]
        const proposalData = proposal.data()

        setProposalId(proposal.id)
        setSelectedAdviser(proposalData.adviser || '') // Set adviser if exists
        setGroup({
          members,
          thesisTitle: proposalData.title,
          thesisDescription: proposalData.description,
          client: proposalData.client,
          field: proposalData.field,
        })
      } catch (error) {
        console.error('Error fetching group details:', error)
      }
    }

    fetchGroupDetails()
  }, [])

  // Fetch advisers
  useEffect(() => {
    const fetchAdvisers = async () => {
      try {
        const usersRef = collection(db, 'users')
        const adviserQuery = query(usersRef, where('role', '==', 'Adviser'))
        const adviserSnapshot = await getDocs(adviserQuery)

        const advisers = adviserSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }))

        setAdviserList(advisers)
      } catch (error) {
        console.error('Error fetching advisers:', error)
      }
    }

    fetchAdvisers()
  }, [])

  // Handle adviser selection
  const handleAdviserSelect = async (adviser) => {
    if (!proposalId) return

    try {
      const proposalRef = doc(db, 'proposals', proposalId)
      await updateDoc(proposalRef, { adviser })

      setSelectedAdviser(adviser) // Update state with the selected adviser
      setModalVisible(false) // Close modal
    } catch (error) {
      console.error('Error assigning adviser to the proposal:', error)
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
                      <span>{member}</span>
                    </div>
                  </li>
                ))}
              </ul>
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
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {adviserList.map((adviser) => (
              <li key={adviser.id} style={{ marginBottom: '10px' }}>
                <CButton color="link" onClick={() => handleAdviserSelect(adviser.name)}>
                  {adviser.name}
                </CButton>
              </li>
            ))}
          </ul>
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
