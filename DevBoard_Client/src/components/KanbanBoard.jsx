import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import KanbanColumn from './KanbanColumn'
import TaskCard     from './TaskCard'
import { useUpdateTask } from '../hooks/useTasks'

const statusColumns = ['todo', 'in-progress', 'in-review', 'done']

const columnLabels = {
  'todo':        'Todo',
  'in-progress': 'In Progress',
  'in-review':   'In Review',
  'done':        'Done',
}

const columnColors = {
  'todo':        'border-gray-700',
  'in-progress': 'border-blue-500/30',
  'in-review':   'border-yellow-500/30',
  'done':        'border-green-500/30',
}

const KanbanBoard = ({ tasks, projectId }) => {
  const updateTask    = useUpdateTask(projectId)
  const [activeTask, setActiveTask] = useState(null)

  // Sensors — how drag is initiated
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // must drag 8px before activating — prevents accidental drags
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,     // hold 200ms on touch
        tolerance: 5,
      },
    })
  )

  // Group tasks by status
  const tasksByStatus = statusColumns.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status)
    return acc
  }, {})

  const handleDragStart = (event) => {
    const { active } = event
    const task = tasks.find((t) => t._id === active.id)
    setActiveTask(task)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId      = active.id
    const overId      = over.id
    const activeTask  = tasks.find((t) => t._id === taskId)

    if (!activeTask) return

    // Determine target column
    // overId could be a column id or another task id
    let targetStatus = null

    if (statusColumns.includes(overId)) {
      // Dropped directly on a column
      targetStatus = overId
    } else {
      // Dropped on another task — use that task's status
      const overTask = tasks.find((t) => t._id === overId)
      if (overTask) targetStatus = overTask.status
    }

    if (!targetStatus || targetStatus === activeTask.status) return

    // Optimistically update UI — React Query will refetch
    try {
      await updateTask.mutateAsync({
        id:   taskId,
        data: { status: targetStatus },
      })
    } catch (err) {
      console.error('Failed to update task status:', err)
    }
  }

  const handleDragOver = (event) => {
    // Visual feedback handled by KanbanColumn
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map((status) => (
          <KanbanColumn
            key={status}
            id={status}
            title={columnLabels[status]}
            tasks={tasksByStatus[status]}
            projectId={projectId}
            borderColor={columnColors[status]}
          />
        ))}
      </div>

      {/* Drag overlay — shows the card being dragged */}
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 rotate-1 scale-105">
            <TaskCard
              task={activeTask}
              projectId={projectId}
              isDragging={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default KanbanBoard