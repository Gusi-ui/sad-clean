'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/database';

interface Note {
  id: string;
  assignment_id: string;
  worker_id: string;
  content: string;
  created_at: string | null;
  updated_at: string | null;
  assignment?: {
    users?: {
      name: string | null;
      surname: string | null;
    } | null;
  } | null;
}

interface AssignmentRow {
  id: string;
  assignment_type: string;
  schedule: unknown;
  start_date: string;
  end_date: string | null;
  users?: { name: string | null; surname: string | null } | null;
}

// Componente para crear/editar una nota
const NoteEditor = (props: {
  assignmentId: string;
  assignmentLabel: string;
  existingNote?: Note | null;
  onSave: (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isEditing: boolean;
}): React.JSX.Element => {
  const {
    assignmentId,
    assignmentLabel,
    existingNote,
    onSave,
    onCancel,
    isEditing,
  } = props;
  const [content, setContent] = useState(existingNote?.content ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = (): void => {
    if (content.trim() === '') return;

    setIsSubmitting(true);
    try {
      onSave({
        assignment_id: assignmentId,
        worker_id: '', // Se establecerá en el componente padre
        content: content.trim(),
      });
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    setContent(existingNote?.content ?? '');
    onCancel();
  };

  return (
    <div className='bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm'>
      <div className='mb-3'>
        <h3 className='text-base sm:text-lg font-semibold text-gray-900'>
          {isEditing ? '✏️ Editar Nota' : '📝 Nueva Nota'}
        </h3>
        <p className='text-xs sm:text-sm text-gray-600'>
          Servicio: {assignmentLabel}
        </p>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder='Escribe tus notas sobre este servicio...'
        className='w-full h-24 sm:h-32 p-2 sm:p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base'
        disabled={isSubmitting}
      />

      <div className='flex justify-end space-x-2 mt-3'>
        <Button
          variant='outline'
          size='sm'
          onClick={handleCancel}
          disabled={isSubmitting}
          className='text-xs sm:text-sm'
        >
          Cancelar
        </Button>
        <Button
          size='sm'
          onClick={handleSave}
          disabled={content.trim() === '' || isSubmitting}
          className='text-xs sm:text-sm'
        >
          {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </div>
  );
};

// Componente para mostrar una nota
const NoteCard = (props: {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}): React.JSX.Element => {
  const { note, onEdit, onDelete } = props;
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string | null): string => {
    if (dateString === null || dateString === '') return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = (): void => {
    // eslint-disable-next-line no-alert
    if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) return;

    setIsDeleting(true);
    try {
      onDelete(note.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm'>
      <div className='flex items-start justify-between mb-3'>
        <div className='flex-1'>
          <h3 className='text-base sm:text-lg font-semibold text-gray-900'>
            📝 Nota del Servicio
          </h3>
          <p className='text-xs sm:text-sm text-gray-600'>
            {(() => {
              const userName = note.assignment?.users?.name;
              const userSurname = note.assignment?.users?.surname;
              return userName !== null &&
                userSurname !== null &&
                userName !== '' &&
                userSurname !== ''
                ? `${userName} ${userSurname}`
                : 'Servicio';
            })()}
          </p>
        </div>
        <div className='text-xs text-gray-500 ml-2'>
          {formatDate(note.created_at)}
        </div>
      </div>

      <div className='bg-gray-50 rounded-lg p-2 sm:p-3 mb-3'>
        <p className='text-gray-800 whitespace-pre-wrap text-sm sm:text-base'>
          {note.content}
        </p>
      </div>

      <div className='flex justify-end space-x-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onEdit(note)}
          disabled={isDeleting}
          className='text-xs sm:text-sm'
        >
          <span className='hidden sm:inline'>✏️ Editar</span>
          <span className='sm:hidden'>✏️</span>
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={handleDelete}
          disabled={isDeleting}
          className='text-red-600 hover:text-red-700 text-xs sm:text-sm'
        >
          {isDeleting ? (
            'Eliminando...'
          ) : (
            <>
              <span className='hidden sm:inline'>🗑️ Eliminar</span>
              <span className='sm:hidden'>🗑️</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default function NotesPage(): React.JSX.Element {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(
    null
  );

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (user?.email === undefined) {
        setAssignments([]);
        setNotes([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Buscar trabajadora por email
        const { data: workerData, error: workerError } = await supabase
          .from('workers')
          .select('id')
          .ilike('email', user.email)
          .maybeSingle();

        if (workerError !== null || workerData === null) {
          setAssignments([]);
          setNotes([]);
          setLoading(false);
          return;
        }

        const workerId = workerData.id;

        // Obtener todas las asignaciones activas de la trabajadora
        const { data: assignmentRows, error: assignmentErr } = await supabase
          .from('assignments')
          .select(
            `
            id,
            assignment_type,
            schedule,
            start_date,
            end_date,
            users(name, surname)
          `
          )
          .eq('worker_id', workerId)
          .eq('status', 'active');

        if (assignmentErr === null && assignmentRows !== null) {
          const filtered = assignmentRows.filter((a) => {
            const t = (a.assignment_type ?? '').toLowerCase();
            return t === 'laborables' || t === 'flexible' || t === 'festivos';
          });
          setAssignments(filtered);
        }

        // Obtener todas las notas de la trabajadora
        const { data: noteRows, error: noteErr } = await supabase
          .from('worker_notes')
          .select(
            `
            id,
            assignment_id,
            worker_id,
            content,
            created_at,
            updated_at,
            assignment:assignments(
              users(name, surname)
            )
          `
          )
          .eq('worker_id', workerId)
          .order('created_at', { ascending: false });

        if (noteErr === null && noteRows !== null) {
          setNotes(noteRows);
        }
      } finally {
        setLoading(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, [user?.email]);

  const handleSaveNote = async (
    noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'>
  ): Promise<void> => {
    if (user?.email === undefined || user.email === '') return;

    try {
      // Buscar worker_id
      const { data: workerData } = await supabase
        .from('workers')
        .select('id')
        .ilike('email', user.email)
        .maybeSingle();

      if (!workerData) return;

      const noteToSave = {
        ...noteData,
        worker_id: workerData.id,
      };

      if (editingNote) {
        // Actualizar nota existente
        const { error } = await supabase
          .from('worker_notes')
          .update({
            content: noteToSave.content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingNote.id);

        if (error) throw error;

        // Actualizar estado local
        setNotes((prev) =>
          prev.map((note) => {
            if (note.id === editingNote.id) {
              return {
                ...note,
                content: noteToSave.content,
                updated_at: new Date().toISOString(),
              };
            }
            return note;
          })
        );
      } else {
        // Crear nueva nota
        const { data, error } = await supabase
          .from('worker_notes')
          .insert([noteToSave])
          .select(
            `
            id,
            assignment_id,
            worker_id,
            content,
            created_at,
            updated_at,
            assignment:assignments(
              users(name, surname)
            )
          `
          )
          .single();

        if (error) throw error;

        // Agregar a estado local
        setNotes((prev) => [data, ...prev]);
      }

      setEditingNote(null);
      setSelectedAssignment(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving note:', error);
      // eslint-disable-next-line no-alert
      alert('Error al guardar la nota. Inténtalo de nuevo.');
    }
  };

  const handleDeleteNote = async (noteId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('worker_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      // Remover de estado local
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting note:', error);
      // eslint-disable-next-line no-alert
      alert('Error al eliminar la nota. Inténtalo de nuevo.');
    }
  };

  const handleEditNote = (note: Note): void => {
    setEditingNote(note);
    setSelectedAssignment(note.assignment_id);
  };

  const handleCancelEdit = (): void => {
    setEditingNote(null);
    setSelectedAssignment(null);
  };

  const handleSaveWrapper = (
    noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'>
  ): void => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handleSaveNote(noteData);
  };

  const handleDeleteWrapper = (noteId: string): void => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handleDeleteNote(noteId);
  };

  const getAssignmentLabel = (assignmentId: string): string => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (assignment === undefined) return 'Servicio';

    const name = assignment.users?.name ?? '';
    const surname = assignment.users?.surname ?? '';
    const fullName = `${name} ${surname}`.trim();
    return fullName !== '' ? fullName : 'Servicio';
  };

  return (
    <ProtectedRoute requiredRole='worker'>
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <Link
                  href='/worker-dashboard'
                  className='text-gray-600 hover:text-gray-900'
                >
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 19l-7-7 7-7'
                    />
                  </svg>
                </Link>
                <div>
                  <h1 className='text-xl font-bold text-gray-900'>
                    📝 Notas Rápidas
                  </h1>
                  <p className='text-gray-600'>
                    Gestiona tus notas por servicio
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'>
            {/* Panel izquierdo - Crear nota */}
            <div className='lg:col-span-1'>
              <div className='bg-white rounded-2xl shadow-sm'>
                <div className='p-4 sm:p-6 border-b border-gray-200'>
                  <h2 className='text-lg sm:text-xl font-bold text-gray-900'>
                    ✏️ Crear Nueva Nota
                  </h2>
                  <p className='text-sm sm:text-base text-gray-600'>
                    Selecciona un servicio para crear una nota
                  </p>
                </div>

                <div className='p-4 sm:p-6'>
                  {loading ? (
                    <div className='text-center py-4'>
                      <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2'></div>
                      <p className='text-gray-600 text-sm sm:text-base'>
                        Cargando asignaciones...
                      </p>
                    </div>
                  ) : assignments.length === 0 ? (
                    <div className='text-center py-4'>
                      <p className='text-gray-600 text-sm sm:text-base'>
                        No tienes asignaciones activas.
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-2 sm:space-y-3'>
                      {assignments.map((assignment) => {
                        const label =
                          `${assignment.users?.name ?? ''} ${assignment.users?.surname ?? ''}`.trim() ??
                          'Servicio';
                        const isSelected = selectedAssignment === assignment.id;

                        return (
                          <button
                            key={assignment.id}
                            onClick={() =>
                              setSelectedAssignment(
                                isSelected ? null : assignment.id
                              )
                            }
                            className={`w-full text-left p-2 sm:p-3 rounded-lg border transition-colors ${
                              isSelected
                                ? 'bg-blue-50 border-blue-300 text-blue-900'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <p className='font-medium text-sm sm:text-base'>
                              {label}
                            </p>
                            <p className='text-xs sm:text-sm text-gray-600'>
                              {assignment.assignment_type}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {selectedAssignment !== null && (
                    <div className='mt-6'>
                      <NoteEditor
                        assignmentId={selectedAssignment}
                        assignmentLabel={getAssignmentLabel(selectedAssignment)}
                        existingNote={editingNote}
                        onSave={handleSaveWrapper}
                        onCancel={handleCancelEdit}
                        isEditing={editingNote !== null}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Panel derecho - Lista de notas */}
            <div className='lg:col-span-2'>
              <div className='bg-white rounded-2xl shadow-sm'>
                <div className='p-4 sm:p-6 border-b border-gray-200'>
                  <h2 className='text-lg sm:text-xl font-bold text-gray-900'>
                    📋 Mis Notas
                  </h2>
                  <p className='text-sm sm:text-base text-gray-600'>
                    {notes.length} notas creadas
                  </p>
                </div>

                <div className='p-4 sm:p-6'>
                  {loading ? (
                    <div className='text-center py-8'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
                      <p className='text-gray-600 text-sm sm:text-base'>
                        Cargando notas...
                      </p>
                    </div>
                  ) : notes.length === 0 ? (
                    <div className='text-center py-8'>
                      <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
                        <span className='text-2xl'>📝</span>
                      </div>
                      <p className='text-gray-600 mb-2 text-sm sm:text-base'>
                        No tienes notas creadas
                      </p>
                      <p className='text-xs sm:text-sm text-gray-500'>
                        Selecciona un servicio para crear tu primera nota
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-3 sm:space-y-4'>
                      {notes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          onEdit={handleEditNote}
                          onDelete={handleDeleteWrapper}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
