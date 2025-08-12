-- Crear tabla para notas de trabajadoras
CREATE TABLE IF NOT EXISTS worker_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_worker_notes_worker_id ON worker_notes(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_notes_assignment_id ON worker_notes(assignment_id);
CREATE INDEX IF NOT EXISTS idx_worker_notes_created_at ON worker_notes(created_at);

-- Crear RLS (Row Level Security)
ALTER TABLE worker_notes ENABLE ROW LEVEL SECURITY;

-- Política para que las trabajadoras solo vean sus propias notas
CREATE POLICY "Workers can view their own notes" ON worker_notes
    FOR SELECT USING (
        worker_id IN (
            SELECT id FROM workers WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Política para que las trabajadoras puedan crear sus propias notas
CREATE POLICY "Workers can create their own notes" ON worker_notes
    FOR INSERT WITH CHECK (
        worker_id IN (
            SELECT id FROM workers WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Política para que las trabajadoras puedan actualizar sus propias notas
CREATE POLICY "Workers can update their own notes" ON worker_notes
    FOR UPDATE USING (
        worker_id IN (
            SELECT id FROM workers WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Política para que las trabajadoras puedan eliminar sus propias notas
CREATE POLICY "Workers can delete their own notes" ON worker_notes
    FOR DELETE USING (
        worker_id IN (
            SELECT id FROM workers WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_worker_notes_updated_at
    BEFORE UPDATE ON worker_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentar la tabla
COMMENT ON TABLE worker_notes IS 'Notas que las trabajadoras pueden crear para cada asignación de servicio';
COMMENT ON COLUMN worker_notes.assignment_id IS 'ID de la asignación a la que pertenece la nota';
COMMENT ON COLUMN worker_notes.worker_id IS 'ID de la trabajadora que creó la nota';
COMMENT ON COLUMN worker_notes.content IS 'Contenido de la nota';
COMMENT ON COLUMN worker_notes.created_at IS 'Fecha y hora de creación de la nota';
COMMENT ON COLUMN worker_notes.updated_at IS 'Fecha y hora de última actualización de la nota';
