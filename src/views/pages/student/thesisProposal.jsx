import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CRow,
  CFormSelect,
  CContainer,
  CModal,
  CModalHeader,
  CModalFooter,
  CModalBody,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import CustomToast from 'src/components/Toast/CustomToast'
import { cilPlus, cilDataTransferDown } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { db } from 'src/backend/firebase' // Import Firestore config
import { collection, addDoc, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, getUserRole, storage } from 'src/backend/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const ThesisProposal = () => {
  const [forms, setForms] = useState([]) // Initialize with an empty array
  const [userRole, setUserRole] = useState(null)
  const [userGroupID, setUserGroupID] = useState(null) // State for user's groupID
  const [submittingIndex, setSubmittingIndex] = useState(null) // Track which button is currently submitting
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedFormIndex, setSelectedFormIndex] = useState(null)
  const [loading, setLoading] = useState(null)
  const [loadingStates, setLoadingStates] = useState({})
  const [fileUploadingStates, setFileUploadingStates] = useState({})
  const [toast, setToast] = useState(null)

  // Fetch user role and groupID when the component mounts
  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = auth.currentUser
      if (user) {
        const role = await getUserRole(user.uid)
        setUserRole(role)

        // Fetch the user's groupID from the 'users' collection
        const userDoc = doc(db, 'users', user.uid) // Assuming user information is stored in 'users' collection
        const userSnapshot = await getDoc(userDoc)
        if (userSnapshot.exists()) {
          setUserGroupID(userSnapshot.data().groupID) // Adjust based on your Firestore structure
        }
      }
    }

    fetchUserDetails()
  }, [])

  // Fetch proposals from Firestore when the component mounts
  useEffect(() => {
    const fetchProposals = async () => {
      if (!userGroupID) return // Wait for userGroupID to be set
      const querySnapshot = await getDocs(collection(db, 'proposals'))
      const proposalsData = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.groupID === userGroupID) {
          // Filter by user's groupID
          proposalsData.push({ id: doc.id, ...data })
        }
      })
      setForms(proposalsData) // Set forms to the fetched proposals
    }

    fetchProposals()
  }, [userGroupID]) // Depend on userGroupID to fetch proposals

  const getLoadingState = (index) => {
    return loadingStates[index] || false // Default to false if not set
  }

  const getFileUploadingState = (index) => {
    return fileUploadingStates[index] || false // Default to false if not set
  }

  // Firestore submission logic
  const handleSubmit = async () => {
    const index = selectedFormIndex
    if (userRole !== 'Student') {
      // Replace 'Student' with the actual role you want to check
      setToast({
        color: 'danger',
        message: `Error: ${error.message}`,
      })
      return
    }

    const form = forms[index]

    // Check if all fields are filled
    if (!form.title || !form.description || !form.client || !form.field || !form.abstractForm) {
      setToast({
        color: 'danger',
        message: `Please fill in all fields before submitting.`,
      })
      return
    }

    try {
      setLoading(true)
      // Set the submitting index for the current form
      setSubmittingIndex(index) // Set the current index to indicate which button is submitting

      if (form.id) {
        // Update the proposal in Firestore if it exists
        const proposalRef = doc(db, 'proposals', form.id) // Get the reference of the document to update
        await updateDoc(proposalRef, {
          ...form, // Update with current form data
          submitted: true, // Mark as submitted
        })

        // Immediately update the local state to reflect the submission
        setForms((prevForms) => {
          const updatedForms = [...prevForms]
          updatedForms[index] = { ...updatedForms[index], submitted: true, editable: false } // Update the specific form to indicate submission and make it uneditable
          return updatedForms
        })

        setToast({
          color: 'success',
          message: 'Proposal submitted!',
        })
      } else {
        setToast({
          color: 'danger',
          message: 'Please save your proposal before submitting.',
        }) // Prompt to save before submitting
      }
    } catch (error) {
      setToast({
        color: 'danger',
        message: `Error: ${error.message}`,
      })
    } finally {
      setSubmittingIndex(null)
      setLoading(false)
      setShowConfirmModal(false)
    }
  }

  const handleFieldChange = (index, field, value) => {
    setForms((prevForms) => {
      const updatedForms = [...prevForms]
      updatedForms[index] = { ...updatedForms[index], [field]: value } // Update field without affecting submitted state
      return updatedForms
    })
  }

  const handleFileUpload = async (file, index) => {
    if (!file) return // Exit if no file is provided

    // Create a storage reference
    const storageRef = ref(storage, `abstractForms/${file.name}`)

    try {
      setFileUploadingStates((prevStates) => ({ ...prevStates, [index]: true }))
      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file)

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref)

      // Update the form with the download URL
      setForms((prevForms) => {
        const updatedForms = [...prevForms]
        updatedForms[index] = { ...updatedForms[index], abstractForm: downloadURL } // Store the download URL in abstractForm
        console.log('Updated form:', updatedForms)
        return updatedForms
      })

      console.log('File uploaded successfully:', downloadURL)
    } catch (error) {
      setToast({
        color: 'danger',
        message: 'Error uploading file',
      })
    } finally {
      setFileUploadingStates((prevStates) => ({ ...prevStates, [index]: false }))
    }
  }

  const handleFileChange = (e, index) => {
    const file = e.target.files[0] // Get the selected file
    handleFileUpload(file, index) // Call the upload function
  }

  const addNewProposalForm = () => {
    setForms((prevForms) => [
      ...prevForms,
      {
        id: null,
        title: '',
        description: '',
        client: '',
        field: '',
        abstractForm: '',
        editable: true,
        submitted: false,
      }, // Add new empty form with no ID
    ])
  }

  const handleEdit = (index) => {
    setForms((prevForms) => {
      const updatedForms = [...prevForms]
      updatedForms[index] = { ...updatedForms[index], editable: true } // Set editable state to true
      return updatedForms
    })
  }
  const handleSave = async (index) => {
    const form = forms[index]
    console.log('Form values:', form)

    // Check if all fields are filled before saving
    if (!form.title || !form.description || !form.client || !form.field || !form.abstractForm) {
      setToast({
        color: 'danger',
        message: 'Please fill in all fields before saving',
      })
      return
    }

    try {
      setLoadingStates((prevStates) => ({ ...prevStates, [index]: true }))
      // If the form already has an ID, update it
      if (form.id) {
        const proposalRef = doc(db, 'proposals', form.id)
        await updateDoc(proposalRef, {
          title: form.title,
          description: form.description,
          client: form.client,
          field: form.field,
          abstractForm: form.abstractForm, // Ensure abstractForm contains the download URL
          groupID: userGroupID,
        })

        // Set the editable state to false after saving
        setForms((prevForms) => {
          const updatedForms = [...prevForms]
          updatedForms[index] = { ...updatedForms[index], editable: false }
          return updatedForms
        })
      } else {
        // Add a new proposal if it does not exist
        const newDoc = await addDoc(collection(db, 'proposals'), {
          title: form.title,
          description: form.description,
          client: form.client,
          field: form.field,
          abstractForm: form.abstractForm,
          groupID: userGroupID,
          submitted: false,
        })

        setForms((prevForms) =>
          prevForms.map((item, idx) =>
            idx === index ? { ...item, id: newDoc.id, editable: false } : item,
          ),
        )
      }
    } catch (error) {
      console.error('Error saving document:', error)
    } finally {
      setLoadingStates((prevStates) => ({ ...prevStates, [index]: false }))
    }
  }

  const openConfirmModal = (index) => {
    setSelectedFormIndex(index)
    setShowConfirmModal(true)
  }

  const renderForms = () => {
    return (
      <TransitionGroup>
        {forms.map((form, index) => (
          <CSSTransition key={index} timeout={500} classNames="fade">
            <CCol xs={12}>
              <CCard className="mb-4">
                <CCardHeader>
                  <strong>Thesis Proposal Form {index + 1}</strong>
                </CCardHeader>
                <CCardBody>
                  <CForm>
                    <div className="mb-3">
                      <CFormLabel>Title</CFormLabel>
                      <CFormInput
                        value={form.title}
                        onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
                        disabled={!form.editable}
                      />
                    </div>

                    {/* Description Field */}
                    <div className="mb-3">
                      <CFormLabel>Description</CFormLabel>
                      <CFormTextarea
                        rows={3}
                        value={form.description}
                        onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                        disabled={!form.editable}
                      />
                    </div>

                    <CRow>
                      <CCol md={4}>
                        <div className="mb-3">
                          <CFormLabel>Client</CFormLabel>
                          <CFormInput
                            value={form.client}
                            onChange={(e) => handleFieldChange(index, 'client', e.target.value)}
                            disabled={!form.editable}
                          />
                        </div>
                      </CCol>

                      <CCol md={4}>
                        <div className="mb-3">
                          <CFormLabel>Field</CFormLabel>
                          <CFormSelect
                            value={form.field}
                            onChange={(e) => handleFieldChange(index, 'field', e.target.value)}
                            disabled={!form.editable}
                          >
                            <option value="">Select Field</option>
                            <option value="field1">Field 1</option>
                            <option value="field2">Field 2</option>
                            <option value="field3">Field 3</option>
                            <option value="field4">Field 4</option>
                          </CFormSelect>
                        </div>
                      </CCol>
                      <CCol md={4}>
                        <div className="mb-3">
                          <CFormLabel>Abstract Form</CFormLabel>
                          <div className="custom-file-upload">
                            {getFileUploadingState(index) ? (
                              <div className="d-flex align-items-center">
                                <CSpinner size="sm" className="me-2" />
                                <span>Uploading...</span>
                              </div>
                            ) : (
                              <>
                                <input
                                  type="file"
                                  id={`fileInput-${index}`}
                                  onChange={(e) => {
                                    handleFileChange(e, index)
                                    setForms((prevForms) => {
                                      const updatedForms = [...prevForms]
                                      updatedForms[index].fileName = e.target.files[0]?.name || ''
                                      return updatedForms
                                    })
                                  }}
                                  style={{ display: 'none' }}
                                />
                                <CButton
                                  className="w-100"
                                  color="secondary"
                                  variant="outline"
                                  onClick={() =>
                                    document.getElementById(`fileInput-${index}`).click()
                                  }
                                  disabled={!form.editable}
                                >
                                  {form.abstractForm ? 'Change File' : 'Upload File'}
                                </CButton>
                                {form.abstractForm && (
                                  <small className="text-secondary ms-2">
                                    File Uploaded! {form.fileName && `(${form.fileName})`}
                                  </small>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </CCol>
                    </CRow>

                    {/* Buttons */}
                    <CRow className="mt-3">
                      <CCol className="d-flex justify-content-end">
                        {!form.submitted ? (
                          <>
                            {form.editable ? (
                              <CButton
                                style={{ marginRight: '10px' }}
                                color="success"
                                onClick={() => handleSave(index)}
                              >
                                {getLoadingState(index) ? (
                                  <>
                                    <CSpinner size="sm" /> Save
                                  </>
                                ) : (
                                  'Save'
                                )}
                              </CButton>
                            ) : (
                              <CButton
                                style={{ marginRight: '10px' }}
                                color="primary"
                                onClick={() => handleEdit(index)}
                              >
                                Edit
                              </CButton>
                            )}
                            <CButton
                              color="primary"
                              onClick={() => openConfirmModal(index)}
                              disabled={submittingIndex === index}
                            >
                              Submit
                            </CButton>
                          </>
                        ) : (
                          <CButton color="secondary" disabled>
                            Submitted
                          </CButton>
                        )}
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCol>
          </CSSTransition>
        ))}
      </TransitionGroup>
    )
  }

  const handleDownload = () => {
    const fileUrl = 'src/assets/TopicAbstractFormTemplate.docx'
    const link = document.createElement('a')
    link.href = fileUrl
    link.setAttribute('download', 'TopicAbstractFormTemplate.docx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <CContainer>
      {renderForms()}

      <div className="d-flex justify-content-center gap-3">
        <CButton onClick={handleDownload} color="primary" variant="outline" className="mb-3">
          <CIcon icon={cilDataTransferDown} /> Abstract Form Template
        </CButton>
        <CButton onClick={addNewProposalForm} color="primary" className="mb-3">
          <CIcon icon={cilPlus} /> Add New Proposal
        </CButton>
      </div>

      <CModal visible={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Submission</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to submit this proposal? This can't be undone.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSubmit}>
            {loading ? (
              <>
                <CSpinner size="sm" /> Confirm
              </>
            ) : (
              'Confirm'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      <CustomToast toast={toast} setToast={setToast} />
    </CContainer>
  )
}

export default ThesisProposal
