export interface StoredFacultyTask {
  id: string;
  facultyUid: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'ACADEMIC' | 'ATTENDANCE' | 'EVALUATION' | 'MEETING' | 'CLASS_INCHARGE' | 'OTHER';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredEmailDraft {
  id: string;
  facultyUid: string;
  recipients: string[];
  subject: string;
  body: string;
  status: 'DRAFT' | 'SENT' | 'DISCARDED';
  createdAt: Date;
  updatedAt: Date;
}

class TaskAndEmailStore {
  private tasks: Map<string, StoredFacultyTask> = new Map();
  private emailDrafts: Map<string, StoredEmailDraft> = new Map();

  constructor() {
    // Seed initial realistic tasks for default faculty user
    const defaultUid = 'D679ftp5r9QC8zzybJkGAokVZ2d2';

    const t1: StoredFacultyTask = {
      id: 'task-01',
      facultyUid: defaultUid,
      title: 'Review Midterm Question Paper for CS701 Cloud Computing',
      description: 'Prepare and finalize Unit 1-3 questions according to Bloom taxonomy.',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      priority: 'HIGH',
      category: 'EVALUATION',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const t2: StoredFacultyTask = {
      id: 'task-02',
      facultyUid: defaultUid,
      title: 'Verify Class Attendance Shortage List (< 75%)',
      description: 'Notify parents of students with shortage in B.Sc AI & ML Sec A.',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      priority: 'URGENT',
      category: 'CLASS_INCHARGE',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const t3: StoredFacultyTask = {
      id: 'task-03',
      facultyUid: defaultUid,
      title: 'Department Academic Council Meeting',
      description: 'Present progress on Industry Mini-Projects & Lab setups.',
      dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      priority: 'MEDIUM',
      category: 'MEETING',
      status: 'IN_PROGRESS',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set(t1.id, t1);
    this.tasks.set(t2.id, t2);
    this.tasks.set(t3.id, t3);
  }

  // Task operations
  getTasks(facultyUid: string): StoredFacultyTask[] {
    return Array.from(this.tasks.values())
      .filter((t) => t.facultyUid === facultyUid)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createTask(facultyUid: string, data: Partial<StoredFacultyTask>): StoredFacultyTask {
    const id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const task: StoredFacultyTask = {
      id,
      facultyUid,
      title: data.title || 'Untitled Academic Task',
      description: data.description || null,
      dueDate: data.dueDate || null,
      priority: data.priority || 'MEDIUM',
      category: data.category || 'ACADEMIC',
      status: data.status || 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  updateTask(taskId: string, facultyUid: string, updates: Partial<StoredFacultyTask>): StoredFacultyTask {
    const task = this.tasks.get(taskId);
    if (!task || task.facultyUid !== facultyUid) {
      throw new Error(`Task ${taskId} not found or unauthorized.`);
    }

    if (updates.title !== undefined) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.dueDate !== undefined) task.dueDate = updates.dueDate;
    if (updates.priority !== undefined) task.priority = updates.priority;
    if (updates.category !== undefined) task.category = updates.category;
    if (updates.status !== undefined) task.status = updates.status;
    task.updatedAt = new Date();

    return task;
  }

  deleteTask(taskId: string, facultyUid: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.facultyUid !== facultyUid) {
      return false;
    }
    return this.tasks.delete(taskId);
  }

  // Email draft operations
  getEmailDrafts(facultyUid: string): StoredEmailDraft[] {
    return Array.from(this.emailDrafts.values())
      .filter((d) => d.facultyUid === facultyUid)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createEmailDraft(facultyUid: string, data: Partial<StoredEmailDraft>): StoredEmailDraft {
    const id = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const draft: StoredEmailDraft = {
      id,
      facultyUid,
      recipients: data.recipients || [],
      subject: data.subject || 'Academic Communication',
      body: data.body || '',
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.emailDrafts.set(id, draft);
    return draft;
  }

  sendEmail(draftId: string | undefined, facultyUid: string, data: { recipients: string[]; subject: string; body: string }): { success: boolean; messageId: string } {
    if (draftId) {
      const draft = this.emailDrafts.get(draftId);
      if (draft && draft.facultyUid === facultyUid) {
        draft.status = 'SENT';
        draft.updatedAt = new Date();
      }
    }

    const messageId = `msg-out-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      success: true,
      messageId,
    };
  }
}

export const taskAndEmailStore = new TaskAndEmailStore();
export default taskAndEmailStore;
