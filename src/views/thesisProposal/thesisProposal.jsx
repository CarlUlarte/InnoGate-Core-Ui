import React, { useState } from 'react'
import {
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
} from '@coreui/react'

const thesisProposal = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client: '',
    field: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would send formData to your backend or API for processing
    console.log('Submitted Data:', formData)
  }

  return (
    <CCard>
      <CCardHeader>Submit Thesis Proposal</CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <div className="mb-3">
            <CFormLabel htmlFor="title">Title</CFormLabel>
            <CFormInput
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="description">Description</CFormLabel>
            <CFormTextarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="client">Client</CFormLabel>
            <CFormInput
              type="text"
              id="client"
              name="client"
              value={formData.client}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="field">Field</CFormLabel>
            <CFormInput
              type="text"
              id="field"
              name="field"
              value={formData.field}
              onChange={handleChange}
              required
            />
          </div>

          <CButton type="submit" color="primary">
            Submit Proposal
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default thesisProposal
