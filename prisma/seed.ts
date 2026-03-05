// file: prisma/seed.ts
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ========== SUAS IMAGENS DO CLOUDINARY ==========
const GALLERY = [
  "https://res.cloudinary.com/dwykaetby/image/upload/v1772712180/cuias-lazaretti/dai3tjxbcknuqaulclrf.webp",
  "https://res.cloudinary.com/dwykaetby/image/upload/v1772712162/cuias-lazaretti/guskzhpqkyeglnb0wgio.webp",
  "https://res.cloudinary.com/dwykaetby/image/upload/v1772712032/cuias-lazaretti/s0nfxokfnlmix7xfsdws.webp",
  "https://res.cloudinary.com/dwykaetby/image/upload/v1772711797/cuias-lazaretti/gv9jw0hgo723mvugfhbc.jpg",
  "https://res.cloudinary.com/dwykaetby/image/upload/v1772711780/cuias-lazaretti/ra4axci79qq8qfb9uwye.jpg",
  "https://res.cloudinary.com/dwykaetby/image/upload/v1772711757/cuias-lazaretti/oyk2rzvc8osvci91nqr4.jpg",
  "https://res.cloudinary.com/dwykaetby/image/upload/v1772711709/cuias-lazaretti/ajkwdgwu2msdoybj2g18.jpg",
  "https://res.cloudinary.com/dwykaetby/image/upload/v1772711675/cuias-lazaretti/qb0ikdh5pkmnqaswvbsx.jpg",
];

