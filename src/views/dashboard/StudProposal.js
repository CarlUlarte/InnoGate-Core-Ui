import React, { useState } from 'react';
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
  CContainer
} from '@coreui/react';
import { cilPlus } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

const StudProposal = () => {
  // Track the forms and their submission statuses
  const [forms, setForms] = useState([
    { id: 1, submitted: false, fields: { title: '', description: '', client: '', field: '' } }
  ]);

  // Add a new form to the list
  const addForm = () => {
    setForms([...forms, { id: forms.length + 1, submitted: false, fields: { title: '', description: '', client: '', field: '' } }]);
  };

  // Handle form field changes
  const handleFieldChange = (index, field, value) => {
    const updatedForms = [...forms];
    updatedForms[index].fields[field] = value;
    setForms(updatedForms);
  };

  // Handle form submission
  const handleSubmit = (index) => {
    const form = forms[index];
    const { title, description, client, field } = form.fields;

    // Check if all fields are filled
    if (!title || !description || !client || !field) {
      alert('Please fill in all fields before submitting.');
      return;
    }

    // Mark the form as submitted
    const updatedForms = [...forms];
    updatedForms[index].submitted = true;
    setForms(updatedForms);
  };

  // Render all the forms
  const renderForms = () => {
    return (
      <TransitionGroup>
        {forms.map((form, index) => (
          <CSSTransition
            key={form.id}
            timeout={500}
            classNames="fade"
          >
            <CCol xs={12}>
              <CCard className="mb-4">
                <CCardHeader>
                  <strong>Topic Proposal Form {form.id}</strong>
                </CCardHeader>
                <CCardBody>
                  <CForm>
                    {/* Title Field */}
                    <div className="mb-3">
                      <CFormLabel htmlFor={`titleInput${index}`}>Title</CFormLabel>
                      <CFormInput
                        id={`titleInput${index}`}
                        value={form.fields.title}
                        onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
                        disabled={form.submitted}
                      />
                    </div>

                    {/* Description Field */}
                    <div className="mb-3">
                      <CFormLabel htmlFor={`descriptionTextarea${index}`}>Description</CFormLabel>
                      <CFormTextarea
                        id={`descriptionTextarea${index}`}
                        rows={3}
                        value={form.fields.description}
                        onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                        disabled={form.submitted}
                      />
                    </div>

                    {/* Client and Field (side by side) */}
                    <CRow>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel htmlFor={`clientInput${index}`}>Client</CFormLabel>
                          <CFormInput
                            id={`clientInput${index}`}
                            value={form.fields.client}
                            onChange={(e) => handleFieldChange(index, 'client', e.target.value)}
                            disabled={form.submitted}
                          />
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="mb-3">
                          <CFormLabel htmlFor={`fieldSelect${index}`}>Field</CFormLabel>
                          <CFormSelect
                            id={`fieldSelect${index}`}
                            value={form.fields.field}
                            onChange={(e) => handleFieldChange(index, 'field', e.target.value)}
                            disabled={form.submitted}
                          >
                            <option value="">Choose a field...</option>
                            <option value="field1">Field 1</option>
                            <option value="field2">Field 2</option>
                            <option value="field3">Field 3</option>
                          </CFormSelect>
                        </div>
                      </CCol>
                    </CRow>

                    {/* Submit Button next to form */}
                    <CRow className="justify-content-end">
                      <CCol xs="auto">
                        <CButton
                          color={form.submitted ? 'secondary' : 'success'}
                          onClick={() => handleSubmit(index)}
                          disabled={form.submitted}
                        >
                          {form.submitted ? 'Submitted' : 'Submit'}
                        </CButton>
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
      {/* Inline style for animation */}
      <style>
        {`
          .fade-enter {
            opacity: 0;
            transform: scale(0.9);
          }
          .fade-enter-active {
            opacity: 1;
            transform: scale(1);
            transition: opacity 500ms, transform 500ms;
          }
          .fade-exit {
            opacity: 1;
          }
          .fade-exit-active {
            opacity: 0;
            transition: opacity 500ms;
          }
        `}
      </style>

      {renderForms()}

      {/* Floating circular button above the footer */}
      <CButton
        onClick={addForm}
        color="primary"
        className="circular-button"
        style={{
          position: 'fixed',
          bottom: '60px',  // Adjusted position to be above the footer
          right: '20px',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '24px',
        }}
      >
        <CIcon icon={cilPlus} size="lg" />
      </CButton>
    </CContainer>
  );
};

export default StudProposal;
