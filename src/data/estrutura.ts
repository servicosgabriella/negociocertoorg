// ============================================================
// ESTRUTURA DE CATEGORIAS DO SITE - NEGÓCIO CERTO
// ============================================================
// Este arquivo é o mapa central do site.
// Toda vez que uma nova review for criada, ela deve ser
// registrada aqui dentro da categoria e subcategoria correta.
//
// COMO ADICIONAR UMA NOVA REVIEW:
// 1. Abra este arquivo
// 2. Encontre a categoria e subcategoria correta
// 3. Adicione um objeto no array `paginas` com label e href:
//    { label: "Nome da review", href: "/slug-da-review" }
//
// IMPORTANTE: o href aqui deve ser igual ao nome do arquivo
// criado em src/pages/. Ex: se o arquivo é
// src/pages/melhores-contabilidades-online.astro
// então o href deve ser "/melhores-contabilidades-online"
//
// A página da subcategoria lista automaticamente todas as
// reviews registradas nela.
// ============================================================

type Pagina = { label: string; href: string };

export const estrutura = {
  financas: {
    label: "Finanças",
    href: "/financas/",
    subcategorias: {
      contabilidade: {
        label: "Contabilidade Online",
        href: "/financas/contabilidade/",
        paginas: [
          { label: "Melhores Contabilidades Online", href: "/melhores-contabilidades-online" },
          { label: "Contabilidade Online ou Presencial: Qual Escolher em 2026?", href: "/contabilidade-online-ou-presencial" },
          { label: "Quanto Custa uma Contabilidade Online? [Preços 2026]", href: "/quanto-custa-uma-contabilidade-online" },
          { label: "Contabilidade Online para MEI: o Que Nenhuma Plataforma Te Conta Antes de Contratar", href: "/contabilidade-online-mei" }
        ] as Pagina[]
      },
      maquininhas: {
        label: "Maquininhas de Cartão",
        href: "/financas/maquininhas/",
        paginas: [
          { label: "Melhores Maquininhas que Aceitam Voucher Refeição (2026)", href: "/melhores-maquininhas-cartao-voucher-refeicao" }
        ] as Pagina[]
      },
      erp: {
        label: "ERP e Sistemas de Gestão",
        href: "/financas/erp/",
        paginas: [] as Pagina[]
      }
    }
  },
  planejamento: {
    label: "Planejamento",
    href: "/planejamento/",
    subcategorias: {
      plano_negocios: {
        label: "Plano de Negócios",
        href: "/planejamento/plano-de-negocios/",
        paginas: [
          { label: "Como Fazer um Plano de Negócios: Guia Completo e Prático (2026)", href: "/como-fazer-um-plano-de-negocios-guia-completo-e-pratico-2026" }
        ] as Pagina[]
      },
      registro_marca: {
        label: "Registro de Marca",
        href: "/planejamento/registro-de-marca/",
        paginas: [
          { label: "Quanto Custa Registrar uma Marca em 2026? (Valores Reais + Taxas Ocultas)", href: "/quanto-custa-registrar-uma-marca" },
          { label: "Como Registrar uma Marca no INPI em 2026: Passo a Passo Completo", href: "/como-registrar-uma-marca" }
        ] as Pagina[]
      }
    }
  },
  gestao: {
    label: "Gestão",
    href: "/gestao/",
    subcategorias: {
      pdv: {
        label: "Sistema PDV",
        href: "/gestao/sistema-pdv/",
        paginas: [
          { label: "Melhores Sistemas PDV por Tipo de Negócio (2026)", href: "/melhores-sistemas-pdv" }
        ] as Pagina[]
      },
      nfe: {
        label: "Nota Fiscal Eletrônica",
        href: "/gestao/nota-fiscal-eletronica/",
        paginas: [] as Pagina[]
      }
    }
  },
  rh: {
    label: "RH",
    href: "/rh/",
    subcategorias: {
      recrutamento: {
        label: "Plataforma de Recrutamento",
        href: "/rh/plataforma-de-recrutamento/",
        paginas: [] as Pagina[]
      },
      folha_pagamento: {
        label: "Folha de Pagamento Online",
        href: "/rh/folha-de-pagamento-online/",
        paginas: [] as Pagina[]
      }
    }
  },
  blog: {
    label: "Blog",
    href: "/blog/",
    subcategorias: {}
  }
};

export type Categoria = keyof typeof estrutura;

export function getBreadcrumb(
  categoria: string,
  paginaLabel: string,
  subcategoria?: { label: string; href: string }
) {
  const cat = estrutura[categoria as Categoria];
  const items: { label: string; href?: string }[] = [
    { label: "Início", href: "/" },
    { label: cat.label, href: cat.href },
  ];
  if (subcategoria) {
    items.push({ label: subcategoria.label, href: subcategoria.href });
  }
  items.push({ label: paginaLabel });
  return items;
}

export function getSubcategoria(categoria: string, subcategoriaKey: string) {
  const cat = estrutura[categoria as Categoria] as any;
  return cat.subcategorias?.[subcategoriaKey] ?? null;
}