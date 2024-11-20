import React from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { CButton } from '@coreui/react' // CoreUI Button
import { cilArrowLeft, cilArrowRight } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const localizer = momentLocalizer(moment)

// Custom Toolbar Component
const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV')
  }

  const goToNext = () => {
    toolbar.onNavigate('NEXT')
  }

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY')
  }

  return (
    <div
      className="rbc-toolbar"
      style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}
    >
      {/* Month label on the left */}
      <span
        className="rbc-toolbar-label"
        style={{
          fontSize: '30px',
          fontWeight: 'bold',
          textAlign: 'left',
          color: 'var(--cui-button-color)',
        }}
      >
        {toolbar.label}
      </span>

      {/* Navigation buttons on the right */}
      <div>
        <CButton onClick={goToBack} style={{ marginRight: '10px' }} className="calendar-button">
          <CIcon size="sm" icon={cilArrowLeft} style={{ marginRight: '3px' }} />
          <span>Back</span>
        </CButton>
        <CButton onClick={goToCurrent} style={{ marginRight: '10px' }} className="calendar-button">
          Today
        </CButton>
        <CButton onClick={goToNext} className="calendar-button">
          Next
          <CIcon size="sm" icon={cilArrowRight} style={{ marginLeft: '3px' }} />
        </CButton>
      </div>
    </div>
  )
}

const MyCalendar = ({ events }) => {
  return (
    <div style={{ height: '75vh' }}>
      <Calendar
        localizer={localizer}
        events={events}
        defaultView="month"
        views={['month']}
        components={{
          toolbar: CustomToolbar, // Use the custom toolbar
        }}
        style={{ height: '100%' }}
      />
    </div>
  )
}

export default MyCalendar
