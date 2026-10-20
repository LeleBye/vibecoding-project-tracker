import { useCallback, useEffect, useState } from 'react';
import AppHeader from './components/layout/AppHeader.jsx';
import AnchorBoard from './components/anchors/AnchorBoard.jsx';
import KanbanBoard from './components/board/KanbanBoard.jsx';
import TaskModal from './components/tasks/TaskModal.jsx';
import Toast from './components/feedback/Toast.jsx';
import { STAGES } from './constants/taskConfig.js';
import { PROJECTS } from './constants/projects.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useProjectLocalStorage } from './hooks/useProjectLocalStorage.js';

export default function App() {
  const [projectId, setProjectId] = useLocalStorage('vibetracker.activeProject', 'vibecoding');
  const project = PROJECTS.find((item) => item.id === projectId) || PROJECTS[0];
  const [tasks, setTasks] = useProjectLocalStorage(project.id, 'vibetracker.tasks', project.initialTasks);
  const [anchors, setAnchors] = useProjectLocalStorage(project.id, 'vibetracker.anchors', project.initialAnchors);
  const [modalTask, setModalTask] = useState(undefined);
  const [toast, setToast] = useState(null);
  const [draggingTaskId, setDraggingTaskId] = useState(null);

  useEffect(() => {
    if (tasks === null) setTasks(project.initialTasks);
  }, [project.initialTasks, tasks, setTasks]);

  useEffect(() => {
    const clearDragState = () => setDraggingTaskId(null);
    window.addEventListener('dragend', clearDragState);
    window.addEventListener('drop', clearDragState);
    return () => {
      window.removeEventListener('dragend', clearDragState);
      window.removeEventListener('drop', clearDragState);
    };
  }, []);

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeAnchors = Array.isArray(anchors) ? anchors : project.initialAnchors;

  const showToast = useCallback((message, type = 'default') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const handleSave = useCallback((saved) => {
    setTasks((previous) => {
      const current = Array.isArray(previous) ? previous : [];
      const index = current.findIndex((task) => task.id === saved.id);
      if (index < 0) return [...current, saved];
      const next = [...current];
      next[index] = saved;
      return next;
    });
  }, [setTasks]);

  const handleDelete = useCallback((id) => {
    setTasks((previous) => (
      Array.isArray(previous) ? previous.filter((task) => task.id !== id) : []
    ));
  }, [setTasks]);

  const handleMoveTask = useCallback((taskId, newStatus, targetTaskId = null) => {
    setDraggingTaskId(null);
    setTasks((previous) => {
      const current = Array.isArray(previous) ? [...previous] : [];
      const taskIndex = current.findIndex((task) => task.id === taskId);
      if (taskIndex < 0) return previous;

      const task = current[taskIndex];
      const statusChanged = task.status !== newStatus;
      const updatedTask = { ...task, status: newStatus };
      current.splice(taskIndex, 1);

      const targetIndex = targetTaskId
        ? current.findIndex((item) => item.id === targetTaskId)
        : -1;
      if (targetIndex >= 0) current.splice(targetIndex, 0, updatedTask);
      else current.push(updatedTask);

      if (statusChanged) {
        const stage = STAGES.find((item) => item.id === newStatus);
        showToast(`Task moved to ${stage?.label || newStatus}`);
      }
      return current;
    });
  }, [setTasks, showToast]);

  const handleAnchorChange = useCallback((id, url) => {
    setAnchors((previous) => (
      (Array.isArray(previous) ? previous : project.initialAnchors).map((anchor) => (
        anchor.id === id ? { ...anchor, url } : anchor
      ))
    ));
  }, [project.initialAnchors, setAnchors]);

  return (
    <div className="min-h-screen bg-surface-page font-body text-text-primary">
      <AppHeader
        onAddTask={() => setModalTask(null)}
        projects={PROJECTS}
        projectId={project.id}
        onProjectChange={(nextProjectId) => {
          setModalTask(undefined);
          setDraggingTaskId(null);
          setProjectId(nextProjectId);
        }}
      />
      <main className="mx-auto max-w-[1600px] px-8 py-7">
        <AnchorBoard anchors={safeAnchors} onAnchorChange={handleAnchorChange} />
        <KanbanBoard
          tasks={safeTasks}
          draggingTaskId={draggingTaskId}
          onCardClick={setModalTask}
          onCopy={() => showToast('Context copied. Hand it off to your AI tool.', 'success')}
          onMoveTask={handleMoveTask}
          onDragStart={setDraggingTaskId}
          onDragEnd={() => setDraggingTaskId(null)}
        />
      </main>
      {modalTask !== undefined && (
        <TaskModal
          task={modalTask}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModalTask(undefined)}
          onToast={showToast}
        />
      )}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
