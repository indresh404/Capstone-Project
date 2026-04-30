# Project Issues and Enhancements

This document tracks current known glitches, static components that need dynamic integration, and planned future enhancements for the Schedula project.

## 🐛 Bug Fixes & UI Glitches

### 1. Sidebar Icon Overflow Issue
**Type:** UI/UX Glitch
**Description:** The icons within the navigation sidebar occasionally overflow or go out of the screen boundaries, especially on smaller viewports or when the sidebar is toggled. 
**Action Required:** Inspect the CSS flex/grid properties and ensure responsive constraints are properly applied to the sidebar container and its child icon elements.

## 🔄 Dynamic Integration Needed

### 2. Static Settings Page
**Type:** Feature Integration
**Description:** The current Settings page is completely static. User preferences, profile updates, and application configurations are not persisted or functional.
**Action Required:** Connect the Settings page UI to the backend API. Implement state management to reflect changes dynamically and ensure data is saved to the database.

### 3. Faculty Dashboard: Static Attendance and Request Systems
**Type:** Feature Integration
**Description:** On the Faculty Dashboard, both the Attendance System and the Request System are currently hardcoded/static mockups. They do not fetch real data or allow actual submissions.
**Action Required:** 
- Integrate the attendance module with the backend to record and fetch live attendance data.
- Connect the request system (e.g., leave requests, room changes) to the database and establish a proper approval workflow.

## 🚀 Enhancements & Future Scope

### 4. Implement "Coordinator" User Role
**Type:** New Feature / Role Management
**Description:** The system needs a dedicated "Coordinator" role with specific permissions distinct from regular faculty or administrators.
**Action Required:** 
- Add "Coordinator" to the user roles schema.
- Build a dedicated Coordinator Dashboard.
- Grant coordinators the authority to manage, update, and resolve conflicts in the timetable.

### 5. Automated Timetable Management (AI Agents)
**Type:** Advanced Feature
**Description:** Manual timetable generation is tedious and prone to conflicts. 
**Action Required:** Introduce intelligent agents or algorithms that can automatically generate, optimize, and manage the timetable. These agents should take constraints (faculty availability, room capacity, course requirements) into account to prevent overlapping schedules.

### 6. Mobile Application Port
**Type:** Platform Expansion
**Description:** To increase accessibility for students and faculty on the go, the web application needs a mobile counterpart.
**Action Required:** Plan and develop a cross-platform mobile application (e.g., using React Native or Flutter) that consumes the existing backend APIs, providing a native mobile experience for core features like viewing timetables and marking attendance.
