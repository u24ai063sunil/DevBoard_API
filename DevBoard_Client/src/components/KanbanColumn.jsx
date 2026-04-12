import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import SortableTaskCard from './SortableTaskCard'

const KanbanColumn = ({ id, title, tasks, projectId, borderColor }) => {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`border rounded-xl p-4 transition-colors duration-200 ${borderColor} ${
        isOver
          ? 'bg-indigo-500/5 border-indigo-500/50'
          : 'bg-gray-900'
      }`}
    >
      {/* Column header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <SortableContext
        items={tasks.map((t) => t._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 min-h-16">
          {tasks.length === 0 ? (
            <div className={`rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
              isOver
                ? 'border-indigo-500/50 bg-indigo-500/5'
                : 'border-gray-700'
            }`}>
              <p className="text-gray-600 text-xs">
                {isOver ? 'Drop here' : 'No tasks'}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task._id}
                task={task}
                projectId={projectId}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export default KanbanColumn