import React, { useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { CButton } from '@coreui/react' // CoreUI Button
import { cilArrowLeft, cilArrowRight } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import EventModal from './EventModal' // Import your EventModal

const localizer = momentLocalizer(moment)

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [allEvents, setAllEvents] = useState(events || [])

  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start) // Pass the selected date to the modal
    setIsModalOpen(true) // Open the modal
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedDate(null)
  }

  const saveEvent = (newEvent) => {
    setAllEvents((prevEvents) => [...prevEvents, newEvent])
    setIsModalOpen(false)
  }

  const deleteEvent = (eventToDelete) => {
    setAllEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventToDelete.id))
    setIsModalOpen(false)
  }

  return (
    <div style={{ height: '75vh' }}>
      <Calendar
        localizer={localizer}
        events={allEvents}
        defaultView="month"
        views={['month']}
        components={{
          toolbar: CustomToolbar,
        }}
        selectable
        onSelectSlot={handleSelectSlot} // Handle date selection
        style={{ height: '100%' }}
      />
      <EventModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        selectedDate={selectedDate}
        saveEvent={saveEvent}
        deleteEvent={deleteEvent}
        existingGroups={allEvents.map((event) => event.group)} // Pass existing groups
        existingRooms={allEvents.map((event) => event.room)} // Pass existing rooms
      />
    </div>
  )
}

export default MyCalendar
