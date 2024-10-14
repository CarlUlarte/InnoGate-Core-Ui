import React, { useState, useEffect } from 'react';
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
} from '@coreui/react';
import { cilPlus } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { db } from 'src/backend/firebase'; // Import Firestore config
import { collection, addDoc, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, getUserRole } from 'src/backend/firebase'; // Import Firebase Auth and user role function

const ThesisProposal = () => {
  const [forms, setForms] = useState([]); // Initialize with an empty array
  const [userRole, setUserRole] = useState(null);
  const [userGroupID, setUserGroupID] = useState(null); // State for user's groupID
  const [submittingIndex, setSubmittingIndex] = useState(null); // Track which button is currently submitting

  // Fetch user role and groupID when the component mounts
  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = auth.currentUser;
      if (user) {
        const role = await getUserRole(user.uid);
        setUserRole(role);

        // Fetch the user's groupID from the 'users' collection
        const userDoc = doc(db, 'users', user.uid); // Assuming user information is stored in 'users' collection
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          setUserGroupID(userSnapshot.data().groupID); // Adjust based on your Firestore structure
        }
      }
    };

    fetchUserDetails();
  }, []);

  // Fetch proposals from Firestore when the component mounts
  useEffect(() => {
    const fetchProposals = async () => {
      if (!userGroupID) return; // Wait for userGroupID to be set
      const querySnapshot = await getDocs(collection(db, 'proposals'));
      const proposalsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.groupID === userGroupID) { // Filter by user's groupID
          proposalsData.push({ id: doc.id, ...data });
        }
      });
      setForms(proposalsData); // Set forms to the fetched proposals
    };

    fetchProposals();
  }, [userGroupID]); // Depend on userGroupID to fetch proposals

  // Firestore submission logic
  const handleSubmit = async (index) => {
    if (userRole !== 'Student') { // Replace 'Student' with the actual role you want to check
      alert('You do not have permission to submit proposals.');
      return;
    }

    const form = forms[index];

    // Check if all fields are filled
    if (!form.title || !form.description || !form.client || !form.field) {
      alert('Please fill in all fields before submitting.');
      return;
    }

    try {
      // Set the submitting index for the current form
      setSubmittingIndex(index); // Set the current index to indicate which button is submitting

      if (form.id) {
        // Update the proposal in Firestore if it exists
        const proposalRef = doc(db, 'proposals', form.id); // Get the reference of the document to update
        await updateDoc(proposalRef, {
          ...form, // Update with current form data
          submitted: true, // Mark as submitted
        });

        // Immediately update the local state to reflect the submission
        setForms((prevForms) => {
          const updatedForms = [...prevForms];
          updatedForms[index] = { ...updatedForms[index], submitted: true, editable: false }; // Update the specific form to indicate submission and make it uneditable
          return updatedForms;
        });
      } else {
        alert('Please save your proposal before submitting.'); // Prompt to save before submitting
      }
    } catch (error) {
      console.error("Error submitting document: ", error);
    } finally {
      // Reset the submitting index after the submission is complete
      setSubmittingIndex(null);
    }
  };

  const handleFieldChange = (index, field, value) => {
    setForms((prevForms) => {
      const updatedForms = [...prevForms];
      updatedForms[index] = { ...updatedForms[index], [field]: value }; // Update field without affecting submitted state
      return updatedForms;
    });
  };

  const addNewProposalForm = () => {
    setForms((prevForms) => [
      ...prevForms,
      { id: null, title: '', description: '', client: '', field: '', editable: true, submitted: false }, // Add new empty form with no ID
    ]);
  };

  const handleEdit = (index) => {
    setForms((prevForms) => {
      const updatedForms = [...prevForms];
      updatedForms[index] = { ...updatedForms[index], editable: true }; // Set editable state to true
      return updatedForms;
    });
  };

  const handleSave = async (index) => {
    const form = forms[index];

    // Check if all fields are filled before saving
    if (!form.title || !form.description || !form.client || !form.field) {
      alert('Please fill in all fields before saving.');
      return;
    }

    try {
      // If the form already has an ID, we update it; otherwise, we ignore the save
      if (form.id) {
        const proposalRef = doc(db, 'proposals', form.id); // Get the reference of the document to update
        await updateDoc(proposalRef, {
          title: form.title,
          description: form.description,
          client: form.client,
          field: form.field,
          groupID: userGroupID, // Use the user's groupID here, if necessary
        });

        // Set the editable state to false after saving and switch buttons
        setForms((prevForms) => {
          const updatedForms = [...prevForms];
          updatedForms[index] = { ...updatedForms[index], editable: false }; // Make it uneditable after save
          return updatedForms;
        });
      } else {
        // Add a new proposal if it does not exist
        const newDoc = await addDoc(collection(db, 'proposals'), {
          title: form.title,
          description: form.description,
          client: form.client,
          field: form.field,
          groupID: userGroupID, // Use the user's groupID here, if necessary
          submitted: false, // Mark as not submitted
        });

        // Immediately update the local state to include the new document ID
        setForms((prevForms) =>
          prevForms.map((item, idx) =>
            idx === index ? { ...item, id: newDoc.id, editable: false } : item // Update the specific form with the new ID and make it uneditable
          )
        );
      }
    } catch (error) {
      console.error("Error saving document: ", error);
    }
  };

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
                    {/* Title Field */}
                    <div className="mb-3">
                      <CFormLabel>Title</CFormLabel>
                      <CFormInput
                        value={form.title}
                        onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
                        disabled={!form.editable} // Disable input if not editable
                      />
                    </div>

                    {/* Description Field */}
                    <div className="mb-3">
                      <CFormLabel>Description</CFormLabel>
                      <CFormTextarea
                        rows={3}
                        value={form.description}
                        onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                        disabled={!form.editable} // Disable textarea if not editable
                      />
                    </div>

                    {/* Client and Field (side by side) */}
                    <CRow>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel>Client</CFormLabel>
                          <CFormInput
                            value={form.client}
                            onChange={(e) => handleFieldChange(index, 'client', e.target.value)}
                            disabled={!form.editable} // Disable input if not editable
                          />
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel>Field</CFormLabel>
                          <CFormSelect
                            value={form.field}
                            onChange={(e) => handleFieldChange(index, 'field', e.target.value)}
                            disabled={!form.editable} // Disable select if not editable
                          >
                            <option value="">Select Field</option>
                            <option value="field1">Field 1</option>
                            <option value="field2">Field 2</option>
                            <option value="field3">Field 3</option>
                            <option value="field4">Field 4</option>
                            {/* Add more options as necessary */}
                          </CFormSelect>
                        </div>
                      </CCol>
                    </CRow>

                    {/* Buttons */}
                    <CRow className="mt-3">
                      <CCol className="d-flex justify-content-end">
                        {!form.submitted ? (
                          <>
                            {form.editable ? (
                              <CButton style={{ marginRight: '10px' }} color="success" onClick={() => handleSave(index)}>
                                Save
                              </CButton>
                            ) : (
                              <CButton style={{ marginRight: '10px' }} color="primary" onClick={() => handleEdit(index)}>
                                Edit
                              </CButton>
                            )}
                            <CButton
                              color="primary"
                              onClick={() => handleSubmit(index)}
                              disabled={submittingIndex === index} // Disable submit button during submission
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
    );
  };

  return (
    
  <CContainer>
    {renderForms()}

    <div className="d-flex justify-content-end">
      <CButton onClick={addNewProposalForm} color="primary" className="mb-3">
        <CIcon icon={cilPlus} /> Add New Proposal
      </CButton>
    </div>
  </CContainer>
);
};

export default ThesisProposal;
