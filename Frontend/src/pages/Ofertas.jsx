import { useEffect, useState } from 'react';
import api from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import {
  PageHeader, Btn, Tag, Badge, CupoBar, TableWrap, Th, Td,
  Modal, Field, Input, Select, Textarea, Spinner, useToast, Toast, EmptyState
} from '../components/UI';

const EMPTY_FORM = {
  titulo:'', descripcion:'', ubicacion:'', horario:'',
  horas_acreditar:150, cupo_maximo:5, id_carrera:'', imagen_url:'', activo:true
};

export default function Ofertas() {
  const { user } = useAuth();
  const isAdmin  = user?.rol === 'admin';

  const [ofertas,   setOfertas]   = useState([]);
  const [carreras,  setCarreras]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [query,     setQuery]     = useState('');
  const [modal,     setModal]     = useState(false);
  const [detModal,  setDetModal]  = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [editId,    setEditId]    = useState(null);
  const [saving,    setSaving]    = useState(false);
  const { toast, show } = useToast();

  async function load() {
    try {
      const [o, c] = await Promise.all([api.get('/ofertas'), api.get('/carreras')]);
      setOfertas(o.data);
      setCarreras(c.data);
    } catch { show('Error al cargar', 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function openNew()   { setForm(EMPTY_FORM); setEditId(null); setModal(true); }
  function openEdit(o) {
    setForm({
      titulo: o.titulo, descripcion: o.descripcion, ubicacion: o.ubicacion||'',
      horario: o.horario||'', horas_acreditar: o.horas_acreditar,
      cupo_maximo: o.cupo_maximo, id_carrera: o.id_carrera||'',
      imagen_url: o.imagen_url||'', activo: o.activo
    });
    setEditId(o.id_oferta);
    setModal(true);
  }

  async function saveOferta() {
    if (!form.titulo || !form.descripcion) { show('Título y descripción requeridos','error'); return; }
    setSaving(true);
    try {
      const body = { ...form, id_carrera: form.id_carrera || null };
      if (editId) await api.put(`/ofertas/${editId}`, body);
      else        await api.post('/ofertas', body);
      show(editId ? 'Oferta actualizada' : 'Oferta creada');
      setModal(false);
      load();
    } catch (e) { show(e.response?.data?.error || 'Error al guardar','error'); }
    finally { setSaving(false); }
  }

  async function toggleOferta(id) {
    try { await api.patch(`/ofertas/${id}/toggle`); show('Estado actualizado'); load(); }
    catch { show('Error','error'); }
  }

  async function inscribirse(id) {
    try {
      await api.post('/inscripciones', { id_oferta: id });
      show('¡Inscripción realizada! Estado: pendiente');
      setDetModal(null);
      load();
    } catch (e) { show(e.response?.data?.error || 'Error','error'); }
  }

  const filtered = ofertas.filter(o => {
    const coincideQuery   = !query || o.titulo.toLowerCase().includes(query.toLowerCase());
    const coincideCarrera = isAdmin || !o.id_carrera || o.id_carrera === user?.id_carrera;
    return coincideQuery && coincideCarrera;
  });

  if (loading) return <Spinner />;

  return (
    <>
      <PageHeader
        title={isAdmin ? 'Gestión de ofertas' : 'Ofertas disponibles'}
        subtitle={isAdmin ? 'Crea, edita y administra las plazas disponibles' : 'Plazas abiertas para tu carrera y el sistema general'}
      />

      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        <input
          value={query} onChange={e=>setQuery(e.target.value)}
          placeholder="Buscar oferta…"
          style={{ flex:1, background:'#fff', border:'1px solid rgba(10,27,78,.15)', borderRadius:8, padding:'9px 14px', fontFamily:'inherit', fontSize:13, color:'var(--text)', outline:'none', boxShadow:'0 1px 3px rgba(10,27,78,.06)' }}
        />
        {isAdmin && <Btn variant="accent" onClick={openNew}>+ Nueva oferta</Btn>}
      </div>

      {/* ADMIN TABLE */}
      {isAdmin && (
        <TableWrap>
          <thead><tr>
            <Th>Título</Th><Th>Carrera</Th><Th>Horas</Th><Th>Cupo</Th><Th>Estado</Th><Th>Acciones</Th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><Td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>Sin ofertas</Td></tr>}
            {filtered.map(o => (
              <tr key={o.id_oferta}>
                <Td><b style={{ color:'var(--text)' }}>{o.titulo}</b></Td>
                <Td style={{ fontSize:12 }}>{o.nombre_carrera || <span style={{ color:'var(--text3)' }}>Todas</span>}</Td>
                <Td><Tag color="blue">{o.horas_acreditar}h</Tag></Td>
                <Td><CupoBar actual={o.cupo_actual} max={o.cupo_maximo} /></Td>
                <Td><Badge type={o.activo ? 'active' : 'inactive'}>{o.activo ? 'Activo' : 'Inactivo'}</Badge></Td>
                <Td>
                  <div style={{ display:'flex', gap:6 }}>
                    <Btn variant="outline" onClick={() => openEdit(o)}>Editar</Btn>
                    <Btn variant="danger"  onClick={() => toggleOferta(o.id_oferta)}>
                      {o.activo ? 'Desactivar' : 'Activar'}
                    </Btn>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      {/* STUDENT CARDS */}
      {!isAdmin && (
        filtered.length === 0
          ? <EmptyState msg="No hay ofertas disponibles en este momento." />
          : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:18 }}>
              {filtered.map(o => <OfertaCard key={o.id_oferta} o={o} user={user} onVer={() => setDetModal(o)} />)}
            </div>
      )}

      {/* MODAL FORM (admin) */}
      <Modal open={modal} onClose={() => setModal(false)}
        title={editId ? 'Editar oferta' : 'Nueva oferta'}
        footer={<>
          <Btn variant="outline" onClick={() => setModal(false)}>Cancelar</Btn>
          <Btn variant="accent"  onClick={saveOferta} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Btn>
        </>}
      >
        <Field label="Título"><Input value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} placeholder="Ej. Apoyo Comunitario en TI" /></Field>
        <Field label="Descripción"><Textarea value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} /></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Ubicación"><Input value={form.ubicacion} onChange={e=>setForm({...form,ubicacion:e.target.value})} placeholder="Campus Central" /></Field>
          <Field label="Horario"><Input value={form.horario} onChange={e=>setForm({...form,horario:e.target.value})} placeholder="Lunes a Viernes" /></Field>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Horas a acreditar"><Input type="number" value={form.horas_acreditar} onChange={e=>setForm({...form,horas_acreditar:+e.target.value})} min={1} /></Field>
          <Field label="Cupo máximo"><Input type="number" value={form.cupo_maximo} onChange={e=>setForm({...form,cupo_maximo:+e.target.value})} min={1} /></Field>
        </div>
        <Field label="Carrera (opcional)">
          <Select value={form.id_carrera} onChange={e=>setForm({...form,id_carrera:e.target.value})}>
            <option value="">Todas las carreras</option>
            {carreras.map(c => <option key={c.id_carrera} value={c.id_carrera}>{c.nombre_carrera}</option>)}
          </Select>
        </Field>
        <Field label="URL de imagen (opcional)"><Input value={form.imagen_url} onChange={e=>setForm({...form,imagen_url:e.target.value})} placeholder="https://…" /></Field>
      </Modal>

      {/* MODAL DETALLE (estudiante) */}
      {detModal && (
        <DetalleModal o={detModal} user={user} onClose={() => setDetModal(null)} onInscribir={inscribirse} />
      )}

      <Toast toast={toast} />
    </>
  );
}

function OfertaCard({ o, user, onVer }) {
  const pct = o.cupo_maximo > 0 ? Math.round((o.cupo_actual/o.cupo_maximo)*100) : 0;
  const barColor = pct > 80 ? 'var(--red)' : pct > 50 ? 'var(--amber)' : 'var(--green)';
  const isMyCarrera = o.id_carrera && o.id_carrera === user?.id_carrera;

  return (
    <div style={{
      background:'#fff', border:'1px solid rgba(10,27,78,.10)', borderRadius:'var(--radius)',
      overflow:'hidden', cursor:'pointer', transition:'border-color .2s, box-shadow .2s, transform .2s',
      boxShadow: '0 1px 4px rgba(10,27,78,.06)'
    }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(10,27,78,.22)';e.currentTarget.style.boxShadow='0 4px 16px rgba(10,27,78,.10)';e.currentTarget.style.transform='translateY(-2px)'}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(10,27,78,.10)';e.currentTarget.style.boxShadow='0 1px 4px rgba(10,27,78,.06)';e.currentTarget.style.transform='translateY(0)'}}
    >
      {o.imagen_url
        ? <img src={o.imagen_url} alt={o.titulo} style={{ width:'100%', height:140, objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
        : <div style={{ width:'100%', height:140, background:'linear-gradient(135deg,#e8eaf2 0%,#d0d5ea 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>💼</div>
      }
      <div style={{ padding:16 }}>
        <div style={{ fontSize:14, fontWeight:600, marginBottom:6, lineHeight:1.4, color:'var(--text)' }}>{o.titulo}</div>
        <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6, marginBottom:12,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {o.descripcion}
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
          <Tag color="blue">{o.horas_acreditar}h</Tag>
          {o.horario  && <Tag color="gray">{o.horario}</Tag>}
          {o.ubicacion && <Tag color="gray">{o.ubicacion}</Tag>}
          {isMyCarrera && <Tag color="green">Mi carrera</Tag>}
          {!o.id_carrera && <Tag color="amber">Todas las carreras</Tag>}
        </div>
        <div style={{ paddingTop:12, borderTop:'1px solid rgba(10,27,78,.08)' }}>
          <div style={{ fontSize:11, color:'var(--text3)', marginBottom:6 }}>{o.cupo_actual}/{o.cupo_maximo} inscritos</div>
          <div style={{ height:4, background:'#e8eaf2', borderRadius:2, marginBottom:14 }}>
            <div style={{ height:'100%', width:`${pct}%`, background:barColor, borderRadius:2 }} />
          </div>
          <button onClick={e=>{e.stopPropagation();onVer();}} style={{
            width:'100%', background:'none', border:'1px solid rgba(10,27,78,.20)',
            borderRadius:7, padding:'9px', fontFamily:'inherit', fontSize:13,
            fontWeight:500, color:'#0A1B4E', cursor:'pointer', transition:'.15s'
          }}
            onMouseEnter={e=>{e.currentTarget.style.background='#0A1B4E';e.currentTarget.style.color='#fff'}}
            onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='#0A1B4E'}}
          >
            Inscribirme
          </button>
        </div>
      </div>
    </div>
  );
}

function DetalleModal({ o, user, onClose, onInscribir }) {
  const pct = o.cupo_maximo > 0 ? Math.round((o.cupo_actual/o.cupo_maximo)*100) : 0;
  const isFull = o.cupo_actual >= o.cupo_maximo;

  return (
    <Modal open title={o.titulo} onClose={onClose}
      footer={<>
        <Btn variant="outline" onClick={onClose}>Cerrar</Btn>
        {!isFull && <Btn variant="accent" onClick={() => onInscribir(o.id_oferta)}>Inscribirme</Btn>}
        {isFull  && <Btn variant="outline" disabled>Sin cupo</Btn>}
      </>}
    >
      {o.imagen_url && <img src={o.imagen_url} alt={o.titulo} style={{ width:'100%', height:180, objectFit:'cover', borderRadius:8, marginBottom:16 }} onError={e=>e.target.style.display='none'} />}
      <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7, marginBottom:16 }}>{o.descripcion}</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
        {[['Ubicación', o.ubicacion||'—'], ['Horario', o.horario||'—'], ['Horas', o.horas_acreditar+'h'], ['Carrera', o.nombre_carrera||'Todas']].map(([l,v]) => (
          <div key={l}>
            <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:.5, marginBottom:4 }}>{l}</div>
            <div style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:12, color:'var(--text3)', marginBottom:4 }}>Cupo: {o.cupo_actual}/{o.cupo_maximo}</div>
      <div style={{ height:6, background:'#e8eaf2', borderRadius:3 }}>
        <div style={{ height:'100%', width:`${pct}%`, background: pct>80?'var(--red)':pct>50?'var(--amber)':'var(--green)', borderRadius:3 }} />
      </div>
    </Modal>
  );
}