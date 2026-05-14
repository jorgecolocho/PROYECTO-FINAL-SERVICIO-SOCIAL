import { useEffect, useState } from 'react';
import api from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { Spinner, useToast, Toast } from '../components/UI';

function initials(n = '') { return n.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase(); }

function ProgressBar({ label, value, max, colorA, colorB }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.70)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{value}/{max}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 3,
          background: `linear-gradient(90deg,${colorA} 0%,${colorB} 100%)`,
          transition: 'width 1s ease'
        }} />
      </div>
    </div>
  );
}

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
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Constancia Global de Servicio Social</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Georgia, serif; color:#1a1a2e; background:#fff; }
    .page { width:794px; min-height:1123px; margin:0 auto; padding:55px 65px; position:relative; }
    .border-outer { position:absolute; inset:18px; border:3px solid #0A1B4E; pointer-events:none; }
    .border-inner { position:absolute; inset:24px; border:1px solid #c8a84b; pointer-events:none; }

    .header { text-align:center; margin-bottom:30px; }
    .logo-row { display:flex; align-items:center; justify-content:center; gap:14px; margin-bottom:12px; }
    .logo-box { width:50px; height:50px; background:#0A1B4E; border-radius:10px;
                display:flex; align-items:center; justify-content:center;
                color:#fff; font-size:17px; font-weight:700; }
    .uni-name { font-size:19px; font-weight:700; color:#0A1B4E; letter-spacing:2px; }
    .uni-sub  { font-size:11px; color:#4a5578; letter-spacing:1px; margin-top:2px; }
    .divider  { height:2px; background:linear-gradient(90deg,transparent,#c8a84b,transparent); margin:14px auto; width:80%; }
    .doc-title { font-size:22px; font-weight:700; color:#0A1B4E; letter-spacing:2px; text-transform:uppercase; margin:8px 0 2px; }
    .doc-sub   { font-size:12px; color:#4a5578; }

    /* Badge de completado */
    .badge-completado {
      display:inline-block; background:#0fce8a; color:#fff;
      font-size:11px; font-weight:700; letter-spacing:1px;
      padding:4px 14px; border-radius:20px; margin:10px 0;
      text-transform:uppercase;
    }

    .body-text { font-size:13.5px; line-height:1.9; color:#2d2d4e; margin:20px 0; text-align:justify; }
    .body-text strong { color:#0A1B4E; }

    /* Datos del estudiante */
    .student-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; border:1px solid rgba(10,27,78,.15); border-radius:8px; overflow:hidden; margin:18px 0; font-size:12.5px; }
    .student-grid .sg-row { display:contents; }
    .student-grid .sg-label { background:#f4f6fb; padding:9px 14px; font-weight:600; color:#0A1B4E; border-bottom:1px solid rgba(10,27,78,.08); border-right:1px solid rgba(10,27,78,.08); }
    .student-grid .sg-value { padding:9px 14px; color:#2d2d4e; border-bottom:1px solid rgba(10,27,78,.08); }

    /* Tabla de actividades */
    .act-title { font-size:13px; font-weight:700; color:#0A1B4E; margin:20px 0 8px; letter-spacing:.5px; text-transform:uppercase; }
    table.acts { width:100%; border-collapse:collapse; font-size:12px; }
    table.acts th { background:#0A1B4E; color:#fff; padding:9px 12px; text-align:left; font-weight:600; }
    table.acts td { padding:8px 12px; border-bottom:1px solid rgba(10,27,78,.08); color:#2d2d4e; }
    table.acts tr:nth-child(even) td { background:#f8f9fd; }

    /* Total */
    .total-row { display:flex; justify-content:flex-end; margin-top:10px; }
    .total-box { background:#0A1B4E; color:#fff; padding:10px 24px; border-radius:8px; font-size:14px; font-weight:700; }

    /* Firmas */
    .sello-row { display:flex; justify-content:space-between; align-items:flex-end; margin-top:40px; }
    .sello-box { text-align:center; width:180px; }
    .sello-line { border-top:1px solid #0A1B4E; margin-bottom:7px; }
    .sello-label { font-size:10px; color:#4a5578; }
    .sello-name  { font-size:11px; font-weight:700; color:#0A1B4E; }
    .sello-circle { width:100px; height:100px; border-radius:50%; border:3px solid #0A1B4E;
                    margin:0 auto 14px; display:flex; flex-direction:column;
                    align-items:center; justify-content:center; background:rgba(10,27,78,.04); }
    .sello-circle .s1 { font-size:8px; font-weight:700; color:#0A1B4E; letter-spacing:1px; text-align:center; }
    .sello-circle .s2 { font-size:17px; font-weight:700; color:#c8a84b; }
    .sello-circle .s3 { font-size:7px; color:#4a5578; text-align:center; }

    .codigo { position:absolute; bottom:36px; right:65px; font-size:9.5px; color:#8d97b8; }

    @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
  </style>
</head>
<body>
<div class="page">
  <div class="border-outer"></div>
  <div class="border-inner"></div>

  <div class="header">
    <div class="logo-row">
      <div class="logo-box">USO</div>
      <div>
        <div class="uni-name">UNIVERSIDAD DE SONSONATE</div>
        <div class="uni-sub">SISTEMA DE SERVICIO SOCIAL</div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="doc-title">Constancia Global de Servicio Social</div>
    <div class="doc-sub">Documento oficial de culminación — ${totalHoras} horas acreditadas</div>
    <div class="badge-completado">✓ Servicio social completado</div>
  </div>

  <div class="body-text">
    La <strong>Universidad de Sonsonate</strong>, a través de la Coordinación de Servicio Social,
    hace constar que el/la estudiante <strong>${e.nombre_completo}</strong> ha cumplido
    satisfactoriamente con el total de horas de servicio social requeridas, completando
    <strong>${totalHoras} horas</strong> distribuidas en ${actividades.length} actividad(es),
    superando el requisito mínimo de <strong>${meta} horas</strong> establecido por la institución.
  </div>

  <!-- Datos del estudiante -->
  <div class="student-grid">
    <div class="sg-label">Nombre completo</div>   <div class="sg-value">${e.nombre_completo}</div>
    <div class="sg-label">Correo institucional</div><div class="sg-value">${e.correo_institucional}</div>
    <div class="sg-label">Carrera</div>            <div class="sg-value">${e.nombre_carrera || '—'}</div>
    <div class="sg-label">Facultad</div>           <div class="sg-value">${e.nombre_facultad || '—'}</div>
    <div class="sg-label">Materias aprobadas</div> <div class="sg-value">${e.materias_aprobadas} / 60</div>
    <div class="sg-label">Total de horas</div>     <div class="sg-value"><strong>${totalHoras} horas ✓</strong></div>
  </div>

  <!-- Tabla de actividades -->
  <div class="act-title">Detalle de actividades realizadas</div>
  <table class="acts">
    <thead>
      <tr>
        <th>Actividad</th>
        <th>Ubicación</th>
        <th>Horario</th>
        <th>Horas</th>
        <th>Fecha</th>
      </tr>
    </thead>
    <tbody>${filas}</tbody>
  </table>

  <div class="total-row">
    <div class="total-box">Total acreditado: ${totalHoras} horas</div>
  </div>

  <div class="body-text" style="font-size:12.5px; margin-top:18px;">
    Se extiende la presente constancia a solicitud del interesado/a, en Sonsonate, El Salvador,
    a los <strong>${hoy}</strong>.
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

    <div style="text-align:center; font-size:12px; color:#4a5578; line-height:1.7;">
      <div style="font-size:36px; margin-bottom:6px;">🎓</div>
      <strong style="color:#0A1B4E; font-size:13px;">Servicio Social Completado</strong><br/>
      <span style="font-size:11px;">Código: <strong>${codigo}</strong></span><br/>
      <span style="font-size:11px;">Emitido: ${hoy}</span>
    </div>

    <div class="sello-box">
      <div style="height:100px;"></div>
      <div class="sello-line"></div>
      <div class="sello-name">Decano/a de Facultad</div>
      <div class="sello-label">Firma autorizante</div>
    </div>
  </div>

  <div class="codigo">Código: ${codigo} | Emitido el ${hoy}</div>
</div>
</body>
</html>`;

  const ventana = window.open('', '_blank', 'width=920,height=750');
  ventana.document.write(html);
  ventana.document.close();
  ventana.onload = () => ventana.print();
}

/* ── Componente Perfil ───────────────────────────────────────────────────── */
export default function Perfil() {
  const { user }  = useAuth();
  const [perfil,  setPerfil]  = useState(null);
  const [insc,    setInsc]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRep, setLoadingRep] = useState(false);
  const { toast, show } = useToast();

  useEffect(() => {
    Promise.all([api.get('/usuarios/me'), api.get('/inscripciones')])
      .then(([p, i]) => { setPerfil(p.data); setInsc(i.data); })
      .catch(() => show('Error al cargar', 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!perfil)  return null;

  const horasAcred = insc.filter(i => i.estado === 'finalizado').reduce((a, i) => a + (i.horas_acreditar || 0), 0);
  const elegible   = perfil.materias_aprobadas >= 30;
  const META       = 500;
  const completado = horasAcred >= META;

  async function handleReporteGlobal() {
    setLoadingRep(true);
    try {
      const { data } = await api.get(`/reportes/global/${user.id}`);
      generarPDFGlobal(data);
    } catch (err) {
      show(err?.response?.data?.error || 'Error al generar reporte', 'error');
    } finally {
      setLoadingRep(false);
    }
  }

  return (
    <>
      <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, fontWeight: 400, letterSpacing: -.3, marginBottom: 28, color: 'var(--text)' }} className="fade-up">
        Mi perfil
      </h1>

      <div style={{
        background: '#0A1B4E', borderRadius: 16, padding: '28px 32px', maxWidth: 580,
        boxShadow: '0 8px 32px rgba(10,27,78,.25)'
      }} className="fade-up">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(15,200,138,.25)', color: '#6fe0b8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, border: '2px solid rgba(15,200,138,.30)'
          }}>{initials(perfil.nombre_completo)}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{perfil.nombre_completo}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)' }}>{perfil.correo_institucional}</div>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.10)', marginBottom: 20 }} />

        {/* Meta grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
          {[
            ['Carrera',            perfil.nombre_carrera || 'No asignada'],
            ['Facultad',           perfil.nombre_facultad || '—'],
            ['Materias aprobadas', `${perfil.materias_aprobadas} / 60`],
            ['Elegibilidad',       elegible ? '✓ Apto para servicio' : 'Pendiente (mín. 30 materias)'],
          ].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5, fontWeight: 600 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: l === 'Elegibilidad' ? (elegible ? '#6fe0b8' : '#f5c46a') : 'rgba(255,255,255,0.85)' }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Progress bars */}
        <ProgressBar label="Avance académico"                    value={perfil.materias_aprobadas} max={60}  colorA="#c066ff" colorB="#4f8cff" />
        <ProgressBar label="Horas de servicio social acreditadas" value={horasAcred}               max={META} colorA="#0fce8a" colorB="#0be0b8" />

        {/* Botón constancia global — solo visible al completar 500h */}
        {completado && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
            <div style={{ fontSize: 12, color: '#6fe0b8', marginBottom: 12, fontWeight: 600 }}>
              🎓 ¡Felicidades! Completaste las {META} horas de servicio social.
            </div>
            <button
              onClick={handleReporteGlobal}
              disabled={loadingRep}
              style={{
                width: '100%',
                background: loadingRep ? 'rgba(255,255,255,0.10)' : 'linear-gradient(135deg,#0fce8a,#0be0b8)',
                color: loadingRep ? 'rgba(255,255,255,0.40)' : '#0A1B4E',
                border: 'none', borderRadius: 8, padding: '12px 0',
                fontSize: 13, fontWeight: 700, cursor: loadingRep ? 'not-allowed' : 'pointer',
                letterSpacing: .5, transition: '.2s',
              }}
            >
              {loadingRep ? 'Generando constancia…' : '📄 Descargar Constancia Global de Servicio Social'}
            </button>
          </div>
        )}
      </div>

      <Toast toast={toast} />
    </>
  );
}