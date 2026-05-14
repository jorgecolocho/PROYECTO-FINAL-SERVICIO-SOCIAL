import { useEffect, useState } from 'react';
import api from '../services/apiClient';
import { PageHeader, TableWrap, Th, Td, Badge, Spinner, useToast, Toast } from '../components/UI';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading]   = useState(true);
  const { toast, show } = useToast();

  useEffect(() => {
    api.get('/usuarios')
      .then(r => setUsuarios(r.data))
      .catch(() => show('Error al cargar usuarios','error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <>
      <PageHeader title="Usuarios" subtitle="Listado de todos los usuarios registrados" />
      <TableWrap>
        <thead><tr>
          <Th>Nombre</Th><Th>Correo</Th><Th>Carrera</Th><Th>Facultad</Th><Th>Materias</Th><Th>Rol</Th>
        </tr></thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id_usuario}>
              <Td><b style={{ color:'var(--text)' }}>{u.nombre_completo}</b></Td>
              <Td style={{ fontSize:12 }}>{u.correo_institucional}</Td>
              <Td style={{ fontSize:12 }}>{u.nombre_carrera || <span style={{ color:'var(--text3)' }}>—</span>}</Td>
              <Td style={{ fontSize:12 }}>{u.nombre_facultad || <span style={{ color:'var(--text3)' }}>—</span>}</Td>
              <Td>
                <span style={{
                  fontSize:12, padding:'3px 8px', borderRadius:4, fontWeight:500,
                  background: u.materias_aprobadas>=30 ? 'rgba(34,199,138,.15)' : 'rgba(245,166,35,.15)',
                  color: u.materias_aprobadas>=30 ? 'var(--green)' : 'var(--amber)'
                }}>{u.materias_aprobadas}</span>
              </Td>
              <Td><Badge type={u.rol}>{u.rol}</Badge></Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      <Toast toast={toast} />
    </>
  );
}
