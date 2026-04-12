import { useSortable } from '@dnd-kit/sortable'
import { CSS }         from '@dnd-kit/utilities'
import TaskCard        from './TaskCard'

const SortableTaskCard = ({ task, projectId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: { task },
  })

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.4 : 1,
    cursor:     isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      {/* Drag handle — top strip of the card */}
      <div
        {...listeners}
        className="flex items-center justify-center h-4 mb-1 cursor-grab active:cursor-grabbing rounded-t-lg hover:bg-gray-800 transition group"
        title="Drag to move"
      >
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="w-0.5 h-0.5 bg-gray-500 rounded-full"/>
          ))}
        </div>
      </div>

      <TaskCard
        task={task}
        projectId={projectId}
        isDragging={isDragging}
      />
    </div>
  )
}

export default SortableTaskCard