function pickImg(i: number) {
  const url = GALLERY[i % GALLERY.length];
  return { url, alt: "Produto Cuias Lazaretti", sortOrder: 0 };
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function main() {
  // ========== ADMIN USER ==========
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@cuiaslazaretti.com.br";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "TROCAR_EM_PRODUCAO";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: UserRole.ADMIN },
    create: { email: adminEmail, passwordHash, role: UserRole.ADMIN },
  });

  // ========== 4 CATEGORIAS ==========
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

  const catFacas = await prisma.category.upsert({
    where: { slug: "facas" },
    update: {},
    create: { name: "Facas", slug: "facas", isActive: true, sortOrder: 3 },
  });

  const catAcess = await prisma.category.upsert({
    where: { slug: "acessorios" },
    update: {},
    create: { name: "Acessórios", slug: "acessorios", isActive: true, sortOrder: 4 },
  });

  console.log("✅ Categorias criadas");

  // ========== 20 PRODUTOS ==========
  type ProductDraft = {
    name: string;
    categoryId: string;
    description: string;
    care: string | null;
    isPersonalized: boolean;
    productionDays: number;
    isFeatured: boolean;
    isNew: boolean;
    images: { url: string; alt: string; sortOrder: number }[];
    variants: Array<{
      sku: string;
      size?: string | null;
      finish?: string | null;
      color?: string | null;
      personalization?: string | null;
      priceCents: number;
      compareAtCents?: number | null;
      stock: number;
    }>;
  };

  const productsToCreate: ProductDraft[] = [];

  // --- Nomes ---
  const cuiaNames = [
    "Cuia Torpedo Premium — Lisa",
    "Cuia Torpedo Premium — Trabalhada",
    "Cuia Gajeta — Lisa",
    "Cuia Gajeta — Resinada",
    "Cuia Coquinho — Pintada",
    "Cuia Entalhada — Personalizável",
    "Cuia Premium Preta — Lisa",
    "Cuia Verde Musgo — Trabalhada",
  ];

  const bombaNames = [
    "Bomba Inox — Bico Fino",
    "Bomba Inox — Bico Largo",
    "Bomba Alpaca — Premium",
    "Bomba Inox — Desmontável",
  ];

  const facaNames = [
    "Faca Campeira — Cabo Madeira",
    "Faca Gaúcha — Full Tang",
    "Faca Artesanal — Bainha Couro",
    "Faca Picanheira — Premium",
  ];

  const acessNames = [
    "Kit Limpeza para Bomba",
    "Porta Erva — Couro",
    "Porta Cuia — Couro",
    "Escovinha de Limpeza",
  ];

  // --- Funções de criação ---
  function addCuia(i: number, name: string) {
    const personalized = name.toLowerCase().includes("personaliz");
    const slug = slugify(name);
    productsToCreate.push({
      name,
      categoryId: catCuia.id,
      description: "Acabamento premium e pegada confortável. Feita pra mate diário com presença.",
      care: "Evite imersão prolongada. Seque após uso. Não usar lava-louças.",
      isPersonalized: personalized,
      productionDays: personalized ? 5 : 0,
      isFeatured: i < 4,
      isNew: i % 2 === 0,
      images: [pickImg(i)],
      variants: [
        {
          sku: `CLZ-${slug.toUpperCase().slice(0, 25)}-1`,
          size: "Médio",
          finish: name.includes("Trabalhada")
            ? "Trabalhada"
            : name.includes("Resinada")
            ? "Resinada"
            : name.includes("Pintada")
            ? "Pintada"
            : "Lisa",
          color: i % 3 === 0 ? "Marrom" : i % 3 === 1 ? "Natural" : "Preta",
          personalization: personalized ? "Sim" : "Não",
          priceCents: 14990 + i * 500,
          compareAtCents: 17990 + i * 500,
          stock: 8 + (i % 7),
        },
      ],
    });
  }

  function addBomba(i: number, name: string) {
    const slug = slugify(name);
    productsToCreate.push({
      name,
      categoryId: catBombas.id,
      description: "Fluxo firme e fácil de limpar. Material resistente e acabamento elegante.",
      care: "Lave após uso. Evite abrasivos fortes.",
      isPersonalized: false,
      productionDays: 0,
      isFeatured: i < 2,
      isNew: true,
      images: [pickImg(i + 2)],
      variants: [
        {
          sku: `CLZ-${slug.toUpperCase().slice(0, 25)}-1`,
          finish: name.toLowerCase().includes("alpaca") ? "Alpaca" : "Inox",
          color: "Prata",
          personalization: "Não",
          priceCents: 6990 + i * 800,
          compareAtCents: 8990 + i * 800,
          stock: 18 + (i % 10),
        },
      ],
    });
  }

  function addFaca(i: number, name: string) {
    const slug = slugify(name);
    productsToCreate.push({
      name,
      categoryId: catFacas.id,
      description: "Corte preciso com pegada firme. Peça premium pra quem valoriza ferramenta boa.",
      care: "Seque após uso. Evite guardar úmida. Afiar periodicamente.",
      isPersonalized: false,
      productionDays: 0,
      isFeatured: i < 2,
      isNew: i % 2 === 0,
      images: [pickImg(i + 4)],
      variants: [
        {
          sku: `CLZ-${slug.toUpperCase().slice(0, 25)}-1`,
          size: null,
          finish: "Aço",
          color: "Madeira",
          personalization: "Não",
          priceCents: 15990 + i * 1200,
          compareAtCents: null,
          stock: 4 + (i % 4),
        },
      ],
    });
  }

  function addAcess(i: number, name: string) {
    const slug = slugify(name);
    productsToCreate.push({
      name,
      categoryId: catAcess.id,
      description: "Acessório essencial pra teu mate ficar completo e bem cuidado.",
      care: null,
      isPersonalized: false,
      productionDays: 0,
      isFeatured: false,
      isNew: false,
      images: [pickImg(i + 6)],
      variants: [
        {
          sku: `CLZ-${slug.toUpperCase().slice(0, 25)}-1`,
          priceCents: 2990 + i * 700,
          compareAtCents: null,
          stock: 20 + (i % 25),
          personalization: "Não",
        },
      ],
    });
  }

  // --- Montar 20 produtos ---
  cuiaNames.forEach((n, i) => addCuia(i, n));
  bombaNames.forEach((n, i) => addBomba(i, n));
  facaNames.forEach((n, i) => addFaca(i, n));
  acessNames.forEach((n, i) => addAcess(i, n));

  // --- Criar no banco ---
  for (const p of productsToCreate) {
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

    // Imagens
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: p.images.map((img) => ({ ...img, productId: product.id })),
    });

    // Variantes
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

  console.log(`✅ ${productsToCreate.length} produtos criados`);

  // ========== SiteContent singleton + TrustBar ==========
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

  // ========== Cupom demo ==========
  await prisma.coupon.upsert({
    where: { code: "BEMVINDO10" },
    update: { active: true, type: "PERCENTAGE", value: 10 },
    create: { code: "BEMVINDO10", active: true, type: "PERCENTAGE", value: 10 },
  });

  // ========== HeroSlide (até 5) ==========
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

  // ========== HomeRail (5 automáticos) ==========
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

  console.log("🌱 Seed concluído!");
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
