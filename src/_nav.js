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

  const adviserItems = [
    {
      component: CNavItem,
      name: 'Schedule',
      to: '/scheduleAdviser',
      icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
    },
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
      name: 'Edit Profile',
      to: '/editProfileAdviser',
      icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
    },
  ]

  const teacherItems = [
    {
      component: CNavItem,
      name: 'Schedule',
      to: '/scheduleTeacher',
      icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
    },
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
    {
      component: CNavItem,
      name: 'Edit Profile',
      to: '/editProfileTeacher',
      icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
    },
  ]

  const studentItems = [
    {
      component: CNavItem,
      name: 'Schedule',
      to: '/scheduleStudent',
      icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
    },
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
    {
      component: CNavItem,
      name: 'Edit Profile',
      to: '/editProfileStudent',
      icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
    },
  ]

  const adminItems = [
    {
      component: CNavItem,
      name: 'Schedule',
      to: '/scheduleAdmin',
      icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Create Account',
      to: '/createAccount',
      icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Edit Profile',
      to: '/editProfileAdmin',
      icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
    },
  ]

  let roleBasedItems = []
  if (role === 'Student') roleBasedItems = [...studentItems]
  if (role === 'Teacher') roleBasedItems = [...teacherItems]
  if (role === 'Adviser') roleBasedItems = [...adviserItems]
  if (role === 'Admin') roleBasedItems = [...adminItems]

  return roleBasedItems
}

export default _nav
