const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  if (!env.LINKS_KV) {
    return Response.json(
      { error: 'KV não configurado. Veja as instruções de setup.' },
      { status: 500, headers: CORS }
    );
  }

  try {
    if (request.method === 'GET') {
      const data = await env.LINKS_KV.get('oportunidades', { type: 'json' });
      return Response.json(data || [], { headers: CORS });
    }

    if (request.method === 'POST') {
      const nova = await request.json();
      nova.id = 'op-' + Date.now();
      nova.dataCriacao = nova.dataCriacao || new Date().toISOString().split('T')[0];
      nova.status = nova.status || 'prospectado';
      const lista = await env.LINKS_KV.get('oportunidades', { type: 'json' }) || [];
      lista.unshift(nova);
      await env.LINKS_KV.put('oportunidades', JSON.stringify(lista));
      return Response.json(nova, { headers: CORS });
    }

    if (request.method === 'PUT') {
      const atualizada = await request.json();
      const lista = await env.LINKS_KV.get('oportunidades', { type: 'json' }) || [];
      const idx = lista.findIndex(o => o.id === atualizada.id);
      if (idx > -1) lista[idx] = atualizada;
      await env.LINKS_KV.put('oportunidades', JSON.stringify(lista));
      return Response.json({ ok: true }, { headers: CORS });
    }

    if (request.method === 'DELETE') {
      const { id } = await request.json();
      const lista = await env.LINKS_KV.get('oportunidades', { type: 'json' }) || [];
      await env.LINKS_KV.put('oportunidades', JSON.stringify(lista.filter(o => o.id !== id)));
      return Response.json({ ok: true }, { headers: CORS });
    }

    return Response.json({ error: 'Método não suportado' }, { status: 405, headers: CORS });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
