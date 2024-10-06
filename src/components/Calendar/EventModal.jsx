import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormSelect,
  CFormInput,
} from '@coreui/react'
import moment from 'moment'

const EventModal = ({
  isOpen,
  onRequestClose,
  event,
  selectedDate,
  saveEvent,
  deleteEvent,
  existingGroups,
  existingRooms,
}) => {
  const [title, setTitle] = useState('')
  const [room, setRoom] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setRoom(event.room)
      setStart(moment(event.start).format('YYYY-MM-DDTHH:mm'))
      setEnd(moment(event.end).format('YYYY-MM-DDTHH:mm'))
      setSelectedGroup(event.group)
    } else {
      setTitle('')
      setRoom('')
      setStart(moment(selectedDate).format('YYYY-MM-DDTHH:mm'))
      setEnd(moment(selectedDate).format('YYYY-MM-DDTHH:mm'))
      setSelectedGroup('')
    }
  }, [event, selectedDate])

  const handleSave = () => {
    if (!selectedGroup || !room) {
      alert('Selecting a group and a room is required!')
      return
    }

    const newEvent = {
      title: `${room} - ${selectedGroup}`,
      start: moment(start).toDate(),
      end: moment(end).toDate(),
      id: event ? event.id : Date.now(),
      group: selectedGroup,
      room: room,
    }
    saveEvent(newEvent)
  }

  const groupOptions = ['Group 1', 'Group 2', 'Group 3'].filter(
    (group) => !existingGroups.includes(group),
  )
  const roomOptions = ['Room 1', 'Room 2', 'Room 3']

  return (
    <CModal visible={isOpen} onClose={onRequestClose}>
      <CModalHeader closeButton>
        <CModalTitle>{event ? 'Edit Event' : 'Add Event'}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <label>Group:</label>
        <CFormSelect value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
          <option value="">Select Group</option>
          {groupOptions.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </CFormSelect>

        <label>Room:</label>
        <CFormSelect value={room} onChange={(e) => setRoom(e.target.value)}>
          <option value="">Select Room</option>
          {roomOptions.map((room) => (
            <option key={room} value={room}>
              {room}
            </option>
          ))}
        </CFormSelect>

        <label>Start Time:</label>
        <CFormInput
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />

        <label>End Time:</label>
        <CFormInput type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
      </CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={handleSave}>
          {event ? 'Update' : 'Save'}
        </CButton>
        {event && (
          <CButton color="danger" onClick={() => deleteEvent(event)}>
            Delete
          </CButton>
        )}
        <CButton color="secondary" onClick={onRequestClose}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default EventModal
