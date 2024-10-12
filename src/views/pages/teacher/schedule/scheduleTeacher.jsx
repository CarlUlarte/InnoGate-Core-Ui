import React, { useState, useRef, useEffect } from 'react'
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
} from '@coreui/react'
import { DocsExample } from 'src/components'
import MyCalendar from 'src/components/Calendar/MyCalendar'
import styles from './schedule.module.css'

export default function schedule({ showAddButton }) {
  return (
    <>
      <div className={styles.scheduleContainer}>
        <CCard>
          <CCardBody>
            <MyCalendar size="admin" selectable={true} showAddButton={true} isAdmin={true} />
          </CCardBody>
        </CCard>
      </div>
    </>
  )
}
