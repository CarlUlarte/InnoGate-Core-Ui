import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilCalendar,
  cilNoteAdd,
  cilUser,
  cilGroup,
  cilPencil,
  cilFolder,
  cilUserPlus,
  cilVoiceOverRecord,
  cilFile,
  cilSpreadsheet,
  cilPlus,
} from '@coreui/icons'
import { CNavItem } from '@coreui/react'
import { useRole } from 'src/RoleContext'

const _nav = () => {
  const role = useRole()

  const scheduleItem = {
    component: CNavItem,
    name: 'Schedule',
    to: '/schedule',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  }

  const editProfileItem = {
    component: CNavItem,
    name: 'Edit Profile',
    to: '/editProfile',
    icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
  }

  const adviserItems = [
    {
      component: CNavItem,
      name: 'Group Request',
      to: '/groupRequest',
      icon: <CIcon icon={cilVoiceOverRecord} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'View Manuscript',
      to: '/viewManuscript',
      icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Manage Group',
      to: '/manageGroup',
      icon: <CIcon icon={cilSpreadsheet} customClassName="nav-icon" />,
    },
  ]

  const teacherItems = [
    {
      component: CNavItem,
      name: 'My Students',
      to: '/myStudents',
      icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Proposal Management',
      to: '/proposalManagement',
      icon: <CIcon icon={cilFolder} customClassName="nav-icon" />,
    },
  ]

  const studentItems = [
    {
      component: CNavItem,
      name: 'Thesis Proposal',
      to: '/thesisProposal',
      icon: <CIcon icon={cilNoteAdd} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Upload Manuscript',
      to: '/uploadManuscript',
      icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Group Details',
      to: '/groupDetails',
      icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
    },
  ]

  const adminItems = [
    {
      component: CNavItem,
      name: 'Create Account',
      to: '/createAccount',
      icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
    },
  ]

  // Prepare the role-based items array
  let roleBasedItems = []
  if (role === 'Student') roleBasedItems = [...roleBasedItems, ...studentItems]
  if (role === 'Teacher') roleBasedItems = [...roleBasedItems, ...teacherItems]
  if (role === 'Adviser') roleBasedItems = [...roleBasedItems, ...adviserItems]
  if (role === 'Admin') roleBasedItems = [...roleBasedItems, ...adminItems]

  // Return the final array with Schedule at the top and Edit Profile at the bottom
  return [scheduleItem, ...roleBasedItems, editProfileItem]
}

export default _nav
