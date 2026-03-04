import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@cuiaslazaretti.com.br";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "TROCAR_EM_PRODUCAO";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: UserRole.ADMIN },
    create: { email: adminEmail, passwordHash, role: UserRole.ADMIN },
  });

  const catCuia = await prisma.category.upsert({
    where: { slug: "cuias" },
    update: {},
    create: { name: "Cuias", slug: "cuias", isActive: true, sortOrder: 1 },
  });

  const catBombas = await prisma.category.upsert({
    where: { slug: "bombas" },
    update: {},
    create: { name: "Bombas", slug: "bombas", isActive: true, sortOrder: 2 },
  });

  const catAcess = await prisma.category.upsert({
    where: { slug: "acessorios" },
    update: {},
    create: { name: "Acessórios", slug: "acessorios", isActive: true, sortOrder: 3 },
  });

  const products = [
    {
      name: "Cuia Premium Torpedo — Lisa",
      categoryId: catCuia.id,
      description:
        "Acabamento premium e pegada confortável. Ideal pra mate diário com presença.",
      care: "Evite imersão prolongada. Seque após uso. Não usar lava-louças.",
      isPersonalized: false,
      productionDays: 0,
      isFeatured: true,
      isNew: true,
      images: [
        {
          url: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1600&q=80",
          alt: "Cuia premium torpedo",
          sortOrder: 1,
        },
      ],
      variants: [
        {
          sku: "CLZ-CUIA-TORP-LISA-M",
          size: "Médio",
          finish: "Lisa",
          color: "Marrom",
          personalization: "Não",
          priceCents: 14990,
          compareAtCents: 17990,
          stock: 12,
        },
        {
          sku: "CLZ-CUIA-TORP-LISA-G",
          size: "Grande",
          finish: "Lisa",
          color: "Marrom",
          personalization: "Não",
          priceCents: 15990,
          compareAtCents: 18990,
          stock: 8,
        },
      ],
    },
    {
      name: "Cuia Entalhada — Personalizável",
      categoryId: catCuia.id,
      description:
        "Uma peça com alma artesanal. Opção de personalização pra presente (ou pra tua roda de mate).",
      care: "Evite calor excessivo. Seque após uso. Armazene em local ventilado.",
      isPersonalized: true,
      productionDays: 5,
      isFeatured: true,
      isNew: false,
      images: [
        {
          url: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1600&q=80",
          alt: "Cuia entalhada",
          sortOrder: 1,
        },
      ],
      variants: [
        {
          sku: "CLZ-CUIA-ENT-M-SIM",
          size: "Médio",
          finish: "Entalhada",
          color: "Verde escuro",
          personalization: "Sim",
          priceCents: 19990,
          compareAtCents: null,
          stock: 6,
        },
        {
          sku: "CLZ-CUIA-ENT-M-NAO",
          size: "Médio",
          finish: "Entalhada",
          color: "Verde escuro",
          personalization: "Não",
          priceCents: 17990,
          compareAtCents: null,
          stock: 10,
        },
      ],
    },
    {
      name: "Bomba Inox — Bico Fino",
      categoryId: catBombas.id,
      description: "Fluxo firme e fácil de limpar. Inox com acabamento elegante.",
      care: "Lave após uso. Evite abrasivos fortes.",
      isPersonalized: false,
      productionDays: 0,
      isFeatured: false,
      isNew: true,
      images: [
        {
          url: "https://images.unsplash.com/photo-1520975682031-a57d49d2f5d4?auto=format&fit=crop&w=1600&q=80",
          alt: "Bomba inox bico fino",
          sortOrder: 1,
        },
      ],
      variants: [
        {
          sku: "CLZ-BOMBA-INOX-FINO",
          size: null,
          finish: "Inox",
          color: "Prata",
          personalization: "Não",
          priceCents: 6990,
          compareAtCents: 8990,
          stock: 25,
        },
      ],
    },
    {
      name: "Kit Limpeza para Bomba",
      categoryId: catAcess.id,
      description: "Escova e acessórios pra manter tua bomba sempre impecável.",
      care: null,
      isPersonalized: false,
      productionDays: 0,
      isFeatured: false,
      isNew: false,
      images: [
        {
          url: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1600&q=80",
          alt: "Kit limpeza",
          sortOrder: 1,
        },
      ],
      variants: [
        {
          sku: "CLZ-KIT-LIMPEZA-01",
          size: null,
          finish: null,
          color: null,
          personalization: "Não",
          priceCents: 2990,
          compareAtCents: null,
          stock: 40,
        },
      ],
    },
  ];

  for (const p of products) {
    const baseSlug = slugify(p.name);
    const existing = await prisma.product.findUnique({ where: { slug: baseSlug } });

    const product = existing
      ? await prisma.product.update({
          where: { id: existing.id },
          data: {
            name: p.name,
            description: p.description,
            care: p.care ?? undefined,
            isPersonalized: p.isPersonalized,
            productionDays: p.productionDays,
            isFeatured: p.isFeatured,
            isNew: p.isNew,
            isActive: true,
            categoryId: p.categoryId,
          },
        })
      : await prisma.product.create({
          data: {
            name: p.name,
            slug: baseSlug,
            description: p.description,
            care: p.care ?? undefined,
            isPersonalized: p.isPersonalized,
            productionDays: p.productionDays,
            isFeatured: p.isFeatured,
            isNew: p.isNew,
            isActive: true,
            categoryId: p.categoryId,
          },
        });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: p.images.map((img) => ({ ...img, productId: product.id })),
    });

    for (const v of p.variants) {
      await prisma.variant.upsert({
        where: { sku: v.sku },
        update: {
          productId: product.id,
          size: v.size ?? null,
          finish: v.finish ?? null,
          color: v.color ?? null,
          personalization: v.personalization ?? null,
          priceCents: v.priceCents,
          compareAtCents: v.compareAtCents ?? null,
          stock: v.stock,
          isActive: true,
        },
        create: {
          productId: product.id,
          sku: v.sku,
          size: v.size ?? null,
          finish: v.finish ?? null,
          color: v.color ?? null,
          personalization: v.personalization ?? null,
          priceCents: v.priceCents,
          compareAtCents: v.compareAtCents ?? null,
          stock: v.stock,
          isActive: true,
        },
      });
    }
  }

  // ===== SiteContent singleton + TrustBar =====
  const trust = [
    { title: "Acabamento premium", desc: "Detalhes que aparecem ao vivo." },
    { title: "Personalização sob medida", desc: "Prazo claro e produção artesanal." },
    { title: "Envio Brasil + retirada", desc: "PAC + retirada em Erechim/RS." },
    { title: "Compra segura", desc: "Checkout Pro Mercado Pago." },
  ];

  const existingContent = await prisma.siteContent.findFirst();
  if (!existingContent) {
    await prisma.siteContent.create({
      data: {
        heroTitle: "A cuia certa pro teu mate.",
        heroSubtitle:
          "Cuias premium, bombas e acessórios com estética clean. Envio Brasil + retirada em Erechim/RS.",
        heroBadgeText: "Artesanal Premium • Sul do Brasil",
        heroPrimaryButtonText: "Comprar agora",
        heroPrimaryButtonLink: "/produtos",
        heroSecondaryButtonText: "Ver cuias",
        heroSecondaryButtonLink: "/produtos?cat=cuias",
        heroImageUrl: null,
        institutionalTitle: "Personalização que faz sentido",
        institutionalText:
          "Escolha a variação personalizável e descreva no checkout. Prazo de produção aparece na página do produto.",
        institutionalImageUrl: null,
        scarcityText: "Produção artesanal — prazo médio 3 dias",
        trustBarJson: trust,
      },
    });
  }

  // ===== Cupom demo =====
  await prisma.coupon.upsert({
    where: { code: "BEMVINDO10" },
    update: { active: true, type: "PERCENTAGE", value: 10 },
    create: { code: "BEMVINDO10", active: true, type: "PERCENTAGE", value: 10 },
  });

  // ===== HeroSlide (até 5) =====
  if ((await prisma.heroSlide.count()) === 0) {
    await prisma.heroSlide.createMany({
      data: [
        {
          sortOrder: 0,
          isActive: true,
          badge: "Artesanal Premium • Sul do Brasil",
          title: "A cuia certa pro teu mate.",
          highlight: "premium",
          subtitle: "Cuias premium, bombas e acessórios com estética clean. Envio Brasil + retirada em Erechim/RS.",
          primaryText: "Comprar agora",
          primaryHref: "/produtos",
          secondaryText: "Ver cuias",
          secondaryHref: "/produtos?cat=cuias",
        },
        {
          sortOrder: 1,
          isActive: true,
          badge: "Personalização sob medida",
          title: "Presente que vira",
          highlight: "memória",
          subtitle: "Escolhe a peça e descreve a personalização no checkout. Nós cuidamos do resto.",
          primaryText: "Ver personalizáveis",
          primaryHref: "/produtos?personalizavel=1",
          secondaryText: "Falar no WhatsApp",
          secondaryHref: "/contato",
        },
        { sortOrder: 2, isActive: true, badge: "Novidades", title: "Chegou agora", highlight: "no site", subtitle: "Reposições e lançamentos — pega antes que acabe.", primaryText: "Ver novidades", primaryHref: "/produtos?new=1" },
        { sortOrder: 3, isActive: true, badge: "Prontas pra envio", title: "Produção", highlight: "rápida", subtitle: "Peças com prazo 0–1 dia de produção.", primaryText: "Ver prontas", primaryHref: "/produtos?ready=1" },
        { sortOrder: 4, isActive: true, badge: "Kit Mate", title: "Monte teu", highlight: "combo", subtitle: "Economiza no conjunto e sai com tudo pronto.", primaryText: "Ver combos", primaryHref: "/produtos" },
      ],
    });
  }

  // ===== HomeRail (5 automáticos) =====
  if ((await prisma.homeRail.count()) === 0) {
    await prisma.homeRail.createMany({
      data: [
        { sortOrder: 0, isActive: true, title: "Destaques da semana", subtitle: "Peças premium com acabamento caprichado.", hrefAll: "/produtos?featured=1", type: "FEATURED", limit: 10 },
        { sortOrder: 1, isActive: true, title: "Novidades", subtitle: "Lançamentos e reposições fresquinhas.", hrefAll: "/produtos?new=1", type: "NEW", limit: 10 },
        { sortOrder: 2, isActive: true, title: "Mais vendidos", subtitle: "Quando tiver pedidos pagos, isso fica perfeito.", hrefAll: "/produtos", type: "BEST_SELLERS", limit: 10 },
        { sortOrder: 3, isActive: true, title: "Personalizáveis", subtitle: "Gravação e detalhes que deixam com a tua cara.", hrefAll: "/produtos?personalizavel=1", type: "PERSONALIZED", limit: 10 },
        { sortOrder: 4, isActive: true, title: "Prontas pra envio", subtitle: "Prazo rápido (0–1 dia).", hrefAll: "/produtos?ready=1", type: "READY_TO_SHIP", limit: 10 },
      ],
    });
  }

  console.log("Seed concluído.");
  console.log(`Admin: ${adminEmail}`);
  console.log("Senha: (a do SEED_ADMIN_PASSWORD) TROCAR EM PRODUÇÃO");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
