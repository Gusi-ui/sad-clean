-- Script para verificar y arreglar la configuración de worker_notes
-- Este script verifica el estado actual y arregla cualquier problema

-- 1. Verificar si la tabla existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'worker_notes') THEN
        RAISE NOTICE 'Tabla worker_notes existe';
    ELSE
        RAISE NOTICE 'Tabla worker_notes NO existe - creándola...';
        CREATE TABLE worker_notes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
            worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- 2. Verificar y crear índices
CREATE INDEX IF NOT EXISTS idx_worker_notes_worker_id ON worker_notes(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_notes_assignment_id ON worker_notes(assignment_id);
CREATE INDEX IF NOT EXISTS idx_worker_notes_created_at ON worker_notes(created_at);

-- 3. Habilitar RLS
ALTER TABLE worker_notes ENABLE ROW LEVEL SECURITY;

-- 4. Crear función para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Crear trigger
DROP TRIGGER IF EXISTS update_worker_notes_updated_at ON worker_notes;
CREATE TRIGGER update_worker_notes_updated_at
    BEFORE UPDATE ON worker_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Listar políticas existentes
SELECT 'Políticas existentes en worker_notes:' as info;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'worker_notes';

-- 7. Eliminar TODAS las políticas existentes de worker_notes
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'worker_notes'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON worker_notes';
        RAISE NOTICE 'Política eliminada: %', policy_record.policyname;
    END LOOP;
END $$;

-- 8. Crear políticas nuevas
CREATE POLICY "Workers can view their own notes" ON worker_notes
    FOR SELECT USING (
        worker_id IN (
            SELECT id FROM workers WHERE email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Workers can create their own notes" ON worker_notes
    FOR INSERT WITH CHECK (
        worker_id IN (
            SELECT id FROM workers WHERE email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Workers can update their own notes" ON worker_notes
    FOR UPDATE USING (
        worker_id IN (
            SELECT id FROM workers WHERE email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Workers can delete their own notes" ON worker_notes
    FOR DELETE USING (
        worker_id IN (
            SELECT id FROM workers WHERE email = auth.jwt() ->> 'email'
        )
    );

-- 9. Verificar políticas creadas
SELECT 'Políticas creadas en worker_notes:' as info;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'worker_notes';

-- 10. Mensaje final
SELECT 'Configuración de worker_notes completada exitosamente' as status;
