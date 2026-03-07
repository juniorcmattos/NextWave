import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do banco de dados...");

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const user = await prisma.user.upsert({
    where: { email: "admin@nextwave.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@nextwave.com",
      password: hashedPassword,
      role: "admin",
    },
  });
  console.log("Usuário criado:", user.email);

  // Criar clientes de exemplo
  const clientes = [
    { name: "TechCorp Ltda", email: "contato@techcorp.com", phone: "(11) 99999-1111", company: "TechCorp", city: "São Paulo", state: "SP", status: "ativo" },
    { name: "Maria Silva", email: "maria@email.com", phone: "(21) 98888-2222", city: "Rio de Janeiro", state: "RJ", status: "ativo" },
    { name: "João Santos", email: "joao@email.com", phone: "(31) 97777-3333", city: "Belo Horizonte", state: "MG", status: "ativo" },
    { name: "StartupXYZ", email: "ola@startupxyz.com", phone: "(41) 96666-4444", company: "StartupXYZ", city: "Curitiba", state: "PR", status: "prospecto" },
    { name: "Carlos Oliveira", email: "carlos@email.com", phone: "(51) 95555-5555", city: "Porto Alegre", state: "RS", status: "ativo" },
    { name: "Ana Lima", email: "ana@email.com", phone: "(62) 94444-6666", city: "Goiânia", state: "GO", status: "inativo" },
  ];

  for (const cliente of clientes) {
    await prisma.client.create({
      data: { ...cliente, userId: user.id },
    });
  }
  console.log(`${clientes.length} clientes criados`);

  // Buscar clientes para associar transações
  const todosClientes = await prisma.client.findMany({ where: { userId: user.id } });
  const c1 = todosClientes[0];
  const c2 = todosClientes[1];
  const c3 = todosClientes[2];

  // Criar transações de exemplo
  const hoje = new Date();
  const transactions = [
    { description: "Desenvolvimento de Website", amount: 5500, type: "receita", category: "Desenvolvimento", status: "pago", paidAt: new Date(hoje.getFullYear(), hoje.getMonth(), 5), clientId: c1.id },
    { description: "Consultoria Mensal", amount: 3200, type: "receita", category: "Consultoria", status: "pago", paidAt: new Date(hoje.getFullYear(), hoje.getMonth(), 10), clientId: c2.id },
    { description: "Manutenção de Sistema", amount: 1800, type: "receita", category: "Manutenção", status: "pendente", dueDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 15), clientId: c3.id },
    { description: "Hospedagem e Domínio", amount: 350, type: "despesa", category: "Infraestrutura", status: "pago", paidAt: new Date(hoje.getFullYear(), hoje.getMonth(), 1) },
    { description: "Licença de Software", amount: 800, type: "despesa", category: "Software", status: "pago", paidAt: new Date(hoje.getFullYear(), hoje.getMonth(), 3) },
    { description: "Projeto App Mobile", amount: 12000, type: "receita", category: "Desenvolvimento", status: "pendente", dueDate: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 30), clientId: c1.id },
    { description: "Marketing Digital", amount: 2500, type: "receita", category: "Marketing", status: "cancelado", clientId: c2.id },
    { description: "Conta de Energia", amount: 450, type: "despesa", category: "Infraestrutura", status: "pago", paidAt: new Date(hoje.getFullYear(), hoje.getMonth(), 7) },
    { description: "Desenvolvimento de API", amount: 4200, type: "receita", category: "Desenvolvimento", status: "pago", paidAt: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 20), clientId: c3.id },
    { description: "Suporte Técnico", amount: 600, type: "receita", category: "Suporte", status: "pago", paidAt: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 25), clientId: c2.id },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({
      data: { ...tx, userId: user.id },
    });
  }
  console.log(`${transactions.length} transações criadas`);

  // Criar serviços/orçamentos de exemplo
  const services = [
    { title: "Website Corporativo", description: "Desenvolvimento completo de site responsivo", amount: 8500, status: "em_andamento", category: "Desenvolvimento", clientId: c1.id, startDate: new Date(hoje.getFullYear(), hoje.getMonth(), 1) },
    { title: "App Mobile iOS/Android", description: "Aplicativo mobile multiplataforma", amount: 18000, status: "aprovado", category: "Desenvolvimento", clientId: c1.id },
    { title: "Consultoria de TI", description: "Análise e consultoria em infraestrutura", amount: 3500, status: "enviado", category: "Consultoria", clientId: c2.id },
    { title: "E-commerce Completo", description: "Loja virtual com integração de pagamento", amount: 15000, status: "rascunho", category: "Desenvolvimento", clientId: c3.id },
    { title: "Manutenção Mensal", description: "Suporte e manutenção de sistemas", amount: 1200, status: "concluido", category: "Manutenção", clientId: c2.id },
    { title: "Design de Interface", description: "UI/UX para aplicação web", amount: 4500, status: "cancelado", category: "Design", clientId: c3.id },
  ];

  for (const service of services) {
    await prisma.service.create({
      data: { ...service, userId: user.id },
    });
  }
  console.log(`${services.length} serviços criados`);

  // Criar eventos de exemplo
  const events = [
    { title: "Reunião TechCorp", description: "Apresentação do progresso do projeto", startDate: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 2, 14, 0), type: "reuniao", status: "agendado", clientId: c1.id },
    { title: "Call com Maria Silva", description: "Alinhamento de requisitos", startDate: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 4, 10, 0), type: "call", status: "agendado", clientId: c2.id },
    { title: "Entrega Website", description: "Entrega final do projeto", startDate: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 7, 9, 0), type: "reuniao", status: "agendado" },
    { title: "Revisão do App", description: "Testes e validação", startDate: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 10, 15, 0), type: "tarefa", status: "agendado" },
  ];

  for (const event of events) {
    await prisma.event.create({
      data: { ...event, userId: user.id },
    });
  }
  console.log(`${events.length} eventos criados`);

  console.log("\nSeed concluido com sucesso!");
  console.log("Login: admin@nextwave.com");
  console.log("Senha: admin123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
