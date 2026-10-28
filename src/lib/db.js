const fs = require('fs');
const path = require('path');

// Safe file-based fallback storage if no remote Postgres database is connected yet
const STORAGE_FILE = path.join(process.cwd(), 'local-db.json');

function readLocalDb() {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      const initialData = {
        clients: [
          {
            id: 'client-smile-dental',
            name: 'Smile Dental Clinic Pune',
            websiteUrl: 'https://example-dental-clinic.com',
            businessType: 'Dental Clinic',
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India',
            phone: '+919876543210',
            email: 'contact@example-dental-clinic.com',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        audits: [],
        auditJobs: [],
        scheduledCrons: [
          {
            id: 'cron-monthly-smile',
            name: 'Monthly Smile Dental Audit',
            targetUrl: 'https://example-dental-clinic.com',
            cronExpression: '0 0 1 * *',
            enabled: true,
            lastRunAt: null,
            nextRunAt: new Date(Date.now() + 86400000 * 30).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const raw = fs.readFileSync(STORAGE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { clients: [], audits: [], auditJobs: [], scheduledCrons: [] };
  }
}

function writeLocalDb(data) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Failed to write local database file:', e);
  }
}

let prismaClientInstance = null;

function getPrisma() {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('placeholder')) {
    try {
      const { PrismaClient } = require('@prisma/client');
      if (!prismaClientInstance) {
        prismaClientInstance = new PrismaClient();
      }
      return prismaClientInstance;
    } catch (e) {
      console.warn('[DB] Prisma client failed to initialize, using local store fallback:', e.message);
    }
  }
  return null;
}

// Unified Database Access Layer
const db = {
  client: {
    async findMany() {
      const prisma = getPrisma();
      if (prisma) {
        try {
          return await prisma.client.findMany({ include: { audits: true }, orderBy: { createdAt: 'desc' } });
        } catch (e) {
          console.warn('[DB Fallback] prisma.client.findMany:', e.message);
        }
      }
      const data = readLocalDb();
      return data.clients.map((c) => ({
        ...c,
        audits: data.audits.filter((a) => a.clientId === c.id)
      }));
    },

    async findUnique({ where }) {
      const prisma = getPrisma();
      if (prisma) {
        try {
          return await prisma.client.findUnique({ where, include: { audits: true } });
        } catch (e) {
          console.warn('[DB Fallback] prisma.client.findUnique:', e.message);
        }
      }
      const data = readLocalDb();
      const client = data.clients.find((c) => c.id === where.id);
      if (!client) return null;
      return {
        ...client,
        audits: data.audits.filter((a) => a.clientId === client.id)
      };
    },

    async create({ data: input }) {
      const prisma = getPrisma();
      if (prisma) {
        try {
          return await prisma.client.create({ data: input });
        } catch (e) {
          console.warn('[DB Fallback] prisma.client.create:', e.message);
        }
      }
      const store = readLocalDb();
      const newClient = {
        id: 'client-' + Math.random().toString(36).substring(2, 9),
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.clients.unshift(newClient);
      writeLocalDb(store);
      return newClient;
    }
  },

  audit: {
    async findMany({ where = {}, take, orderBy } = {}) {
      const prisma = getPrisma();
      if (prisma) {
        try {
          return await prisma.audit.findMany({ where, take, orderBy: orderBy || { createdAt: 'desc' }, include: { client: true } });
        } catch (e) {
          console.warn('[DB Fallback] prisma.audit.findMany:', e.message);
        }
      }
      const store = readLocalDb();
      let res = store.audits;
      if (where.clientId) {
        res = res.filter((a) => a.clientId === where.clientId);
      }
      if (where.status) {
        res = res.filter((a) => a.status === where.status);
      }
      res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (take) res = res.slice(0, take);
      return res.map((a) => ({
        ...a,
        client: store.clients.find((c) => c.id === a.clientId) || null
      }));
    },

    async findUnique({ where }) {
      const prisma = getPrisma();
      if (prisma) {
        try {
          return await prisma.audit.findUnique({ where, include: { client: true } });
        } catch (e) {
          console.warn('[DB Fallback] prisma.audit.findUnique:', e.message);
        }
      }
      const store = readLocalDb();
      const audit = store.audits.find((a) => a.id === where.id);
      if (!audit) return null;
      return {
        ...audit,
        client: store.clients.find((c) => c.id === audit.clientId) || null
      };
    },

    async create({ data: input }) {
      const prisma = getPrisma();
      if (prisma) {
        try {
          return await prisma.audit.create({ data: input });
        } catch (e) {
          console.warn('[DB Fallback] prisma.audit.create:', e.message);
        }
      }
      const store = readLocalDb();
      const newAudit = {
        id: 'audit-' + Math.random().toString(36).substring(2, 9),
        status: 'QUEUED',
        progress: 0,
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.audits.unshift(newAudit);
      writeLocalDb(store);
      return newAudit;
    },

    async update({ where, data: updates }) {
      const prisma = getPrisma();
      if (prisma) {
        try {
          return await prisma.audit.update({ where, data: updates });
        } catch (e) {
          console.warn('[DB Fallback] prisma.audit.update:', e.message);
        }
      }
      const store = readLocalDb();
      const idx = store.audits.findIndex((a) => a.id === where.id);
      if (idx !== -1) {
        store.audits[idx] = {
          ...store.audits[idx],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        writeLocalDb(store);
        return store.audits[idx];
      }
      return null;
    }
  },

  scheduledCron: {
    async findMany() {
      const prisma = getPrisma();
      if (prisma) {
        try {
          return await prisma.scheduledCron.findMany();
        } catch (e) {}
      }
      return readLocalDb().scheduledCrons;
    }
  }
};

module.exports = { db, getPrisma };
