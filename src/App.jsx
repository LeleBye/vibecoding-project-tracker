import { useCallback, useEffect, useState } from 'react';
import AppHeader from './components/layout/AppHeader.jsx';
import AnchorBoard from './components/anchors/AnchorBoard.jsx';
import KanbanBoard from './components/board/KanbanBoard.jsx';
import TaskModal from './components/tasks/TaskModal.jsx';
import TeamModal from './components/team/TeamModal.jsx';
import Toast from './components/feedback/Toast.jsx';
import { STAGES, DEFAULT_TEAM } from './constants/taskConfig.js';
import { PROJECTS } from './constants/projects.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useProjectLocalStorage } from './hooks/useProjectLocalStorage.js';

export default function App() {
  const [projectId, setProjectId] = useLocalStorage('vibetracker.activeProject', 'vibecoding');
  const project = PROJECTS.find((item) => item.id === projectId) || PROJECTS[0];
  const [tasks, setTasks] = useProjectLocalStorage(project.id, 'vibetracker.tasks', project.initialTasks);
  const [anchors, setAnchors] = useProjectLocalStorage(project.id, 'vibetracker.anchors', project.initialAnchors);
  const [team, setTeam] = useLocalStorage('vibetracker.team', DEFAULT_TEAM);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
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
  const safeTeam = Array.isArray(team) && team.length > 0 ? team : DEFAULT_TEAM;

  const handleAddTeammate = useCallback((newMember) => {
    setTeam((previous) => {
      const current = Array.isArray(previous) && previous.length > 0 ? previous : DEFAULT_TEAM;
      return [...current, newMember];
    });
  }, [setTeam]);

  const handleRemoveTeammate = useCallback((id) => {
    setTeam((previous) => {
      const current = Array.isArray(previous) && previous.length > 0 ? previous : DEFAULT_TEAM;
      return current.filter((m) => m.id !== id);
    });
  }, [setTeam]);

  const handleUpdateTeammate = useCallback((oldMember, updatedMember) => {
    setTeam((previous) => {
      const current = Array.isArray(previous) && previous.length > 0 ? previous : DEFAULT_TEAM;
      return current.map((m) => (m.id === oldMember.id ? updatedMember : m));
    });

    if (oldMember.name !== updatedMember.name) {
      setTasks((previous) => {
        if (!Array.isArray(previous)) return previous;
        return previous.map((t) => (t.assignee === oldMember.name ? { ...t, assignee: updatedMember.name } : t));
      });

      PROJECTS.forEach((p) => {
        if (p.id === project.id) return;
        const key = p.id === 'vibecoding' ? 'vibetracker.tasks' : `vibetracker.project.${p.id}.tasks`;
        try {
          const raw = window.localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const updated = parsed.map((t) =>
                t.assignee === oldMember.name ? { ...t, assignee: updatedMember.name } : t
              );
              window.localStorage.setItem(key, JSON.stringify(updated));
            }
          }
        } catch {
          /* ignore */
        }
      });
    }
  }, [project.id, setTeam, setTasks]);

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

  const handleAnchorChange = useCallback((id, changes) => {
    setAnchors((previous) => (
      (Array.isArray(previous) ? previous : project.initialAnchors).map((anchor) => (
        anchor.id === id ? { ...anchor, ...changes } : anchor
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
        teamCount={safeTeam.length}
        onOpenTeam={() => setIsTeamModalOpen(true)}
      />
      <main className="mx-auto max-w-[1600px] px-8 py-7">
        <AnchorBoard anchors={safeAnchors} onAnchorChange={handleAnchorChange} />
        <KanbanBoard
          tasks={safeTasks}
          draggingTaskId={draggingTaskId}
          onCardClick={setModalTask}
          onCopy={(_, type) => (
            type === 'error'
              ? showToast('Could not copy context. Check clipboard permissions and try again.', 'error')
              : showToast('Context copied. Hand it off to your AI tool.', 'success')
          )}
          onMoveTask={handleMoveTask}
          onDragStart={setDraggingTaskId}
          onDragEnd={() => setDraggingTaskId(null)}
        />
      </main>
      {modalTask !== undefined && (
        <TaskModal
          task={modalTask}
          team={safeTeam}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModalTask(undefined)}
          onToast={showToast}
        />
      )}
      <TeamModal
        isOpen={isTeamModalOpen}
        team={safeTeam}
        tasks={safeTasks}
        onAddTeammate={handleAddTeammate}
        onUpdateTeammate={handleUpdateTeammate}
        onRemoveTeammate={handleRemoveTeammate}
        onClose={() => setIsTeamModalOpen(false)}
        onToast={showToast}
      />
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
