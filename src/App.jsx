import { useCallback, useEffect, useState } from 'react';
import AppHeader from './components/layout/AppHeader.jsx';
import AnchorBoard from './components/anchors/AnchorBoard.jsx';
import KanbanBoard from './components/board/KanbanBoard.jsx';
import TaskModal from './components/tasks/TaskModal.jsx';
import TeamModal from './components/team/TeamModal.jsx';
import ProjectsModal from './components/projects/ProjectsModal.jsx';
import DeleteProjectModal from './components/projects/DeleteProjectModal.jsx';
import Toast from './components/feedback/Toast.jsx';
import { STAGES, DEFAULT_TEAM } from './constants/taskConfig.js';
import { PROJECTS } from './constants/projects.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useProjectLocalStorage } from './hooks/useProjectLocalStorage.js';

export default function App() {
  const [projects, setProjects] = useLocalStorage('vibetracker.projects', PROJECTS);
  const safeProjects = Array.isArray(projects) && projects.length > 0 ? projects : PROJECTS;

  const [projectId, setProjectId] = useLocalStorage('vibetracker.activeProject', 'vibecoding');
  const project = safeProjects.find((item) => item.id === projectId) || safeProjects[0];

  useEffect(() => {
    if (project && project.id !== projectId) {
      setProjectId(project.id);
    }
  }, [project, projectId, setProjectId]);

  const [tasks, setTasks] = useProjectLocalStorage(project.id, 'vibetracker.tasks', project.initialTasks);
  const [anchors, setAnchors] = useProjectLocalStorage(project.id, 'vibetracker.anchors', project.initialAnchors);
  const [team, setTeam] = useLocalStorage('vibetracker.team', DEFAULT_TEAM);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [deleteProjectTargetId, setDeleteProjectTargetId] = useState(null);
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
    const memberToRemove = safeTeam.find((m) => m.id === id);
    if (!memberToRemove) return;

    setTeam((previous) => {
      const current = Array.isArray(previous) && previous.length > 0 ? previous : DEFAULT_TEAM;
      return current.filter((m) => m.id !== id);
    });

    setTasks((previous) => {
      if (!Array.isArray(previous)) return previous;
      return previous.map((t) => (t.assignee === memberToRemove.name ? { ...t, assignee: 'Unassigned' } : t));
    });

    safeProjects.forEach((p) => {
      if (p.id === project.id) return;
      const key = p.id === 'vibecoding' ? 'vibetracker.tasks' : `vibetracker.project.${p.id}.tasks`;
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const updated = parsed.map((t) =>
              t.assignee === memberToRemove.name ? { ...t, assignee: 'Unassigned' } : t
            );
            window.localStorage.setItem(key, JSON.stringify(updated));
          }
        }
      } catch {
        /* ignore */
      }
    });
  }, [safeTeam, safeProjects, project.id, setTeam, setTasks]);

  // Ensure tasks assigned to removed members fallback to 'Unassigned'
  useEffect(() => {
    const validNames = new Set(safeTeam.map((m) => m.name));
    setTasks((previous) => {
      if (!Array.isArray(previous)) return previous;
      let changed = false;
      const next = previous.map((t) => {
        if (t.assignee && t.assignee !== 'Unassigned' && !validNames.has(t.assignee)) {
          changed = true;
          return { ...t, assignee: 'Unassigned' };
        }
        return t;
      });
      return changed ? next : previous;
    });
  }, [safeTeam, setTasks]);

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

      safeProjects.forEach((p) => {
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
  }, [project.id, safeProjects, setTeam, setTasks]);

  const showToast = useCallback((message, type = 'default') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const handleCreateProject = useCallback((newProject) => {
    setProjects((previous) => {
      const current = Array.isArray(previous) && previous.length > 0 ? previous : PROJECTS;
      return [...current, newProject];
    });
    setModalTask(undefined);
    setDraggingTaskId(null);
    setProjectId(newProject.id);
    showToast(`Project "${newProject.name}" created!`, 'success');
  }, [setProjects, setProjectId, showToast]);

  const handleDeleteProject = useCallback((projectToDeleteId) => {
    const targetProject = safeProjects.find((p) => p.id === projectToDeleteId);
    if (!targetProject) return;

    if (safeProjects.length <= 1) {
      showToast('Cannot delete the only remaining project board.', 'error');
      return;
    }

    const remainingProjects = safeProjects.filter((p) => p.id !== projectToDeleteId);

    if (project.id === projectToDeleteId) {
      const nextActive = remainingProjects[0];
      setModalTask(undefined);
      setDraggingTaskId(null);
      setProjectId(nextActive.id);
    }

    setProjects(remainingProjects);

    try {
      if (projectToDeleteId === 'vibecoding') {
        window.localStorage.removeItem('vibetracker.tasks');
        window.localStorage.removeItem('vibetracker.anchors');
      } else {
        window.localStorage.removeItem(`vibetracker.project.${projectToDeleteId}.tasks`);
        window.localStorage.removeItem(`vibetracker.project.${projectToDeleteId}.anchors`);
      }
    } catch {
      /* ignore */
    }

    showToast(`Project "${targetProject.name}" was permanently deleted.`, 'default');
  }, [safeProjects, project.id, setProjectId, setProjects, showToast]);

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
    <div className="flex min-h-screen flex-col bg-surface-page font-body text-text-primary">
      <AppHeader
        onAddTask={() => setModalTask(null)}
        currentProject={project}
        onOpenProjects={() => setIsProjectsModalOpen(true)}
        projectCount={safeProjects.length}
        teamCount={safeTeam.length}
        onOpenTeam={() => setIsTeamModalOpen(true)}
      />
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 pt-5 pb-0 md:px-8 md:py-7">
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
      <ProjectsModal
        isOpen={isProjectsModalOpen}
        projects={safeProjects}
        activeProjectId={project.id}
        activeTasks={safeTasks}
        onSelectProject={(nextProjectId) => {
          setModalTask(undefined);
          setDraggingTaskId(null);
          setProjectId(nextProjectId);
          const target = safeProjects.find((p) => p.id === nextProjectId);
          showToast(`Switched to project "${target?.name || nextProjectId}"`);
        }}
        onCreateProject={handleCreateProject}
        onOpenDeleteProject={(targetId) => {
          setDeleteProjectTargetId(targetId);
        }}
        onClose={() => setIsProjectsModalOpen(false)}
        onToast={showToast}
      />
      <DeleteProjectModal
        isOpen={Boolean(deleteProjectTargetId)}
        projects={safeProjects}
        activeProjectId={deleteProjectTargetId || project.id}
        activeTasksCount={safeTasks.length}
        onConfirmDelete={(targetId) => {
          handleDeleteProject(targetId);
          setDeleteProjectTargetId(null);
        }}
        onClose={() => setDeleteProjectTargetId(null)}
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

