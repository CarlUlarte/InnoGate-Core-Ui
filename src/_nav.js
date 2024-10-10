import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilCalendar, cilNoteAdd, cilUser } from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'
import { useRole } from 'src/RoleContext' // Import the RoleContext

const _nav = () => {
  const role = useRole() // Get the user's role
  console.log(`Current Role in Nav: ${role}`) // Log the current role

  const generalItems = [
    {
      component: CNavItem,
      name: 'Schedule',
      to: '/schedule',
      icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Edit Profile',
      to: '/editProfile',
      icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
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
      icon: <CIcon icon={cilNoteAdd} customClassName="nav-icon" />,
    },
  ]

  const adminItems = [
    {
      component: CNavItem,
      name: 'Create Account',
      to: '/createAccount',
      icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    },
  ]

  // Combine role-specific items with general items
  let roleBasedItems = [...generalItems]
  if (role === 'Student') roleBasedItems = [...roleBasedItems, ...studentItems]
  // if (role === 'Teacher') roleBasedItems = [...roleBasedItems, ...teacherItems]
  // if (role === 'Adviser') roleBasedItems = [...roleBasedItems, ...adviserItems]
  if (role === 'Admin') roleBasedItems = [...roleBasedItems, ...adminItems]

  return roleBasedItems
}

export default _nav
