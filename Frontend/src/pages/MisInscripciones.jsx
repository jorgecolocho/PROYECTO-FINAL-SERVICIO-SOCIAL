import { useEffect, useState } from 'react';
import api from '../services/apiClient';
import { PageHeader, StatCard, TableWrap, Th, Td, Badge, Tag, Spinner, useToast, Toast } from '../components/UI';

/* ── Generador de PDF sin dependencias externas ─────────────────────────── */
function generarPDF(d) {
  const fecha = new Date(d.fecha_inscripcion).toLocaleDateString('es-SV', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const hoy = new Date().toLocaleDateString('es-SV', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const codigo = `USO-SS-${d.id_inscripcion.toString().padStart(5, '0')}`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Constancia de Servicio Social</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Georgia, serif; color: #1a1a2e; background: #fff; }

    .page { width: 794px; min-height: 1123px; margin: 0 auto; padding: 60px 70px; position: relative; }

    /* Borde decorativo */
    .border-outer { position:absolute; inset:20px; border:3px solid #0A1B4E; pointer-events:none; }
    .border-inner { position:absolute; inset:26px; border:1px solid #c8a84b; pointer-events:none; }

    /* Encabezado */
    .header { text-align:center; margin-bottom:36px; }
    .logo-row { display:flex; align-items:center; justify-content:center; gap:16px; margin-bottom:14px; }
    .logo-box { width:52px; height:52px; background:#0A1B4E; border-radius:10px;
                display:flex; align-items:center; justify-content:center;
                color:#fff; font-size:18px; font-weight:700; letter-spacing:1px; }
    .uni-name { font-size:20px; font-weight:700; color:#0A1B4E; letter-spacing:2px; }
    .uni-sub  { font-size:12px; color:#4a5578; letter-spacing:1px; margin-top:2px; }

    .divider-gold { height:2px; background:linear-gradient(90deg,transparent,#c8a84b,transparent); margin:16px auto; width:80%; }

    .doc-title { font-size:26px; font-weight:700; color:#0A1B4E; letter-spacing:3px;
                 text-transform:uppercase; margin:10px 0 4px; }
    .doc-sub   { font-size:13px; color:#4a5578; letter-spacing:1px; }

    /* Cuerpo */
    .body-text { font-size:14px; line-height:2; color:#2d2d4e; margin:28px 0; text-align:justify; }
    .body-text strong { color:#0A1B4E; }

    /* Tabla de datos */
    .data-table { width:100%; border-collapse:collapse; margin:28px 0; font-size:13px; }
    .data-table td { padding:10px 14px; border:1px solid rgba(10,27,78,.15); }
    .data-table td:first-child { background:#f4f6fb; font-weight:600; color:#0A1B4E; width:38%; }
    .data-table td:last-child  { color:#2d2d4e; }

    /* Sello */
    .sello-row { display:flex; justify-content:space-between; align-items:flex-end; margin-top:60px; }
    .sello-box { text-align:center; width:200px; }
    .sello-line { border-top:1px solid #0A1B4E; margin-bottom:8px; }
    .sello-label { font-size:11px; color:#4a5578; }
    .sello-name  { font-size:12px; font-weight:700; color:#0A1B4E; }

    .sello-circle {
      width:110px; height:110px; border-radius:50%;
      border:3px solid #0A1B4E; margin:0 auto 16px;
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      background:rgba(10,27,78,.04);
    }
    .sello-circle .s1 { font-size:9px; font-weight:700; color:#0A1B4E; letter-spacing:1px; text-align:center; }
    .sello-circle .s2 { font-size:18px; font-weight:700; color:#c8a84b; }
    .sello-circle .s3 { font-size:8px;  color:#4a5578; text-align:center; }

    /* Código */
    .codigo { position:absolute; bottom:40px; right:70px; font-size:10px; color:#8d97b8; }

    @media print {
      body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    }
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
    <div class="divider-gold"></div>
    <div class="doc-title">Constancia de Servicio Social</div>
    <div class="doc-sub">Documento oficial de acreditación</div>
  </div>

  <div class="body-text">
    La <strong>Universidad de Sonsonate</strong>, a través de la Coordinación de Servicio Social,
    hace constar que el/la estudiante <strong>${d.nombre_completo}</strong>,
    con correo institucional <strong>${d.correo_institucional}</strong>, perteneciente a la carrera de
    <strong>${d.nombre_carrera || 'No especificada'}</strong>
    (Facultad de ${d.nombre_facultad || 'No especificada'}),
    completó satisfactoriamente su servicio social en la actividad denominada
    <strong>"${d.oferta_titulo}"</strong>, acumulando un total de
    <strong>${d.horas_acreditar} horas</strong> acreditadas.
  </div>

  <table class="data-table">
    <tr><td>Nombre completo</td>    <td>${d.nombre_completo}</td></tr>
    <tr><td>Correo institucional</td><td>${d.correo_institucional}</td></tr>
    <tr><td>Carrera</td>            <td>${d.nombre_carrera || '—'}</td></tr>
    <tr><td>Facultad</td>           <td>${d.nombre_facultad || '—'}</td></tr>
    <tr><td>Actividad</td>          <td>${d.oferta_titulo}</td></tr>
    <tr><td>Descripción</td>        <td>${d.oferta_descripcion || '—'}</td></tr>
    <tr><td>Ubicación</td>          <td>${d.ubicacion || '—'}</td></tr>
    <tr><td>Horario</td>            <td>${d.horario || '—'}</td></tr>
    <tr><td>Fecha de inscripción</td><td>${fecha}</td></tr>
    <tr><td>Horas acreditadas</td>  <td><strong>${d.horas_acreditar} horas</strong></td></tr>
    <tr><td>Estado</td>             <td><strong>FINALIZADO ✓</strong></td></tr>
  </table>

  <div class="body-text" style="font-size:13px; margin-top:16px;">
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

    <div style="text-align:center; font-size:12px; color:#4a5578; max-width:260px; line-height:1.6;">
      <div style="font-size:28px; margin-bottom:8px;">✅</div>
      <strong style="color:#0A1B4E;">Documento Validado</strong><br/>
      Código: <strong>${codigo}</strong><br/>
      Emitido: ${hoy}
    </div>

    <div class="sello-box">
      <div style="height:110px;"></div>
      <div class="sello-line"></div>
      <div class="sello-name">Decano/a de Facultad</div>
      <div class="sello-label">Firma autorizante</div>
    </div>
  </div>

  <div class="codigo">Código de verificación: ${codigo} | Emitido el ${hoy}</div>
</div>
</body>
</html>`;

  const ventana = window.open('', '_blank', 'width=900,height=700');
  ventana.document.write(html);
  ventana.document.close();
  ventana.onload = () => ventana.print();
}

/* ── Componente principal ────────────────────────────────────────────────── */
export default function MisInscripciones() {
  const [data,         setData]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [loadingRep,   setLoadingRep]   = useState(null); // id de la inscripción que está cargando
  const { toast, show } = useToast();

  useEffect(() => {
    api.get('/inscripciones')
      .then(r => setData(r.data))
      .catch(() => show('Error al cargar', 'error'))
      .finally(() => setLoading(false));
  }, []);

  async function handleReporte(inscripcionId) {
    setLoadingRep(inscripcionId);
    try {
      const { data: reporte } = await api.get(`/reportes/${inscripcionId}`);
      generarPDF(reporte);
    } catch {
      show('No se pudo generar el reporte', 'error');
    } finally {
      setLoadingRep(null);
    }
  }

  if (loading) return <Spinner />;

  const horasAcred   = data.filter(i => i.estado === 'finalizado').reduce((a, i) => a + (i.horas_acreditar || 0), 0);
  const horasActivas = data.filter(i => i.estado === 'aceptado').reduce((a, i)   => a + (i.horas_acreditar || 0), 0);

  return (
    <>
      <PageHeader title="Mis inscripciones" subtitle="Seguimiento de tus actividades de servicio social" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total"             value={data.length}  sub="inscripciones" color="purple" />
        <StatCard label="Horas acreditadas" value={horasAcred}   sub="finalizadas"   color="green"  />
        <StatCard label="Horas en curso"    value={horasActivas} sub="activas"        color="blue"   />
      </div>

      {data.length === 0
        ? <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
            Aún no tienes inscripciones. Explora las ofertas disponibles.
          </div>
        : <TableWrap>
            <thead><tr>
              <Th>Oferta</Th>
              <Th>Horas</Th>
              <Th>Ubicación</Th>
              <Th>Horario</Th>
              <Th>Fecha inscripción</Th>
              <Th>Estado</Th>
              <Th>Reporte</Th>
            </tr></thead>
            <tbody>
              {data.map(i => (
                <tr key={i.id_inscripcion}>
                  <Td><b style={{ color: 'var(--text)' }}>{i.oferta_titulo}</b></Td>
                  <Td><Tag color="blue">{i.horas_acreditar}h</Tag></Td>
                  <Td style={{ fontSize: 12 }}>{i.ubicacion || '—'}</Td>
                  <Td style={{ fontSize: 12 }}>{i.horario || '—'}</Td>
                  <Td style={{ fontSize: 12 }}>{new Date(i.fecha_inscripcion).toLocaleDateString('es-SV')}</Td>
                  <Td><Badge type={i.estado}>{i.estado}</Badge></Td>
                  <Td>
                    {i.estado === 'finalizado' ? (
                      <button
                        onClick={() => handleReporte(i.id_inscripcion)}
                        disabled={loadingRep === i.id_inscripcion}
                        style={{
                          background: loadingRep === i.id_inscripcion ? '#e0e4f0' : '#0A1B4E',
                          color: loadingRep === i.id_inscripcion ? '#4a5578' : '#fff',
                          border: 'none', borderRadius: 6,
                          padding: '6px 12px', fontSize: 12,
                          fontWeight: 600, cursor: loadingRep === i.id_inscripcion ? 'not-allowed' : 'pointer',
                          transition: '.2s', whiteSpace: 'nowrap',
                        }}
                      >
                        {loadingRep === i.id_inscripcion ? 'Generando…' : '📄 Constancia'}
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>—</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
      }
      <Toast toast={toast} />
    </>
  );
}