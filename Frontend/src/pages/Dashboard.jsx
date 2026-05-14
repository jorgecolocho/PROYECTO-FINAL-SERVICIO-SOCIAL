import { useEffect, useState } from 'react';
import api from '../services/apiClient';
import { PageHeader, StatCard, TableWrap, Th, Td, Badge, Btn, Spinner, useToast, Toast } from '../components/UI';

/* ── Generador PDF global ───────────────────────────────────────────────── */
function generarPDFGlobal({ estudiante: e, actividades, totalHoras, meta }) {
  const hoy    = new Date().toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' });
  const codigo = `USO-SS-GLOBAL-${e.id_usuario.toString().padStart(5, '0')}`;

  const filas = actividades.map(a => `
    <tr>
      <td>${a.titulo}</td>
      <td>${a.ubicacion || '—'}</td>
      <td>${a.horario   || '—'}</td>
      <td style="text-align:center;font-weight:700;color:#0A1B4E">${a.horas_acreditar}h</td>
      <td>${new Date(a.fecha_inscripcion).toLocaleDateString('es-SV')}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"/>
<title>Constancia Global de Servicio Social</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Georgia,serif;color:#1a1a2e;background:#fff}
  .page{width:794px;min-height:1123px;margin:0 auto;padding:55px 65px;position:relative}
  .border-outer{position:absolute;inset:18px;border:3px solid #0A1B4E;pointer-events:none}
  .border-inner{position:absolute;inset:24px;border:1px solid #c8a84b;pointer-events:none}
  .header{text-align:center;margin-bottom:30px}
  .logo-row{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:12px}
  .logo-box{width:50px;height:50px;background:#0A1B4E;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:17px;font-weight:700}
  .uni-name{font-size:19px;font-weight:700;color:#0A1B4E;letter-spacing:2px}
  .uni-sub{font-size:11px;color:#4a5578;letter-spacing:1px;margin-top:2px}
  .divider{height:2px;background:linear-gradient(90deg,transparent,#c8a84b,transparent);margin:14px auto;width:80%}
  .doc-title{font-size:22px;font-weight:700;color:#0A1B4E;letter-spacing:2px;text-transform:uppercase;margin:8px 0 2px}
  .doc-sub{font-size:12px;color:#4a5578}
  .badge{display:inline-block;background:#0fce8a;color:#fff;font-size:11px;font-weight:700;letter-spacing:1px;padding:4px 14px;border-radius:20px;margin:10px 0;text-transform:uppercase}
  .body-text{font-size:13.5px;line-height:1.9;color:#2d2d4e;margin:20px 0;text-align:justify}
  .body-text strong{color:#0A1B4E}
  .sgrid{display:grid;grid-template-columns:1fr 1fr;border:1px solid rgba(10,27,78,.15);border-radius:8px;overflow:hidden;margin:18px 0;font-size:12.5px}
  .sl{background:#f4f6fb;padding:9px 14px;font-weight:600;color:#0A1B4E;border-bottom:1px solid rgba(10,27,78,.08);border-right:1px solid rgba(10,27,78,.08)}
  .sv{padding:9px 14px;color:#2d2d4e;border-bottom:1px solid rgba(10,27,78,.08)}
  .act-title{font-size:13px;font-weight:700;color:#0A1B4E;margin:20px 0 8px;letter-spacing:.5px;text-transform:uppercase}
  table.acts{width:100%;border-collapse:collapse;font-size:12px}
  table.acts th{background:#0A1B4E;color:#fff;padding:9px 12px;text-align:left;font-weight:600}
  table.acts td{padding:8px 12px;border-bottom:1px solid rgba(10,27,78,.08);color:#2d2d4e}
  table.acts tr:nth-child(even) td{background:#f8f9fd}
  .total-row{display:flex;justify-content:flex-end;margin-top:10px}
  .total-box{background:#0A1B4E;color:#fff;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:700}
  .sello-row{display:flex;justify-content:space-between;align-items:flex-end;margin-top:40px}
  .sello-box{text-align:center;width:180px}
  .sello-line{border-top:1px solid #0A1B4E;margin-bottom:7px}
  .sello-label{font-size:10px;color:#4a5578}
  .sello-name{font-size:11px;font-weight:700;color:#0A1B4E}
  .sello-circle{width:100px;height:100px;border-radius:50%;border:3px solid #0A1B4E;margin:0 auto 14px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(10,27,78,.04)}
  .s1{font-size:8px;font-weight:700;color:#0A1B4E;letter-spacing:1px;text-align:center}
  .s2{font-size:17px;font-weight:700;color:#c8a84b}
  .s3{font-size:7px;color:#4a5578;text-align:center}
  .codigo{position:absolute;bottom:36px;right:65px;font-size:9.5px;color:#8d97b8}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="page">
  <div class="border-outer"></div><div class="border-inner"></div>
  <div class="header">
    <div class="logo-row">
      <div class="logo-box">USO</div>
      <div><div class="uni-name">UNIVERSIDAD DE SONSONATE</div><div class="uni-sub">SISTEMA DE SERVICIO SOCIAL</div></div>
    </div>
    <div class="divider"></div>
    <div class="doc-title">Constancia Global de Servicio Social</div>
    <div class="doc-sub">Documento oficial de culminación — ${totalHoras} horas acreditadas</div>
    <div class="badge">✓ Servicio social completado</div>
  </div>
  <div class="body-text">
    La <strong>Universidad de Sonsonate</strong>, a través de la Coordinación de Servicio Social,
    hace constar que el/la estudiante <strong>${e.nombre_completo}</strong> ha cumplido
    satisfactoriamente con el total de horas de servicio social requeridas, completando
    <strong>${totalHoras} horas</strong> distribuidas en ${actividades.length} actividad(es),
    superando el requisito mínimo de <strong>${meta} horas</strong>.
  </div>
  <div class="sgrid">
    <div class="sl">Nombre completo</div>    <div class="sv">${e.nombre_completo}</div>
    <div class="sl">Correo institucional</div><div class="sv">${e.correo_institucional}</div>
    <div class="sl">Carrera</div>             <div class="sv">${e.nombre_carrera || '—'}</div>
    <div class="sl">Facultad</div>            <div class="sv">${e.nombre_facultad || '—'}</div>
    <div class="sl">Total de horas</div>      <div class="sv"><strong>${totalHoras} horas ✓</strong></div>
    <div class="sl">Actividades</div>         <div class="sv">${actividades.length} completadas</div>
  </div>
  <div class="act-title">Detalle de actividades realizadas</div>
  <table class="acts">
    <thead><tr><th>Actividad</th><th>Ubicación</th><th>Horario</th><th>Horas</th><th>Fecha</th></tr></thead>
    <tbody>${filas}</tbody>
  </table>
  <div class="total-row"><div class="total-box">Total acreditado: ${totalHoras} horas</div></div>
  <div class="body-text" style="font-size:12.5px;margin-top:18px;">
    Se extiende la presente constancia en Sonsonate, El Salvador, a los <strong>${hoy}</strong>.
  </div>
  <div class="sello-row">
    <div class="sello-box">
      <div class="sello-circle">
        <span class="s1">UNIVERSIDAD<br/>DE SONSONATE</span>
        <span class="s2">USO</span>
        <span class="s3">SERVICIO<br/>SOCIAL</span>
      </div>
      <div class="sello-line"></div>
      <div class="sello-name">Coordinación de Servicio Social</div>
      <div class="sello-label">Firma y sello institucional</div>
    </div>
    <div style="text-align:center;font-size:12px;color:#4a5578;line-height:1.7">
      <div style="font-size:36px;margin-bottom:6px">🎓</div>
      <strong style="color:#0A1B4E;font-size:13px">Servicio Social Completado</strong><br/>
      <span style="font-size:11px">Código: <strong>${codigo}</strong></span><br/>
      <span style="font-size:11px">Emitido: ${hoy}</span>
    </div>
    <div class="sello-box">
      <div style="height:100px"></div>
      <div class="sello-line"></div>
      <div class="sello-name">Decano/a de Facultad</div>
      <div class="sello-label">Firma autorizante</div>
    </div>
  </div>
  <div class="codigo">Código: ${codigo} | Emitido el ${hoy}</div>
</div></body></html>`;

  const v = window.open('', '_blank', 'width=920,height=750');
  v.document.write(html);
  v.document.close();
  v.onload = () => v.print();
}

/* ── Componente principal ───────────────────────────────────────────────── */
export default function Dashboard() {
  const [inscripciones, setInscripciones] = useState([]);
  const [ofertas,       setOfertas]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [loadingRep,    setLoadingRep]    = useState(null);
  const { toast, show } = useToast();

  async function load() {
    try {
      const [i, o] = await Promise.all([api.get('/inscripciones'), api.get('/ofertas')]);
      setInscripciones(i.data);
      setOfertas(o.data);
    } catch { show('Error al cargar datos', 'error'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function cambiarEstado(id, estado) {
    try {
      await api.patch(`/inscripciones/${id}/estado`, { estado });
      show(`Estado actualizado a "${estado}"`);
      load();
    } catch { show('Error al actualizar', 'error'); }
  }

  async function handleReporteGlobal(estudianteId) {
    setLoadingRep(estudianteId);
    try {
      const { data } = await api.get(`/reportes/global/${estudianteId}`);
      generarPDFGlobal(data);
    } catch (err) {
      show(err?.response?.data?.error || 'Error al generar reporte', 'error');
    } finally {
      setLoadingRep(null);
    }
  }

  if (loading) return <Spinner />;

  const activas    = ofertas.filter(o => o.activo).length;
  const pendientes = inscripciones.filter(i => i.estado === 'pendiente').length;
  const finalizados= inscripciones.filter(i => i.estado === 'finalizado').length;
  const recientes  = [...inscripciones].slice(0, 8);

  // Calcula horas finalizadas por estudiante y filtra los que llegaron a 500h
  const horasPorEstudiante = {};
  const nombrePorEstudiante = {};
  const correoPorEstudiante = {};

  inscripciones.forEach(i => {
    if (i.estado === 'finalizado') {
      horasPorEstudiante[i.id_estudiante]  = (horasPorEstudiante[i.id_estudiante] || 0) + (i.horas_acreditar || 0);
      nombrePorEstudiante[i.id_estudiante] = i.estudiante_nombre;
      correoPorEstudiante[i.id_estudiante] = i.correo_institucional;
    }
  });

  const estudiantesCompletos = Object.entries(horasPorEstudiante)
    .filter(([, h]) => h >= 500)
    .map(([id, horas]) => ({
      id: Number(id),
      nombre: nombrePorEstudiante[id],
      correo: correoPorEstudiante[id],
      horas,
    }));

  return (
    <>
      <PageHeader title="Panel de control" subtitle="Resumen general del sistema de servicio social" />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Ofertas activas" value={activas}              sub="plazas disponibles"  color="blue"   />
        <StatCard label="Inscripciones"   value={inscripciones.length} sub="total registradas"   color="green"  />
        <StatCard label="Pendientes"      value={pendientes}           sub="por revisar"          color="amber"  />
        <StatCard label="Finalizados"     value={finalizados}          sub="servicio completado"  color="purple" />
      </div>

      {/* Inscripciones recientes */}
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Inscripciones recientes</div>
      <TableWrap>
        <thead><tr>
          <Th>Estudiante</Th><Th>Oferta</Th><Th>Fecha</Th><Th>Estado</Th><Th>Acción</Th>
        </tr></thead>
        <tbody>
          {recientes.length === 0 && (
            <tr><Td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Sin inscripciones aún</Td></tr>
          )}
          {recientes.map(i => (
            <tr key={i.id_inscripcion}>
              <Td><b style={{ color: 'var(--text)' }}>{i.estudiante_nombre?.split(' ').slice(0, 2).join(' ')}</b></Td>
              <Td>{i.oferta_titulo}</Td>
              <Td style={{ fontSize: 12 }}>{new Date(i.fecha_inscripcion).toLocaleDateString('es-SV')}</Td>
              <Td><Badge type={i.estado}>{i.estado}</Badge></Td>
              <Td>
                {i.estado === 'pendiente'  && <Btn variant="green"   onClick={() => cambiarEstado(i.id_inscripcion, 'aceptado')}>Aceptar</Btn>}
                {i.estado === 'aceptado'   && <Btn variant="outline" onClick={() => cambiarEstado(i.id_inscripcion, 'finalizado')}>Finalizar</Btn>}
                {i.estado === 'finalizado' && <span style={{ fontSize: 12, color: 'var(--text3)' }}>Completado</span>}
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      {/* ── Sección: Finalización de Servicio Social ── */}
      <div style={{ marginTop: 40 }}>

        {/* Encabezado de sección */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#0fce8a,#0be0b8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🎓</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Finalización de Servicio Social</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
              Estudiantes que completaron las 500 horas requeridas
            </div>
          </div>
          {estudiantesCompletos.length > 0 && (
            <div style={{
              marginLeft: 'auto',
              background: 'rgba(15,206,138,.12)', color: '#0a9e6a',
              border: '1px solid rgba(15,206,138,.25)',
              borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700,
            }}>
              {estudiantesCompletos.length} completado{estudiantesCompletos.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {estudiantesCompletos.length === 0 ? (
          /* Estado vacío */
          <div style={{
            background: 'var(--bg2)', border: '1px dashed var(--border)',
            borderRadius: 12, padding: '36px 24px', textAlign: 'center',
            color: 'var(--text3)', fontSize: 13,
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            Aún ningún estudiante ha completado las 500 horas de servicio social.
          </div>
        ) : (
          /* Tarjetas de estudiantes completos */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
            {estudiantesCompletos.map(est => (
              <div key={est.id} style={{
                background: 'var(--bg2)',
                border: '1px solid rgba(15,206,138,.25)',
                borderRadius: 12, padding: '18px 20px',
                display: 'flex', flexDirection: 'column', gap: 12,
                boxShadow: '0 2px 8px rgba(15,206,138,.08)',
              }}>
                {/* Info del estudiante */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(15,206,138,.15)', color: '#0a9e6a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, fontWeight: 700,
                  }}>
                    {est.nombre?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {est.nombre}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {est.correo}
                    </div>
                  </div>
                </div>

                {/* Horas */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>Horas acreditadas</div>
                  <div style={{
                    background: 'rgba(15,206,138,.12)', color: '#0a9e6a',
                    borderRadius: 8, padding: '3px 10px', fontSize: 13, fontWeight: 700,
                  }}>
                    {est.horas}h ✓
                  </div>
                </div>

                {/* Botón */}
                <button
                  onClick={() => handleReporteGlobal(est.id)}
                  disabled={loadingRep === est.id}
                  style={{
                    width: '100%',
                    background: loadingRep === est.id
                      ? 'var(--bg3)'
                      : 'linear-gradient(135deg,#0A1B4E,#1344b6)',
                    color: loadingRep === est.id ? 'var(--text3)' : '#fff',
                    border: 'none', borderRadius: 8, padding: '10px 0',
                    fontSize: 12, fontWeight: 700,
                    cursor: loadingRep === est.id ? 'not-allowed' : 'pointer',
                    letterSpacing: .3, transition: '.2s',
                  }}
                >
                  {loadingRep === est.id ? 'Generando…' : '📄 Descargar Constancia Global'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Toast toast={toast} />
    </>
  );
}