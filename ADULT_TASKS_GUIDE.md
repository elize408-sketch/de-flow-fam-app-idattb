
# Adult Tasks Feature Guide

## Overview

The Adult Tasks feature is a timeline-based task management system designed specifically for adult family members. It provides a calm, structured way to plan and manage daily tasks with time blocks, assignments, and smart features.

## Key Features

### 1. Timeline-Based View
- **Vertical daily timeline** showing tasks placed according to their time slots
- **Current time indicator** showing where you are in the day
- **Scrollable interface** for easy navigation through the day
- **Visual time blocks** making it easy to see task duration and spacing

### 2. Task Assignment to Adults
- **Multi-select assignment**: Tasks can be assigned to one or multiple adults
- **Visual indicators**: Colored avatar dots show who is responsible for each task
- **Unassigned tasks**: Tasks can be left unassigned for flexibility
- **Consistent colors**: Each adult has a unique color for easy identification

### 3. Filtering by Person
- **Toggle chips** at the top of the screen for quick filtering
- **"All" view**: Shows the complete household flow
- **Individual views**: Filter to see only tasks for a specific adult
- **Real-time updates**: Filters apply instantly

### 4. Recurring Tasks
- **Daily**: Tasks that repeat every day
- **Weekdays**: Monday through Friday only
- **Weekly**: Once per week
- **Monthly**: Once per month
- **Custom**: Select specific days of the week

### 5. Smart Features
- **Overlap detection**: Visual warnings when tasks overlap
- **Duration calculation**: Automatic calculation of task duration
- **Gap suggestions**: Identifies free time in the schedule
- **Completion tracking**: Mark tasks as complete with visual feedback

### 6. Task Details
Each task card displays:
- **Icon**: Context-based visual identifier
- **Title**: Clear task name
- **Time range**: Start and end times
- **Duration**: Calculated time in minutes
- **Assigned adults**: Avatar indicators
- **Recurrence**: Subtle repeat icon if applicable
- **Completion status**: Checkbox and visual state

## Database Schema

### Tasks Table Updates
```sql
-- New columns added to tasks table
ALTER TABLE tasks ADD COLUMN end_time text;
ALTER TABLE tasks ADD COLUMN duration_minutes integer;
ALTER TABLE tasks ADD COLUMN custom_days text[];
ALTER TABLE tasks ADD COLUMN is_adult_task boolean DEFAULT false;
```

### Task Assignments Table
```sql
-- New table for many-to-many relationship
CREATE TABLE task_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  family_member_id uuid NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, family_member_id)
);
```

## Usage

### Adding a Task
1. Tap the **+** button in the header
2. Enter task details:
   - **Task name** (required)
   - **Icon** (choose from predefined options)
   - **Start time** (required)
   - **End time** (optional, but recommended)
   - **Assign to** (select one or more adults)
   - **Repeat** (choose recurrence pattern)
   - **Notes** (optional additional information)
3. Tap **Add** to create the task

### Completing a Task
- Tap the green checkmark button on any task card
- The task will be marked as complete and visually muted
- Completed tasks remain visible for reference

### Deleting a Task
- Long-press on any task card
- Confirm deletion in the alert dialog

### Filtering Tasks
- Tap **"All"** to see all household tasks
- Tap an adult's name to see only their tasks
- The timeline updates instantly

### Navigating Dates
- Use **left/right arrows** to move between days
- Tap **"Today"** to jump back to the current date
- The date selector shows the current day clearly

## Design Principles

### Calm & Minimal
- Soft Flow Fam colors throughout
- Clean, breathable spacing
- No stress-inducing visuals
- Smooth animations and transitions

### Family-Aware
- Clear ownership of tasks
- Easy collaboration between adults
- Household-wide view available
- Individual accountability

### Smart & Helpful
- Automatic overlap detection
- Duration calculations
- Gap identification
- Recurrence support

## Technical Implementation

### Components
- **AdultTasksScreen**: Main timeline view component
- **Task Cards**: Individual task display with all details
- **Filter Chips**: Adult member selection
- **Add Task Modal**: Full-screen form for task creation
- **Time Pickers**: Native time selection (iOS/Android)

### State Management
- Local state for UI interactions
- Supabase for data persistence
- Real-time updates on changes
- Optimistic UI updates

### Performance
- Efficient filtering with useMemo
- Sorted tasks by time
- Minimal re-renders
- Smooth scrolling

## Future Enhancements

### Planned Features
- **AI suggestions**: Smart task recommendations based on patterns
- **Buffer time**: Automatic spacing between tasks
- **Task templates**: Quick creation from common patterns
- **Notifications**: Reminders before tasks start
- **Analytics**: Insights into task completion patterns
- **Drag & drop**: Reorder tasks visually
- **Week view**: See multiple days at once
- **Task notes**: Detailed information and attachments

### Integration Opportunities
- **Calendar sync**: Export to device calendar
- **Family notifications**: Alert other members of changes
- **Household tasks**: Link to household chores
- **Meal planning**: Integrate with meal schedule
- **Work schedules**: Coordinate with work hours

## Troubleshooting

### Tasks Not Showing
- Check that `is_adult_task` is set to `true` in the database
- Verify the `due_date` matches the selected date
- Ensure the family_id is correct

### Assignment Issues
- Check that `task_assignments` table has entries
- Verify family member IDs are correct
- Ensure RLS policies allow access

### Time Display Problems
- Verify time format is "HH:MM" (24-hour)
- Check that start_time and end_time are valid
- Ensure duration_minutes is calculated correctly

## Support

For issues or questions:
1. Check the database schema is up to date
2. Verify RLS policies are configured
3. Review console logs for errors
4. Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Author**: Flow Fam Development Team
