import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CContainer,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
} from '@coreui/react'

// Group Details Component
const groupDetails = () => {
  // Dummy data for the group details
  const group = {
    members: [
      'Dominic Gunio',
      'Carl Ularte',
      'Coren Andino',
      'Joner De Silva',
      'Caren Tolentino',
      'Dexzor Navarro',
      'Lorem Ipsum',
    ], // Replace with real data later
    thesisTitle: 'Dancing Computational Technology',
    thesisDescription:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    client: 'Registrar', // Placeholder for client
    field: 'Computational Technology', // Placeholder for field
  }

  // Dummy data for advisers
  const advisersList = [
    'Dr. John Smith',
    'Prof. Alice Johnson',
    'Dr. Emily Williams',
    'Prof. Robert Brown',
  ]

  // State to handle modal visibility and selected adviser
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedAdviser, setSelectedAdviser] = useState('')

  // Function to handle adviser selection
  const handleAdviserChange = (adviser) => {
    setSelectedAdviser(adviser)
    setModalVisible(false) // Close the modal after selection
  }

  return (
    <CContainer>
      <CRow className="my-4">
        {/* Members */}
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
                      {/* replace this with an actual image */}
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#ddd',
                          marginRight: '10px',
                        }}
                      ></div>
                      <span>{member}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CCardBody>
          </CCard>
        </CCol>

        {/ Group Information */}
        <CCol md={8}>
          <CCard className="mb-3">
            <CCardHeader>
              <strong>Thesis Information</strong>
            </CCardHeader>
            <CCardBody>
              {/* Thesis Title */}
              <div className="mb-3">
                <strong>Thesis Title: </strong>
                <span>{group.thesisTitle}</span>
              </div>

              {/* Thesis Description */}
              <div className="mb-3">
                <strong>Description: </strong>
                <p>{group.thesisDescription}</p>
              </div>
            </CCardBody>
          </CCard>

          {/* Adviser Card */}
          <CRow className="mb-3">
            <CCol md={12}>
              <CCard>
                <CCardHeader>
                  <strong>Adviser</strong>
                </CCardHeader>
                <CCardBody>
                  <div className="d-flex justify-content-between">
                    {/* Display adviser information or buttons */}
                    {!selectedAdviser ? (
                      <CButton color="primary" onClick={() => setModalVisible(true)}>
                        Pick an Adviser
                      </CButton>
                    ) : (
                      <div>
                        <strong>Selected Adviser: </strong>
                        {selectedAdviser}
                      </div>
                    )}
                    {/* Conditionally show the change button */}
                    {selectedAdviser && (
                      <CButton color="secondary" onClick={() => setModalVisible(true)}>
                        Change Adviser
                      </CButton>
                    )}
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          {/* Client and Field Cards */}
          <CRow className="mb-3">
            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <strong>Client</strong>
                </CCardHeader>
                <CCardBody>
                  <span>{group.client}</span>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <strong>Field</strong>
                </CCardHeader>
                <CCardBody>
                  <span>{group.field}</span>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CCol>
      </CRow>

      {/* Modal for Adviser Selection */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <strong>Select Adviser</strong>
        </CModalHeader>
        <CModalBody>
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {advisersList.map((adviser, index) => (
              <li key={index} style={{ marginBottom: '10px' }}>
                <CButton color="secondary" onClick={() => handleAdviserChange(adviser)}>
                  {adviser}
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

export default groupDetails
